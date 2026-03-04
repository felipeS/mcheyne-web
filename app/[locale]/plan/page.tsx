import { RAW_PLAN_DATA } from "@/lib/planConstants";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

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

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t("title")} - Index</h1>
      <p className="text-muted-foreground">
        Browse all 365 days of the reading plan.
      </p>
      <div className="flex flex-col gap-2">
        {RAW_PLAN_DATA.map((passages, index) => {
          const dayId = index + 1;
          return (
            <Link
              key={dayId}
              href={`/${locale}/day/${dayId}`}
              className="p-4 border rounded hover:bg-accent/50 transition-colors"
            >
              <div className="font-semibold">Day {dayId}</div>
              <div className="text-sm text-muted-foreground">
                {passages.join(", ")}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
