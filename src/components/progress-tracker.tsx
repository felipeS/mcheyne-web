'use client';

import { useMemo } from 'react';
import { usePlan } from '@/context/PlanProvider';
import { useTranslations } from 'next-intl';
import { countMissedDaysSinceLastRead } from '@/lib/planConstants';

export function ProgressTracker() {
  const { selections, indexForToday, isSelfPaced, hasRead } = usePlan();
  const t = useTranslations('app');

  const { totalPassages, readPassages } = useMemo(() => {
    const nonLeapSelections = selections.filter((selection) => !selection.isLeap);

    const total = nonLeapSelections.reduce(
      (count, selection) => count + selection.passages.length,
      0
    );

    const read = nonLeapSelections.reduce((count, selection) => {
      return (
        count +
        selection.passages.filter((passage, passageIndex) => hasRead(passage, passageIndex)).length
      );
    }, 0);

    return { totalPassages: total, readPassages: read };
  }, [selections, hasRead]);

  const passageProgress =
    totalPassages === 0 ? 0 : Math.round((readPassages / totalPassages) * 100);
  const missedDays = countMissedDaysSinceLastRead(selections, indexForToday - 1, hasRead);

  if (isSelfPaced) return null;

  return (
    <div className="w-full max-w-md">
      <div className="space-y-2 px-1 py-0">
        <ProgressBar value={passageProgress} />

        <p className="text-center text-sm font-medium text-muted-foreground">
          {t('progressSummary', {
            completed: readPassages,
            total: totalPassages,
            percent: passageProgress,
          })}
        </p>

        <div className="flex justify-center">
          <div className="rounded-full border border-border px-3 py-0.5 text-xs text-muted-foreground">
            {t('progressMissedDaysSentence', { count: missedDays })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-primary/20">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
