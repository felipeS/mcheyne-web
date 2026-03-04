import { RAW_PLAN_DATA, splitPassage } from "@/lib/planConstants";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PlanProvider } from "@/context/PlanProvider";
import { SettingsDialog } from "@/components/settings-dialog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });

  return {
    title: `Plan Index | ${t("title")}`,
    description: "Browse all 365 days of the M'Cheyne Reading Plan.",
  };
}

export default async function PlanIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  const tBooks = await getTranslations({ locale, namespace: "books" });

  return (
    <PlanProvider>
      <div className="w-full max-w-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{t("title")} - Index</h1>
        <p className="text-muted-foreground">
          Browse all 365 days of the reading plan.
        </p>
        <div className="flex flex-col gap-2">
          {RAW_PLAN_DATA.map((passages, index) => {
            const dayId = index + 1;

            // Translate the book names
            const translatedPassages = passages.map((desc) => {
              const { book, chapter } = splitPassage(desc);
              // Use relaxed dynamic translation key matching what is done in reading-selection.tsx
              const translateDynamic = tBooks as unknown as (
                key: string,
                values?: { defaultMessage?: string }
              ) => string;

              const localizedBook = translateDynamic(book, { defaultMessage: book });
              return `${localizedBook}${chapter ? " " + chapter : ""}`;
            });

            return (
              <Link
                key={dayId}
                href={`/${locale}/day/${dayId}`}
                className="p-4 border rounded hover:bg-accent/50 transition-colors"
              >
                <div className="font-semibold">{t("day")} {dayId}</div>
                <div className="text-sm text-muted-foreground">
                  {translatedPassages.join(", ")}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <SettingsDialog />
    </PlanProvider>
  );
}
