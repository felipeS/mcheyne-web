'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { buildSelectionsWithLeap, indexForDateFromStartDate, v2Key } from '@/lib/planConstants';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export type PassageState = Record<string, boolean>;

type PlanContextType = {
  startDate: Date;
  setStartDate: (d: Date) => void;
  changeStartDate: (d: Date) => void;
  isSelfPaced: boolean;
  setSelfPaced: (v: boolean) => void;
  selections: { passages: string[]; isLeap?: boolean }[];
  indexForToday: number;
  selectedIndex: number;
  setSelectedIndex: (i: number) => void;
  getSelection: (index?: number) => { passages: string[]; isLeap?: boolean };
  hasRead: (desc: string, id: number) => boolean;
  toggleRead: (desc: string, id: number) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
};

const PlanContext = createContext<PlanContextType | null>(null);

const LS_KEYS = {
  startDate: 'startDate',
  selfPaced: 'selfPaced',
  passages: 'passages',
  onboarded: 'onboarded',
};

function loadDate(key: string, fallback: Date) {
  try {
    const v = localStorage.getItem(key);
    return v ? new Date(v) : fallback;
  } catch {
    return fallback;
  }
}

function loadBool(key: string, fallback = false) {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return fallback;
  }
}

function loadPassages(): PassageState {
  try {
    const raw = localStorage.getItem(LS_KEYS.passages);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistPassages(p: PassageState) {
  localStorage.setItem(LS_KEYS.passages, JSON.stringify(p));
}

export function PlanProvider({
  children,
  initialSelectedIndex,
}: {
  children: React.ReactNode;
  initialSelectedIndex?: number;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [startDate, setStartDateState] = useState<Date>(new Date());
  const [isSelfPaced, setSelfPacedState] = useState<boolean>(false);
  const [passages, setPassages] = useState<PassageState>({});
  const [onboarded, setOnboardedState] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex ?? 0);
  const [user, setUser] = useState<User | null>(null);

  const supabase = useMemo(() => createClient(), []);

  // Sync state to Supabase when user is logged in
  const syncToSupabase = useCallback(
    async (
      currentUser: User,
      currentPassages: PassageState,
      currentStartDate: Date,
      currentIsSelfPaced: boolean
    ) => {
      await supabase.from('user_progress').upsert(
        {
          id: currentUser.id,
          passages: currentPassages,
          start_date: currentStartDate.toISOString(),
          is_self_paced: currentIsSelfPaced,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    },
    [supabase]
  );

  // Hydrate from localStorage once on client
  useEffect(() => {
    const localStartDate = loadDate(LS_KEYS.startDate, new Date());
    const localSelfPaced = loadBool(LS_KEYS.selfPaced, false);
    const localPassages = loadPassages();

    setStartDateState(localStartDate);
    setSelfPacedState(localSelfPaced);
    setPassages(localPassages);
    setOnboardedState(loadBool(LS_KEYS.onboarded, false));

    // After hydrating from local, fetch session and merge with Supabase if logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        supabase
          .from('user_progress')
          .select('passages, start_date, is_self_paced')
          .eq('id', currentUser.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              const cloudPassages = data.passages as PassageState;
              const mergedPassages = { ...localPassages, ...cloudPassages };
              setPassages(mergedPassages);
              persistPassages(mergedPassages);

              if (data.start_date) {
                const cloudStartDate = new Date(data.start_date);
                setStartDateState(cloudStartDate);
                localStorage.setItem(LS_KEYS.startDate, cloudStartDate.toISOString());
              }

              if (data.is_self_paced !== null && data.is_self_paced !== undefined) {
                setSelfPacedState(data.is_self_paced);
                localStorage.setItem(LS_KEYS.selfPaced, String(data.is_self_paced));
              }

              // Save the merged result back to Supabase
              syncToSupabase(
                currentUser,
                mergedPassages,
                data.start_date ? new Date(data.start_date) : localStartDate,
                data.is_self_paced ?? localSelfPaced
              );
            } else if (error && error.code === 'PGRST116') {
              // Row does not exist, insert local data
              syncToSupabase(currentUser, localPassages, localStartDate, localSelfPaced);
            }
          });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    setHydrated(true);

    return () => subscription.unsubscribe();
  }, [supabase, syncToSupabase]);

  // Selections depend on startDate
  const selections = useMemo(() => buildSelectionsWithLeap(startDate), [startDate]);

  const indexForToday = useMemo(() => {
    if (!hydrated) return 0;
    if (isSelfPaced) {
      const idx = selections.findIndex((sel) =>
        sel.isLeap ? false : sel.passages.every((p, i) => passages[v2Key(p, i)])
      );
      return idx === -1 ? 0 : idx;
    } else {
      return indexForDateFromStartDate(new Date(), startDate, selections.length);
    }
  }, [hydrated, isSelfPaced, selections, passages, startDate]);

  // Keep selectedIndex in sync with "today" when the plan basis changes.
  // We use a ref to ignore the initial burst of updates caused by hydration
  // if an initialSelectedIndex was provided.
  const hasHydratedRef = useRef(false);
  const prevIndexForToday = useRef(indexForToday);

  useEffect(() => {
    if (!hydrated) return;

    // Mark hydration complete for future updates
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      prevIndexForToday.current = indexForToday;

      if (initialSelectedIndex !== undefined) {
        // We initialized from URL, do not overwrite with today's index
        return;
      } else {
        // Initializing from standard load, jump to today's index
        setSelectedIndex(indexForToday);
        return;
      }
    }

    // After hydration is complete, only sync if indexForToday genuinely changes
    // (e.g. from user changing start date or toggling self-paced mode)
    if (indexForToday !== prevIndexForToday.current) {
      prevIndexForToday.current = indexForToday;
      setSelectedIndex(indexForToday);
    }
  }, [indexForToday, hydrated, initialSelectedIndex]);

  const setStartDate = useCallback(
    (d: Date) => {
      setStartDateState(d);
      localStorage.setItem(LS_KEYS.startDate, d.toISOString());
      if (user) {
        syncToSupabase(user, passages, d, isSelfPaced);
      }
    },
    [user, syncToSupabase, passages, isSelfPaced]
  );

  const resetAll = useCallback(() => {
    setPassages({});
    persistPassages({});
    const now = new Date();
    setStartDate(now);
    if (user) {
      syncToSupabase(user, {}, now, isSelfPaced);
    }
  }, [setStartDate, user, syncToSupabase, isSelfPaced]);

  const changeStartDate = useCallback(
    (d: Date) => {
      // Reset and mark everything up to today complete
      resetAll();
      setStartDateState(d);
      localStorage.setItem(LS_KEYS.startDate, d.toISOString());

      const idxToday = indexForDateFromStartDate(new Date(), d, selections.length);
      const newPassages: PassageState = {};
      for (let i = 0; i < idxToday; i++) {
        const sel = selections[i];
        if (sel.isLeap) continue;
        sel.passages.forEach((desc, id) => {
          newPassages[v2Key(desc, id)] = true;
        });
      }
      setPassages(newPassages);
      persistPassages(newPassages);

      if (user) {
        syncToSupabase(user, newPassages, d, isSelfPaced);
      }
    },
    [resetAll, selections, user, syncToSupabase, isSelfPaced]
  );

  const setSelfPaced = useCallback(
    (v: boolean) => {
      setSelfPacedState(v);
      localStorage.setItem(LS_KEYS.selfPaced, String(v));
      if (user) {
        syncToSupabase(user, passages, startDate, v);
      }
    },
    [user, syncToSupabase, passages, startDate]
  );

  const hasRead = useCallback(
    (desc: string, id: number) => {
      return !!passages[v2Key(desc, id)];
    },
    [passages]
  );

  const toggleRead = useCallback(
    (desc: string, id: number) => {
      const key = v2Key(desc, id);
      const next = { ...passages, [key]: !passages[key] };
      if (!next[key]) delete next[key];
      setPassages(next);
      persistPassages(next);

      if (user) {
        syncToSupabase(user, next, startDate, isSelfPaced);
      }
    },
    [passages, user, syncToSupabase, startDate, isSelfPaced]
  );

  const getSelection = useCallback(
    (index?: number) => {
      return selections[index ?? indexForToday];
    },
    [selections, indexForToday]
  );

  const setOnboarded = useCallback((v: boolean) => {
    setOnboardedState(v);
    localStorage.setItem(LS_KEYS.onboarded, String(v));
  }, []);

  const value: PlanContextType = useMemo(
    () => ({
      startDate,
      setStartDate,
      changeStartDate,
      isSelfPaced,
      setSelfPaced,
      selections,
      indexForToday,
      selectedIndex,
      setSelectedIndex,
      getSelection,
      hasRead,
      toggleRead,
      onboarded,
      setOnboarded,
    }),
    [
      startDate,
      setStartDate,
      changeStartDate,
      isSelfPaced,
      setSelfPaced,
      selections,
      indexForToday,
      selectedIndex,
      getSelection,
      hasRead,
      toggleRead,
      onboarded,
      setOnboarded,
    ]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
