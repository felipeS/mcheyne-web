import { RAW_PLAN_DATA } from "@/lib/planConstants";
import { getTranslations } from "next-intl/server";
import { PlanProvider } from "@/context/PlanProvider";
import { ReadingSelection } from "@/components/reading-selection";
import { DateNavigation } from "@/components/date-navigation";
import { SettingsDialog } from "@/components/settings-dialog";
import { ProgressTracker } from "@/components/progress-tracker";

// This will statically generate a page for each day of the plan
export function generateStaticParams() {
  return RAW_PLAN_DATA.map((_, index) => ({
    id: (index + 1).toString(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const dayIndex = parseInt(id) - 1;
  const passages = RAW_PLAN_DATA[dayIndex];

  // Safe fallback if id is out of bounds
  if (!passages) {
    return { title: "Day Not Found" };
  }

  const t = await getTranslations({ locale, namespace: "app" });

  const passagesString = passages.join(", ");

  return {
    title: `Day ${id}: ${passagesString} | ${t("title")}`,
    description: `Read ${passagesString} for Day ${id} of the M'Cheyne Reading Plan.`,
    openGraph: {
      title: `Day ${id}: ${passagesString} | M'Cheyne Reading Plan`,
      description: `Read ${passagesString} for Day ${id} of the M'Cheyne Reading Plan.`,
    },
    twitter: {
      title: `Day ${id}: ${passagesString} | M'Cheyne Reading Plan`,
      description: `Read ${passagesString} for Day ${id} of the M'Cheyne Reading Plan.`,
    }
  };
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const dayIndex = parseInt(id) - 1;

  // Render the same structure as the main page, but initializing the PlanProvider
  // with the specific day index could be ideal.
  // For now, wrapping with standard context.

  // We can inject `initialIndex` if PlanProvider supports it,
  // or use an effect inside a client wrapper to jump to this day.
  // We'll create a simple client wrapper `DayInitializer`.

  return (
    <PlanProvider>
      <DayInitializer dayIndex={dayIndex} />
      <ProgressTracker />
      <ReadingSelection />
      <DateNavigation />
      <SettingsDialog />
    </PlanProvider>
  );
}

// Client component to sync the URL day with the plan's selected index
import { DayInitializer } from "@/components/day-initializer";
