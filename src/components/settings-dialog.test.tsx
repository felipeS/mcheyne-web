"use client";

import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsDialog } from "./settings-dialog";
import { usePlan } from "@/context/PlanProvider";
import { useSettings } from "@/context/SettingsContext";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

jest.mock("@/context/PlanProvider", () => ({
  usePlan: jest.fn(),
}));

jest.mock("@/context/SettingsContext", () => ({
  useSettings: jest.fn(),
}));

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
  useLocale: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockUsePlan = usePlan as jest.Mock;
const mockUseSettings = useSettings as jest.Mock;
const mockUseTranslations = useTranslations as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseLocale = useLocale as jest.Mock;
const mockChangeStartDate = jest.fn();

const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("SettingsDialog", () => {
  const t = (key: string) => key;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockChangeStartDate.mockClear();
    mockUsePlan.mockReturnValue({
      isSelfPaced: false,
      setSelfPaced: jest.fn(),
      startDate: new Date("2024-01-01"),
      changeStartDate: mockChangeStartDate,
    });
    mockUseSettings.mockReturnValue({
      isOpen: true,
      closeSettings: jest.fn(),
    });
    mockUseTranslations.mockReturnValue(t);
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });
    mockUseLocale.mockReturnValue("en");
  });

  describe("Self-Paced Mode", () => {
    it("toggles the visibility of the start date picker", () => {
      const { rerender } = render(<SettingsDialog />);
      expect(screen.getByLabelText("startDate")).toBeInTheDocument();

      mockUsePlan.mockReturnValue({
        ...mockUsePlan(),
        isSelfPaced: true,
      });
      rerender(<SettingsDialog />);
      expect(screen.queryByLabelText("startDate")).not.toBeInTheDocument();
    });
  });

  describe("Theme Switcher", () => {
    it("should cycle through light, dark, and system themes", async () => {
      localStorageMock.setItem("theme", "light");
      render(<SettingsDialog />);
      const themeButton = screen.getByLabelText("toggleTheme");
      await screen.findByText("light");

      fireEvent.click(themeButton);
      expect(await screen.findByText("dark")).toBeInTheDocument();
      expect(localStorage.getItem("theme")).toBe("dark");

      fireEvent.click(themeButton);
      expect(await screen.findByText("system")).toBeInTheDocument();
      expect(localStorage.getItem("theme")).toBe("system");

      fireEvent.click(themeButton);
      expect(await screen.findByText("light")).toBeInTheDocument();
      expect(localStorage.getItem("theme")).toBe("light");
    });
  });

  describe("Reset Plan", () => {
    it("should show confirmation and then reset the plan", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog />);

      const resetButton = screen.getByRole("button", { name: "reset" });
      await user.click(resetButton);

      const confirmDialog = screen.getByText("resetConfirm").parentElement;
      const confirmButton = within(confirmDialog).getByRole("button", {
        name: "reset",
      });
      await user.click(confirmButton);

      expect(mockChangeStartDate).toHaveBeenCalled();
    });

    it("should cancel the reset operation when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog />);

      const resetButton = screen.getByRole("button", { name: "reset" });
      await user.click(resetButton);

      const confirmDialog = screen.getByText("resetConfirm").parentElement;
      const cancelButton = within(confirmDialog).getByRole("button", {
        name: "cancel",
      });
      await user.click(cancelButton);

      expect(mockChangeStartDate).not.toHaveBeenCalled();
      expect(screen.queryByText("resetConfirm")).not.toBeInTheDocument();
    });
  });
});
