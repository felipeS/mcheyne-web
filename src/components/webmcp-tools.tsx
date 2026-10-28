'use client';

import { useEffect, useRef } from 'react';
import { usePlan } from '@/context/PlanProvider';
import { formatDateInput } from '@/lib/dateUtils';
import { countMissedDaysSinceLastRead } from '@/lib/planConstants';
import { registerWebMcpTools, type WebMcpTool } from '@/lib/webmcp';

type Plan = ReturnType<typeof usePlan>;

const MAX_MATCHES = 50;

const DAY_SCHEMA = {
  type: 'integer',
  minimum: 1,
  description: "Day number in the plan, starting at 1. Defaults to today's reading.",
};

function resolveIndex(plan: Plan, day: unknown) {
  if (day === undefined || day === null) return plan.indexForToday;
  const n = Number(day);
  if (!Number.isInteger(n) || n < 1 || n > plan.selections.length) {
    throw new Error(`day must be an integer between 1 and ${plan.selections.length}`);
  }
  return n - 1;
}

function describeDay(plan: Plan, index: number) {
  const selection = plan.selections[index];
  const passages = selection.passages.map((passage, id) => ({
    passage,
    read: plan.hasRead(passage, id),
  }));
  return {
    day: index + 1,
    isToday: index === plan.indexForToday,
    ...(selection.isLeap ? { isLeapDay: true } : {}),
    passages,
    complete: !selection.isLeap && passages.every((p) => p.read),
  };
}

