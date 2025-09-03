"use client";

import { BookOpen, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function Header({ onSettingsClick }: { onSettingsClick: () => void }) {
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
      <Button variant="outline" size="icon" onClick={onSettingsClick}>
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}
