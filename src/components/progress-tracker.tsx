"use client";

import { usePlan } from "@/context/PlanProvider";
import { useMemo } from "react";

export function ProgressTracker() {
  const { selections, hasRead, indexForToday, onboarded } = usePlan();

  const { total, completed } = useMemo(() => {
    let total = 0;
    let completed = 0;

    selections.forEach((selection) => {
      if (selection.isLeap) return;
      selection.passages.forEach((passage, id) => {
        total++;
        if (hasRead(passage, id)) {
          completed++;
        }
      });
    });

    return { total, completed };
  }, [selections, hasRead]);

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const missedDays = useMemo(() => {
    let count = 0;
    for (let i = indexForToday - 1; i >= 0; i--) {
      const selection = selections[i];
      if (selection.isLeap) continue;

      const hasAnyRead = selection.passages.some((passage, id) =>
        hasRead(passage, id)
      );

      if (hasAnyRead) {
        break;
      } else {
        count++;
      }
    }
    return count;
  }, [selections, hasRead, indexForToday]);

  if (!onboarded) {
    return null;
  }

  return (
    <div className="w-full px-4 pt-2 sm:px-6 lg:px-8">
      <div className="relative h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full bg-green-400"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-center text-xs text-gray-500">
        {completed} of {total} readings completed ({percentage}%)
      </p>
      {missedDays > 0 && (
        <p className="mt-1 text-center text-xs text-red-500">
          You&apos;ve missed {missedDays} {missedDays === 1 ? "day" : "days"}.
        </p>
      )}
    </div>
  );
}
