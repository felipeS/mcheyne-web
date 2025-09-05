"use client";

import { usePlan } from "@/context/PlanProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { Input } from "./ui/input";
import { Text, Box, Flex } from "@radix-ui/themes";

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
      <Box p="4">
        <Text as="div" size="4" weight="bold" mb="2">
          {t("title")}
        </Text>
        <Flex direction="column" gap="3">
          <Text as="p" size="2" color="gray">
            {t("intro")}
          </Text>
          <Text as="label" size="2">
            <Flex as="span" align="center" justify="between">
              {t("selfPaced")}
              <Switch checked={isSelfPaced} onCheckedChange={setSelfPaced} />
            </Flex>
          </Text>
          <Text as="label" size="2">
            <Flex as="span" align="center" justify="between" gap="3">
              {t("importProgress")}
              <Input
                id="startDate"
                type="date"
                onChange={(e) => changeStartDate(new Date(e.target.value))}
              />
            </Flex>
          </Text>
          <Flex justify="end">
            <Button onClick={() => setOnboarded(true)}>{t("next")}</Button>
          </Flex>
        </Flex>
      </Box>
    </Card>
  );
}
