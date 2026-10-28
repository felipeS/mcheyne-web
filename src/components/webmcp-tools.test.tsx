import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { PlanProvider, usePlan } from '@/context/PlanProvider';
import { WebMcpTools } from './webmcp-tools';

type Passage = { passage: string; read: boolean };

// Loose union of the tool result shapes the assertions below look at.
type ToolResult = {
  error?: string;
  passages?: Passage[];
  matches?: Passage[];
  today?: { day: number; complete: boolean };
  mode?: string;
  startDate?: string;
  passagesRead?: number;
};

type RegisteredTool = {
  name: string;
  annotations?: Record<string, boolean>;
  execute: (input?: Record<string, unknown>) => Promise<ToolResult>;
};

function installModelContext() {
  const tools = new Map<string, RegisteredTool>();
  const registerTool = jest.fn((tool: RegisteredTool, options?: { signal?: AbortSignal }) => {
    tools.set(tool.name, tool);
    options?.signal?.addEventListener('abort', () => tools.delete(tool.name));
    return Promise.resolve();
  });
  Object.defineProperty(document, 'modelContext', {
    value: { registerTool },
    configurable: true,
  });
  return { tools, registerTool };
}

function SelectedIndex() {
  const { selectedIndex } = usePlan();
  return <div data-testid="selected-index">{selectedIndex}</div>;
}

async function renderTools() {
  const utils = render(
    <PlanProvider>
      <SelectedIndex />
      <WebMcpTools />
    </PlanProvider>
  );
  await screen.findByTestId('selected-index');
  return utils;
}

async function call(tool: RegisteredTool | undefined, input?: Record<string, unknown>) {
  let result: ToolResult = {};
  await act(async () => {
    result = await tool!.execute(input);
  });
  return result;
}

describe('WebMcpTools', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    delete (document as unknown as Record<string, unknown>).modelContext;
  });

  it('renders without WebMCP support', async () => {
    await renderTools();
    expect(screen.getByTestId('selected-index')).toBeInTheDocument();
  });

  it('registers the plan tools and unregisters them on unmount', async () => {
    const { tools } = installModelContext();
    const { unmount } = await renderTools();

    expect([...tools.keys()].sort()).toEqual([
      'find_passage',
      'get_day_reading',
      'get_plan_status',
      'set_passages_read',
      'set_self_paced',
      'set_start_date',
      'show_day',
    ]);
    expect(tools.get('get_day_reading')?.annotations).toEqual({ readOnlyHint: true });

    unmount();
    expect(tools.size).toBe(0);
  });

  it('reads and marks passages', async () => {
    const { tools } = installModelContext();
    await renderTools();

    expect(await call(tools.get('get_day_reading'), { day: 1 })).toEqual({
      day: 1,
      isToday: true,
      passages: [
        { passage: 'Genesis 1', read: false },
        { passage: 'Matthew 1', read: false },
        { passage: 'Ezra 1', read: false },
        { passage: 'Acts 1', read: false },
      ],
      complete: false,
    });

    // Back-to-back calls must not overwrite each other.
    await call(tools.get('set_passages_read'), { passages: ['genesis 1'] });
    await call(tools.get('set_passages_read'), { day: 1, passages: ['Acts 1'] });

    const day = await call(tools.get('get_day_reading'));
    expect(day.passages?.filter((p) => p.read)).toEqual([
      { passage: 'Genesis 1', read: true },
      { passage: 'Acts 1', read: true },
    ]);
    expect(JSON.parse(localStorage.getItem('passages')!)).toEqual({
      'Genesis 1+0': true,
      'Acts 1+3': true,
    });

    await call(tools.get('set_passages_read'), { day: 1 });
    expect((await call(tools.get('get_plan_status'))).today?.complete).toBe(true);

    await call(tools.get('set_passages_read'), { day: 1, read: false });
    expect((await call(tools.get('get_plan_status'))).passagesRead).toBe(0);
  });

  it('returns errors for invalid input instead of throwing', async () => {
    const { tools } = installModelContext();
    await renderTools();

    expect(await call(tools.get('get_day_reading'), { day: 0 })).toEqual({
      error: expect.stringContaining('day must be an integer between 1 and'),
    });
    expect(await call(tools.get('set_passages_read'), { day: 1, passages: ['Genesis 2'] })).toEqual(
      {
        error:
          '"Genesis 2" is not a reading for day 1. Readings: Genesis 1, Matthew 1, Ezra 1, Acts 1',
      }
    );
    expect(await call(tools.get('set_start_date'), { startDate: '2026-02-30' })).toEqual({
      error: '2026-02-30 is not a valid date',
    });
  });

  it('finds passages by whole book and chapter', async () => {
    const { tools } = installModelContext();
    await renderTools();

    const { matches } = await call(tools.get('find_passage'), { query: 'John 1' });
    const names = matches?.map((m) => m.passage);
    expect(names).toContain('John 1');
    expect(names).toContain('1 John 1');
    expect(names).not.toContain('John 10');
  });

  it('navigates to a day', async () => {
    const { tools } = installModelContext();
    await renderTools();

    await call(tools.get('show_day'), { day: 42 });
    expect(screen.getByTestId('selected-index')).toHaveTextContent('41');
  });

  it('updates plan settings', async () => {
    const { tools } = installModelContext();
    await renderTools();

    await call(tools.get('set_self_paced'), { selfPaced: true });
    expect((await call(tools.get('get_plan_status'))).mode).toBe('self-paced');

    await call(tools.get('set_self_paced'), { selfPaced: false });
    const start = new Date();
    start.setDate(start.getDate() - 3);
    const startDate = [
      start.getFullYear(),
      String(start.getMonth() + 1).padStart(2, '0'),
      String(start.getDate()).padStart(2, '0'),
    ].join('-');
    await call(tools.get('set_start_date'), { startDate });

    const status = await call(tools.get('get_plan_status'));
    expect(status.startDate).toBe(startDate);
    expect(status.today?.day).toBe(4);
    expect(status.passagesRead).toBe(12);
  });
});
