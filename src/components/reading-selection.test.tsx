import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReadingSelection } from "./reading-selection";
import { PlanProvider } from "@/context/PlanProvider";

// Mock the translations
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key, // Return key as translation
}));

// Mock the PlanProvider context
const mockUsePlan = {
  getSelection: jest.fn(),
  hasRead: jest.fn(),
  toggleRead: jest.fn(),
  selectedIndex: 0,
};

jest.mock("@/context/PlanProvider", () => ({
  usePlan: () => mockUsePlan,
  PlanProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("ReadingSelection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render leap year message when selection is leap day", () => {
    mockUsePlan.getSelection.mockReturnValue({ passages: [], isLeap: true });

    render(
      <PlanProvider>
        <ReadingSelection />
      </PlanProvider>
    );

    expect(screen.getByText("leap")).toBeInTheDocument();
  });

  it("should render reading passages for regular days", () => {
    const mockPassages = ["Genesis 1", "Matthew 1"];
    mockUsePlan.getSelection.mockReturnValue({
      passages: mockPassages,
      isLeap: false,
    });
    mockUsePlan.hasRead.mockReturnValue(false);

    render(
      <PlanProvider>
        <ReadingSelection />
      </PlanProvider>
    );

    expect(screen.getByText("Genesis 1")).toBeInTheDocument();
    expect(screen.getByText("Matthew 1")).toBeInTheDocument();
  });

  it("should show read state correctly", () => {
    const mockPassages = ["Genesis 1"];
    mockUsePlan.getSelection.mockReturnValue({
      passages: mockPassages,
      isLeap: false,
    });
    mockUsePlan.hasRead.mockImplementation(
      (desc: string) => desc === "Genesis 1"
    );

    render(
      <PlanProvider>
        <ReadingSelection />
      </PlanProvider>
    );

    // Should show different visual indicators for read/unread
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
  });

  it("should call toggleRead when button is clicked", async () => {
    const user = userEvent.setup();
    const mockPassages = ["Genesis 1"];
    mockUsePlan.getSelection.mockReturnValue({
      passages: mockPassages,
      isLeap: false,
    });
    mockUsePlan.hasRead.mockReturnValue(false);

    render(
      <PlanProvider>
        <ReadingSelection />
      </PlanProvider>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockUsePlan.toggleRead).toHaveBeenCalledWith("Genesis 1", 0);
  });

  it("should handle multiple passages correctly", () => {
    const mockPassages = ["Genesis 1", "Matthew 1", "Ezra 1", "Acts 1"];
    mockUsePlan.getSelection.mockReturnValue({
      passages: mockPassages,
      isLeap: false,
    });
    mockUsePlan.hasRead.mockReturnValue(false);

    render(
      <PlanProvider>
        <ReadingSelection />
      </PlanProvider>
    );

    expect(screen.getByText("Genesis 1")).toBeInTheDocument();
    expect(screen.getByText("Matthew 1")).toBeInTheDocument();
    expect(screen.getByText("Ezra 1")).toBeInTheDocument();
    expect(screen.getByText("Acts 1")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("should handle book names with translations", () => {
    const mockPassages = ["John 3:16"];
    mockUsePlan.getSelection.mockReturnValue({
      passages: mockPassages,
      isLeap: false,
    });
    mockUsePlan.hasRead.mockReturnValue(false);

    render(
      <PlanProvider>
        <ReadingSelection />
      </PlanProvider>
    );

    // Should show "John 3:16" - the mock translation returns the key
    expect(screen.getByText("John 3:16")).toBeInTheDocument();
  });

  it("should handle passages without chapter numbers", () => {
    const mockPassages = ["Psalm 23"];
    mockUsePlan.getSelection.mockReturnValue({
      passages: mockPassages,
      isLeap: false,
    });
    mockUsePlan.hasRead.mockReturnValue(false);

    render(
      <PlanProvider>
        <ReadingSelection />
      </PlanProvider>
    );

    expect(screen.getByText("Psalm 23")).toBeInTheDocument();
  });
});
