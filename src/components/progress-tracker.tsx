"use client";

import { usePlan } from "@/context/PlanProvider";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

export function ProgressTracker() {
  const t = useTranslations("ProgressTracker");
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
      <div className="relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-green-500 dark:bg-white"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-center text-xs text-gray-500">
        {t("progress", { completed, total, percentage })}
      </p>
      {missedDays > 0 && (
        <div className="text-center mt-1">
          <p className="inline-block border border-gray-300 rounded-full px-2 py-0.5 text-xs text-gray-600">
            {t("missedDays", { count: missedDays })}
          </p>
        </div>
      )}
    </div>
  );
}
