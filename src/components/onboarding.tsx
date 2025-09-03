"use client";

import { usePlan } from "@/context/PlanProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export function Onboarding() {
  const t = useTranslations("onboarding");
  const {
    onboarded,
    setOnboarded,
    isSelfPaced,
    setSelfPaced,
    changeStartDate,
  } = usePlan();

  if (onboarded) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-lg font-bold">{t("title")}</CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">{t("intro")}</div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-normal">{t("selfPaced")}</div>
          <Switch checked={isSelfPaced} onCheckedChange={setSelfPaced} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label className="text-sm font-normal" htmlFor="startDate">
            {t("importProgress")}
          </Label>
          <Input
            id="startDate"
            type="date"
            className="w-auto"
            onChange={(e) => changeStartDate(new Date(e.target.value))}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setOnboarded(true)}>{t("next")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
