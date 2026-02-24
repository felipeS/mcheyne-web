import React from "react";
import { render, screen } from "@testing-library/react";
import { ProgressTracker } from "./progress-tracker";

const mockUsePlan = jest.fn();

jest.mock("@/context/PlanProvider", () => ({
  usePlan: () => mockUsePlan(),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, number>) => {
    if (key === "progressSummary") {
      return `summary:${values?.completed}/${values?.total} (${values?.percent}%)`;
    }
    if (key === "progressMissedDaysSentence") {
      return `missed:${values?.count}`;
    }
    return key;
  },
}));

describe("ProgressTracker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("hides the tracker in self-paced mode", () => {
    mockUsePlan.mockReturnValue({
      selections: [],
      indexForToday: 0,
      isSelfPaced: true,
      hasRead: jest.fn(),
    });

    const { container } = render(<ProgressTracker />);

    expect(container).toBeEmptyDOMElement();
  });

  it("calculates missed days from current date, not selected future date", () => {
    mockUsePlan.mockReturnValue({
      selections: [
        { passages: ["d0"] },
        { passages: ["d1"] },
        { passages: ["d2"] },
        { passages: ["d3"] },
      ],
      selectedIndex: 3,
      indexForToday: 2,
      isSelfPaced: false,
      hasRead: (desc: string) => desc === "d1",
    });

    render(<ProgressTracker />);

    expect(screen.getByText("missed:0")).toBeInTheDocument();
  });
});
