import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlanProvider, usePlan } from './PlanProvider';

function TestComponent() {
  const { selectedIndex, indexForToday } = usePlan();
  return (
    <div>
      <div data-testid="selected-index">{selectedIndex}</div>
      <div data-testid="index-for-today">{indexForToday}</div>
    </div>
  );
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
        })
      }),
      upsert: jest.fn().mockResolvedValue({}),
    })
  })
}));

describe('PlanProvider Hydration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with indexForToday when no initialSelectedIndex is provided', async () => {
    render(
      <PlanProvider>
        <TestComponent />
      </PlanProvider>
    );

    // Initial state before effects run is 0
    // After effects run, indexForToday takes over. Wait for it using act or findBy.
    const todayIndexElement = await screen.findByTestId('index-for-today');
    const todayIndex = parseInt(todayIndexElement.textContent || '0');

    const selectedIndexElement = screen.getByTestId('selected-index');
    expect(parseInt(selectedIndexElement.textContent || '0')).toBe(todayIndex);
  });

  it('should respect initialSelectedIndex on initial mount', async () => {
    const initialIndex = 42;
    render(
      <PlanProvider initialSelectedIndex={initialIndex}>
        <TestComponent />
      </PlanProvider>
    );

    const selectedIndexElement = await screen.findByTestId('selected-index');
    expect(parseInt(selectedIndexElement.textContent || '0')).toBe(initialIndex);
  });
});