// Parse as local midnight so the date matches what the settings dialog displays.
function parseDate(value: unknown) {
  const match = typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  if (!match) throw new Error('startDate must be a date in YYYY-MM-DD format');
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (formatDateInput(date) !== value) throw new Error(`${value} is not a valid date`);
  return date;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createTools(getPlan: () => Plan): WebMcpTool[] {
  return [
    {
      name: 'get_plan_status',
      title: 'Get reading plan status',
      description:
        "Get an overview of the user's M'Cheyne Bible reading plan: today's readings, plan mode, start date and overall progress. In calendar mode today's day follows the date since the start date; in self-paced mode it is the first day not fully read.",
      annotations: { readOnlyHint: true },
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        const plan = getPlan();
        const days = plan.selections.filter((s) => !s.isLeap);
        const total = days.reduce((n, s) => n + s.passages.length, 0);
        const read = days.reduce(
          (n, s) => n + s.passages.filter((p, i) => plan.hasRead(p, i)).length,
          0
        );
        return {
          today: describeDay(plan, plan.indexForToday),
          totalDays: plan.selections.length,
          mode: plan.isSelfPaced ? 'self-paced' : 'calendar',
          ...(plan.isSelfPaced
            ? {}
            : {
                startDate: formatDateInput(plan.startDate),
                missedDays: countMissedDaysSinceLastRead(
                  plan.selections,
                  plan.indexForToday - 1,
                  plan.hasRead
                ),
              }),
          passagesRead: read,
          passagesTotal: total,
          percentComplete: total === 0 ? 0 : Math.round((read / total) * 100),
        };
      },
    },
    {
      name: 'get_day_reading',
      title: 'Get readings for a day',
      description:
        'List the Bible passages for a day of the plan and whether each has been read. Passage names are in English, e.g. "Genesis 1" or "Luke 1:1-38".',
      annotations: { readOnlyHint: true },
      inputSchema: { type: 'object', properties: { day: DAY_SCHEMA } },
      execute: ({ day }) => {
        const plan = getPlan();
        return describeDay(plan, resolveIndex(plan, day));
      },
    },
    {
      name: 'find_passage',
      title: 'Find a passage in the plan',
      description:
        'Find the days of the plan that include a book or chapter, e.g. "Romans 8", "Psalms" or "1 John". Book names must be in English.',
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Book name, optionally with chapter.' },
        },
        required: ['query'],
      },
      execute: ({ query }) => {
        const q = typeof query === 'string' ? query.trim() : '';
        if (!q) throw new Error('query is required');
        // Whole-word match that doesn't run into a longer number: "John 1" skips "John 10".
        const pattern = new RegExp(`(^|\\s)${escapeRegExp(q)}(?!\\d)`, 'i');
        const plan = getPlan();
        const matches = plan.selections.flatMap((selection, index) =>
          selection.passages
            .map((passage, id) => ({ day: index + 1, passage, read: plan.hasRead(passage, id) }))
            .filter((m) => pattern.test(m.passage))
        );
        return { totalMatches: matches.length, matches: matches.slice(0, MAX_MATCHES) };
      },
    },
    {
      name: 'set_passages_read',
      title: 'Mark passages read or unread',
      description:
        "Mark passages of a day as read, or unread with read: false. Defaults to today's reading; omit passages to mark the whole day.",
      inputSchema: {
        type: 'object',
        properties: {
          day: DAY_SCHEMA,
          passages: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Passage names as returned by get_day_reading, e.g. "Genesis 1". Omit for every passage of the day.',
          },
          read: { type: 'boolean', default: true },
        },
      },
      execute: ({ day, passages, read }) => {
        const plan = getPlan();
        const index = resolveIndex(plan, day);
        const selection = plan.selections[index];
        if (selection.isLeap) throw new Error(`Day ${index + 1} is a leap day with no readings`);

        const all = selection.passages.map((desc, id) => ({ desc, id }));
        let entries = all;
        if (passages !== undefined) {
          if (!Array.isArray(passages)) throw new Error('passages must be an array of strings');
          entries = passages.map((name) => {
            const entry = all.find(
              (e) => e.desc.toLowerCase() === String(name).trim().toLowerCase()
            );
            if (!entry) {
              throw new Error(
                `"${name}" is not a reading for day ${index + 1}. Readings: ${selection.passages.join(', ')}`
              );
            }
            return entry;
          });
        }

        const value = read !== false;
        plan.setPassagesRead(entries, value);
        return { day: index + 1, read: value, passages: entries.map((e) => e.desc) };
      },
    },
    {
      name: 'show_day',
      title: 'Show a day',
      description:
        "Show the readings for a day in the app. Omit day to go back to today's reading.",
      inputSchema: { type: 'object', properties: { day: DAY_SCHEMA } },
      execute: ({ day }) => {
        const plan = getPlan();
        const index = resolveIndex(plan, day);
        plan.setSelectedIndex(index);
        return describeDay(plan, index);
      },
    },
    {
      name: 'set_self_paced',
      title: 'Turn self-paced mode on or off',
      description:
        "Turn self-paced mode on or off. Self-paced: today's reading is the first day not fully read. Off (calendar mode): today's reading follows the date since the plan's start date.",
      inputSchema: {
        type: 'object',
        properties: { selfPaced: { type: 'boolean' } },
        required: ['selfPaced'],
      },
      execute: ({ selfPaced }) => {
        if (typeof selfPaced !== 'boolean') throw new Error('selfPaced must be true or false');
        getPlan().setSelfPaced(selfPaced);
        return { mode: selfPaced ? 'self-paced' : 'calendar' };
      },
    },
    {
      name: 'set_start_date',
      title: 'Set the plan start date',
      description:
        'Set the date the user started the plan, for calendar mode. This replaces all saved progress: every passage before the new current day is marked read and everything else unread. Confirm with the user before calling.',
      annotations: { consequentialHint: true },
      inputSchema: {
        type: 'object',
        properties: { startDate: { type: 'string', format: 'date', description: 'YYYY-MM-DD' } },
        required: ['startDate'],
      },
      execute: ({ startDate }) => {
        const date = parseDate(startDate);
        getPlan().changeStartDate(date);
        return { startDate: formatDateInput(date) };
      },
    },
  ];
}

/** Exposes the reading plan to in-browser AI agents through WebMCP. Renders nothing. */
export function WebMcpTools() {
  const plan = usePlan();
  const planRef = useRef(plan);

  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

  // Register once and read the latest plan through the ref, so agents don't see the
  // tool list churn on every state change.
  useEffect(() => {
    const controller = new AbortController();
    registerWebMcpTools(
      createTools(() => planRef.current),
      controller.signal
    );
    return () => controller.abort();
  }, []);

  return null;
}
