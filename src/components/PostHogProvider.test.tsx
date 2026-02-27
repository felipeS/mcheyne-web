import { render, rerender } from "@testing-library/react"
import { PostHogProvider } from "./PostHogProvider"
import posthog from "posthog-js"
import React from "react"

// Mock posthog-js
jest.mock("posthog-js", () => ({
  init: jest.fn(),
  setPersonProperties: jest.fn(),
}))

// Mock posthog-js/react
jest.mock("posthog-js/react", () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe("PostHogProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("initializes posthog and sets language property on mount", () => {
    render(
      <PostHogProvider locale="es">
        <div>Test Child</div>
      </PostHogProvider>
    )

    expect(posthog.init).toHaveBeenCalled()
    expect(posthog.setPersonProperties).toHaveBeenCalledWith({
      language: "es",
    })
  })

  it("updates language property when locale prop changes", () => {
    const { rerender } = render(
      <PostHogProvider locale="en">
        <div>Test Child</div>
      </PostHogProvider>
    )

    expect(posthog.setPersonProperties).toHaveBeenCalledWith({
      language: "en",
    })

    // Rerender with new locale
    rerender(
      <PostHogProvider locale="de">
        <div>Test Child</div>
      </PostHogProvider>
    )

    expect(posthog.setPersonProperties).toHaveBeenCalledWith({
      language: "de",
    })
  })
})
