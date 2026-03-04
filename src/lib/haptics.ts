"use client";

export type HapticType =
  | "tap"
  | "soft"
  | "success"
  | "warning"
  | "toggle-on"
  | "toggle-off"
  | "navigate-forward"
  | "navigate-back";

const PATTERNS: Record<HapticType, number | number[]> = {
  tap: 12,
  soft: 6,
  success: [16, 30, 24],
  warning: [30, 60, 30],
  "toggle-on": [10, 20, 14],
  "toggle-off": [20, 24, 8],
  "navigate-forward": [8, 12, 8],
  "navigate-back": [8, 18, 12],
};

function canVibrate() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

export function haptic(type: HapticType = "tap") {
  if (!canVibrate()) return;
  navigator.vibrate(PATTERNS[type]);
}

export function hapticToggle(nextValue: boolean) {
  haptic(nextValue ? "toggle-on" : "toggle-off");
}

export function hapticNavigate(direction: "next" | "prev") {
  haptic(direction === "next" ? "navigate-forward" : "navigate-back");
}
