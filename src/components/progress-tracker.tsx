"use client";

import { usePlan } from "@/context/PlanProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export function ProgressTracker() {
  const { selections, hasRead, onboarded } = usePlan();
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
          <div className="text-xs text-muted-foreground text-right">
            {t("status", { percent: percentage })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
