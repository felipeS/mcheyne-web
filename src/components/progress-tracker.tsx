"use client";

import { usePlan } from "@/context/PlanProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { indexForDateFromStartDate } from "@/lib/planConstants";

export function ProgressTracker() {
  const { selections, hasRead, onboarded, isSelfPaced, startDate } = usePlan();
  const t = useTranslations("progress");

  const progress = useMemo(() => {
    let total = 0;
    let completed = 0;

    selections.forEach((day) => {
      // Skip leap day marker if it has no passages
      if (day.isLeap && day.passages.length === 0) return;

      day.passages.forEach((desc, id) => {
        total++;
        if (hasRead(desc, id)) {
          completed++;
        }
      });
    });

    return { total, completed };
  }, [selections, hasRead]);

  const missedDays = useMemo(() => {
    if (isSelfPaced) return 0;
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Limit lookback to 365 days or until startDate
    for (let i = 1; i <= 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      // Stop if we reach before the start date
      if (d < startDate) break;

      const idx = indexForDateFromStartDate(d, startDate, selections.length);
      const selection = selections[idx];

      if (selection.passages.length === 0) continue;

      const isRead = selection.passages.some((desc, id) => hasRead(desc, id));
      if (isRead) break;
      count++;
    }
    return count;
  }, [isSelfPaced, selections, hasRead, startDate]);

  if (!onboarded) return null;

  const percentage =
    progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div>
              {missedDays > 0 &&
                t("missedDays", { count: missedDays })}
            </div>
            <div>{t("status", { percent: percentage })}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
