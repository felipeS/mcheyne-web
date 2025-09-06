"use client";

import { render, screen } from "@testing-library/react";
import { Onboarding } from "./onboarding";
import { usePlan } from "@/context/PlanProvider";
import { useTranslations } from "next-intl";

jest.mock("@/context/PlanProvider", () => ({
  usePlan: jest.fn(),
}));

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
}));

const mockUsePlan = usePlan as jest.Mock;
const mockUseTranslations = useTranslations as jest.Mock;

describe("Onboarding", () => {
  beforeEach(() => {
    mockUsePlan.mockClear();
    mockUseTranslations.mockClear();
    mockUseTranslations.mockReturnValue((key: string) => key);
  });

  it("should not display the date picker when in self-paced mode", () => {
    // Arrange
    mockUsePlan.mockReturnValue({
      onboarded: false,
      isSelfPaced: true,
      setOnboarded: jest.fn(),
      setSelfPaced: jest.fn(),
      changeStartDate: jest.fn(),
    });

    // Act
    render(<Onboarding />);

    // Assert
    const dateInput = screen.queryByLabelText("importProgress");
    expect(dateInput).not.toBeInTheDocument();
  });

  it("should display the date picker when not in self-paced mode", () => {
    // Arrange
    mockUsePlan.mockReturnValue({
      onboarded: false,
      isSelfPaced: false,
      setOnboarded: jest.fn(),
      setSelfPaced: jest.fn(),
      changeStartDate: jest.fn(),
    });

    // Act
    render(<Onboarding />);

    // Assert
    const dateInput = screen.getByLabelText("importProgress");
    expect(dateInput).toBeInTheDocument();
  });

  it("should not render if already onboarded", () => {
    // Arrange
    mockUsePlan.mockReturnValue({
      onboarded: true,
    });

    // Act
    const { container } = render(<Onboarding />);

    // Assert
    expect(container).toBeEmptyDOMElement();
  });
});
