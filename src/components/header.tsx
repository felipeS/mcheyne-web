"use client";

import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const t = useTranslations("app");

  return (
    <div className="flex items-center justify-between w-full max-w-md">
      <div className="flex items-center gap-4">
        <BookOpen size={40} />
        <div>
          <div className="text-2xl font-bold">{t("title")}</div>
          <div className="text-sm font-semibold text-muted-foreground">
            {t("subtitle")}
          </div>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}
