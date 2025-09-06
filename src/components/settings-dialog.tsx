"use client";

import { usePlan } from "@/context/PlanProvider";
import { Dialog } from "@/components/ui/dialog";
import { Flex, Text } from "@radix-ui/themes";
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
import { Select } from "@radix-ui/themes";

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
      <Dialog.Root open={isOpen} onOpenChange={closeSettings}>
        <Dialog.Content>
          <Dialog.Title>{t("title")}</Dialog.Title>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-md font-normal">{t("theme")}</div>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-md font-normal">{t("language")}</div>
              <Select.Root
                value={currentLocale}
                onValueChange={handleLanguageChange}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="en">{t("english")}</Select.Item>
                  <Select.Item value="es">{t("spanish")}</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <Text as="label" size="2">
              <div className="flex items-center justify-between">
                <div className="text-md font-normal">{t("selfPaced")}</div>
                <Switch checked={isSelfPaced} onCheckedChange={setSelfPaced} />
              </div>
            </Text>
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
                  color="red"
                  variant="solid"
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
                      color="red"
                      variant="solid"
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
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                {t("close")}
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
