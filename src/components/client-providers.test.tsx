import { render, screen } from "@testing-library/react";
import { ClientProviders } from "./client-providers";
import React from "react";

// Mock the providers that require specific context/props
jest.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTranslations: () => (key: string) => key,
}));

jest.mock("./ServiceWorkerUpdater", () => ({
  ServiceWorkerUpdater: () => null,
}));

jest.mock("@vercel/analytics/react", () => ({
  Analytics: () => null,
}));

jest.mock("./header", () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

jest.mock("@/context/SettingsContext", () => ({
  SettingsProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSettings: () => ({ openSettings: jest.fn() }),
}));

jest.mock("./PostHogProvider", () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("ClientProviders", () => {
  it("renders children inside a main tag", () => {
    render(
      <ClientProviders locale="en" messages={{}}>
        <div data-testid="child">Child Content</div>
      </ClientProviders>
    );

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toContainElement(screen.getByTestId("child"));
  });
});
