"use client";

import { Card, CardContent } from "@/components/ui/card";
import { usePlan } from "@/context/PlanProvider";
import { useTranslations } from "next-intl";

export function ProgressTracker() {
  const { selections, indexForToday, hasRead } = usePlan();
  const t = useTranslations("app");

  const nonLeapSelections = selections.filter((selection) => !selection.isLeap);

  const totalPassages = nonLeapSelections.reduce(
    (count, selection) => count + selection.passages.length,
    0,
  );

  const readPassages = nonLeapSelections.reduce((count, selection) => {
    return (
      count +
      selection.passages.filter((passage, passageIndex) => hasRead(passage, passageIndex)).length
    );
  }, 0);

  const passageProgress = totalPassages === 0 ? 0 : Math.round((readPassages / totalPassages) * 100);
  const missedDays = countMissedDaysSinceLastRead(selections, indexForToday, hasRead);

  return (
    <Card className="w-full max-w-md border-0 bg-transparent shadow-none">
      <CardContent className="space-y-4 px-1 py-0">
        <ProgressBar value={passageProgress} />

        <p className="text-center text-sm font-medium text-muted-foreground">
          {t("progressSummary", {
            completed: readPassages,
            total: totalPassages,
            percent: passageProgress,
          })}
        </p>

        <div className="flex justify-center">
          <div className="rounded-full border border-border px-4 py-1 text-xs text-muted-foreground">
            {t("progressMissedDaysSentence", { count: missedDays })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function countMissedDaysSinceLastRead(
  selections: { passages: string[]; isLeap?: boolean }[],
  indexForToday: number,
  hasRead: (desc: string, id: number) => boolean,
) {
  if (!selections.length) return 0;

  let missed = 0;

  for (let index = indexForToday; index >= 0; index -= 1) {
    const selection = selections[index];
    if (selection.isLeap) {
      continue;
    }

    const hasAnyRead = selection.passages.some((passage, passageIndex) => hasRead(passage, passageIndex));
    if (hasAnyRead) {
      break;
    }

    missed += 1;
  }

  return missed;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-4 w-full overflow-hidden rounded-full bg-primary/20">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}
