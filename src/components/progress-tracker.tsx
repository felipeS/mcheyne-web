"use client";

import { usePlan } from "@/context/PlanProvider";
import { useMemo } from "react";

export function ProgressTracker() {
  const { selections, hasRead } = usePlan();

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

  return (
    <div className="w-full px-4 pt-4 sm:px-6 lg:px-8">
      <div className="relative h-4 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-green-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-center text-sm text-gray-600">
        {completed} of {total} readings completed ({percentage}%)
      </p>
    </div>
  );
}
