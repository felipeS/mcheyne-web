"use client"

import {createContext, useContext, useEffect, useMemo, useState} from 'react'
import { buildSelectionsWithLeap, indexForDateFromStartDate, v2Key } from '@/lib/planConstants'

export type PassageState = Record<string, boolean>

type PlanContextType = {
  startDate: Date
  setStartDate: (d: Date) => void
  changeStartDate: (d: Date) => void
  isSelfPaced: boolean
  setSelfPaced: (v: boolean) => void
  selections: { passages: string[]; isLeap?: boolean }[]
  indexForToday: number
  selectedIndex: number
  setSelectedIndex: (i: number) => void
  getSelection: (index?: number) => { passages: string[]; isLeap?: boolean }
  hasRead: (desc: string, id: number) => boolean
  toggleRead: (desc: string, id: number) => void
  onboarded: boolean
  setOnboarded: (v: boolean) => void
}

const PlanContext = createContext<PlanContextType | null>(null)

const LS_KEYS = {
  startDate: 'startDate',
  selfPaced: 'selfPaced',
  passages: 'passages',
  onboarded: 'onboarded'
}

function loadDate(key: string, fallback: Date) {
  try {
    const v = localStorage.getItem(key)
    return v ? new Date(v) : fallback
  } catch { return fallback }
}

function loadBool(key: string, fallback = false) {
  try { return localStorage.getItem(key) === 'true' } catch { return fallback }
}

function loadPassages(): PassageState {
  try {
    const raw = localStorage.getItem(LS_KEYS.passages)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function persistPassages(p: PassageState) {
  localStorage.setItem(LS_KEYS.passages, JSON.stringify(p))
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [startDate, setStartDateState] = useState<Date>(new Date())
  const [isSelfPaced, setSelfPacedState] = useState<boolean>(false)
  const [passages, setPassages] = useState<PassageState>({})
  const [onboarded, setOnboardedState] = useState<boolean>(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  // Hydrate from localStorage once on client
  useEffect(() => {
    setStartDateState(loadDate(LS_KEYS.startDate, new Date()))
    setSelfPacedState(loadBool(LS_KEYS.selfPaced, false))
    setPassages(loadPassages())
    setOnboardedState(loadBool(LS_KEYS.onboarded, false))
    setHydrated(true)
  }, [])

  // Selections depend on startDate
  const selections = useMemo(() => buildSelectionsWithLeap(startDate), [startDate])

  const indexForToday = useMemo(() => {
    if (!hydrated) return 0
    if (isSelfPaced) {
      const idx = selections.findIndex(sel => sel.isLeap ? false : sel.passages.every((p, i) => passages[v2Key(p, i)]))
      return idx === -1 ? 0 : idx
    } else {
      return indexForDateFromStartDate(new Date(), startDate, selections.length)
    }
  }, [hydrated, isSelfPaced, selections, passages, startDate])

  // Keep selectedIndex in sync with "today" when the plan basis changes
  useEffect(() => {
    setSelectedIndex(indexForToday)
  }, [indexForToday])

  function setStartDate(d: Date) {
    setStartDateState(d)
    localStorage.setItem(LS_KEYS.startDate, d.toISOString())
  }

  function resetAll() {
    setPassages({})
    persistPassages({})
    setStartDate(new Date())
  }

  function changeStartDate(d: Date) {
    // Reset and mark everything up to today complete
    resetAll()
    setStartDate(d)
    const idxToday = indexForDateFromStartDate(new Date(), d, selections.length)
    const newPassages: PassageState = {}
    for (let i = 0; i < idxToday; i++) {
      const sel = selections[i]
      if (sel.isLeap) continue
      sel.passages.forEach((desc, id) => { newPassages[v2Key(desc, id)] = true })
    }
    setPassages(newPassages)
    persistPassages(newPassages)
  }

  function setSelfPaced(v: boolean) {
    setSelfPacedState(v)
    localStorage.setItem(LS_KEYS.selfPaced, String(v))
  }

  function hasRead(desc: string, id: number) {
    return !!passages[v2Key(desc, id)]
  }

  function toggleRead(desc: string, id: number) {
    const key = v2Key(desc, id)
    const next = { ...passages, [key]: !passages[key] }
    if (!next[key]) delete next[key]
    setPassages(next)
    persistPassages(next)
  }

  function getSelection(index?: number) {
    return selections[index ?? indexForToday]
  }

  function setOnboarded(v: boolean) {
    setOnboardedState(v)
    localStorage.setItem(LS_KEYS.onboarded, String(v))
  }

  const value: PlanContextType = {
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
    setOnboarded
  }

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

export function usePlan() {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error('usePlan must be used within PlanProvider')
  return ctx
}

