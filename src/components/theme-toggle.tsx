"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const t = useTranslations("theme");

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as
        | "light"
        | "dark"
        | "system";
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      }
    }
  }, []);

  const applyTheme = (themeToApply: "light" | "dark" | "system") => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (themeToApply === "system") {
      // Remove manual overrides to let CSS media query take over
      root.classList.remove("light", "dark");
    } else {
      root.classList.add(themeToApply);
    }
  };

  const cycleTheme = () => {
    if (!mounted) return;

    const newTheme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(newTheme);

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }

    applyTheme(newTheme);
  };

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor className="h-4 w-4" />;
    }
    return theme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    );
  };

  const getLabel = () => {
    if (theme === "system") {
      return t("system");
    }
    return theme === "dark" ? t("dark") : t("light");
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={cycleTheme}
      title={getLabel()}
      aria-label={t("toggleTheme")}
    >
      <div className="text-md font-normal mr-2">{getLabel()}</div>
      {getIcon()}
    </Button>
  );
}
