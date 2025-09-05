"use client";

import { usePlan } from "@/context/PlanProvider";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useSettings } from "@/context/SettingsContext";
import { formatDateInput } from "@/lib/dateUtils";
import { locales } from "@/lib/i18n";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownMenuItem,
} from "./ui/dropdown";

export function SettingsDialog() {
  const t = useTranslations("settings");
  const { isSelfPaced, setSelfPaced, startDate, changeStartDate } = usePlan();
  const { isOpen, closeSettings } = useSettings();
  const [confirmReset, setConfirmReset] = useState(false);
  const router = useRouter();
  const currentLocale = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale !== currentLocale) {
      // Set the locale cookie and redirect
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      router.push(`/${newLocale}`);
    }
  };

  return (
    <div className="w-full max-w-md flex justify-end">
      <Dialog open={isOpen} onOpenChange={closeSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-md font-normal">{t("theme")}</div>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-md font-normal">{t("language")}</div>
              <Dropdown minWidth={100}>
                <DropdownTrigger className="min-w-[100px]">
                  {currentLocale === "en" ? t("english") : t("spanish")}
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange("en")}
                    className="first:rounded-t-md"
                  >
                    {t("english")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange("es")}
                    className="last:rounded-b-md"
                  >
                    {t("spanish")}
                  </DropdownMenuItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-md font-normal">{t("selfPaced")}</div>
              <Switch checked={isSelfPaced} onCheckedChange={setSelfPaced} />
            </div>
            {!isSelfPaced && (
              <div className="flex items-center justify-between gap-4">
                <Label className="text-md font-normal" htmlFor="startDate">
                  {t("startDate")}
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  className="w-auto"
                  value={formatDateInput(startDate)}
                  onChange={(e) => changeStartDate(new Date(e.target.value))}
                />
              </div>
            )}
            <div className=" pt-2">
              {!confirmReset ? (
                <Button
                  variant="destructive"
                  onClick={() => setConfirmReset(true)}
                >
                  {t("reset")}
                </Button>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-muted-foreground">
                    {t("resetConfirm")}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setConfirmReset(false)}
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        changeStartDate(new Date());
                        setConfirmReset(false);
                      }}
                    >
                      {t("reset")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeSettings}>{t("close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
