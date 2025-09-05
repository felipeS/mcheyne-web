import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlanProvider, usePlan } from "./PlanProvider";
import { RAW_PLAN_DATA } from "@/lib/planConstants";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length(): number {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number): string | null => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Test component that uses the context
function TestComponent() {
  const plan = usePlan();
  return (
    <div>
      <div data-testid="start-date">{plan.startDate.toISOString()}</div>
      <div data-testid="is-self-paced">{plan.isSelfPaced.toString()}</div>
      <div data-testid="onboarded">{plan.onboarded.toString()}</div>
      <div data-testid="index-for-today">{plan.indexForToday}</div>
      <div data-testid="selected-index">{plan.selectedIndex}</div>
      <div data-testid="selections-length">{plan.selections.length}</div>
      <button
        data-testid="toggle-self-paced"
        onClick={() => plan.setSelfPaced(!plan.isSelfPaced)}
      >
        Toggle Self Paced
      </button>
      <button
        data-testid="toggle-onboarded"
        onClick={() => plan.setOnboarded(!plan.onboarded)}
      >
        Toggle Onboarded
      </button>
      <button
        data-testid="change-start-date"
        onClick={() => plan.setStartDate(new Date("2024-02-01"))}
      >
        Change Start Date
      </button>
    </div>
  );
}

describe("PlanProvider", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it("should initialize with default values", () => {
    render(
      <PlanProvider>
        <TestComponent />
      </PlanProvider>
    );

    expect(screen.getByTestId("is-self-paced")).toHaveTextContent("false");
    expect(screen.getByTestId("onboarded")).toHaveTextContent("false");
    expect(screen.getByTestId("selections-length")).toHaveTextContent(
      RAW_PLAN_DATA.length.toString()
    );
  });

  it("should load values from localStorage on mount", () => {
    const mockStartDate = new Date("2024-01-15");
    localStorageMock.setItem("startDate", mockStartDate.toISOString());
    localStorageMock.setItem("selfPaced", "true");
    localStorageMock.setItem("onboarded", "true");

    render(
      <PlanProvider>
        <TestComponent />
      </PlanProvider>
    );

    expect(screen.getByTestId("is-self-paced")).toHaveTextContent("true");
    expect(screen.getByTestId("onboarded")).toHaveTextContent("true");
  });

  it("should persist changes to localStorage", async () => {
    const user = userEvent.setup();

    render(
      <PlanProvider>
        <TestComponent />
      </PlanProvider>
    );

    await user.click(screen.getByTestId("toggle-self-paced"));
    expect(localStorageMock.setItem).toHaveBeenCalledWith("selfPaced", "true");

    await user.click(screen.getByTestId("toggle-onboarded"));
    expect(localStorageMock.setItem).toHaveBeenCalledWith("onboarded", "true");
  });

  it("should update start date and rebuild selections", async () => {
    const user = userEvent.setup();

    render(
      <PlanProvider>
        <TestComponent />
      </PlanProvider>
    );

    await user.click(screen.getByTestId("change-start-date"));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "startDate",
      "2024-02-01T00:00:00.000Z"
    );
    expect(screen.getByTestId("start-date")).toHaveTextContent(
      "2024-02-01T00:00:00.000Z"
    );
  });

  it("should handle leap year selections correctly", () => {
    // Mock a leap year start date
    const leapStartDate = new Date("2024-01-01");
    localStorageMock.setItem("startDate", leapStartDate.toISOString());

    render(
      <PlanProvider>
        <TestComponent />
      </PlanProvider>
    );

    // Should have 366 entries (365 + 1 leap day)
    expect(screen.getByTestId("selections-length")).toHaveTextContent("366");
  });

  it("should handle non-leap year selections correctly", () => {
    // Mock a non-leap year start date
    const nonLeapStartDate = new Date("2023-01-01");
    localStorageMock.setItem("startDate", nonLeapStartDate.toISOString());

    render(
      <PlanProvider>
        <TestComponent />
      </PlanProvider>
    );

    // Should have 365 entries (no leap day)
    expect(screen.getByTestId("selections-length")).toHaveTextContent("365");
  });

  it("should throw error when usePlan is used outside provider", () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "usePlan must be used within PlanProvider"
    );

    consoleSpy.mockRestore();
  });

  it("should handle localStorage errors gracefully", () => {
    // Mock localStorage to throw errors
    const errorLocalStorage = {
      ...localStorageMock,
      getItem: jest.fn(() => {
        throw new Error("Storage error");
      }),
    };
    Object.defineProperty(window, "localStorage", {
      value: errorLocalStorage,
      writable: true,
    });

    // Should not crash and use fallback values
    expect(() =>
      render(
        <PlanProvider>
          <TestComponent />
        </PlanProvider>
      )
    ).not.toThrow();

    // Restore original localStorage
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });
});
