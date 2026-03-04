"use client";

import { useEffect } from "react";
import { usePlan } from "@/context/PlanProvider";

export function DayInitializer({ dayIndex }: { dayIndex: number }) {
  const { setSelectedIndex } = usePlan();

  useEffect(() => {
    // We only set it if it's within bounds
    if (dayIndex >= 0 && dayIndex < 365) {
      setSelectedIndex(dayIndex);
    }
  }, [dayIndex, setSelectedIndex]);

  return null;
}
