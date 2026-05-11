import { render } from '@testing-library/react';
import { PostHogProvider } from './PostHogProvider';
import posthog from 'posthog-js';
import React from 'react';

// Mock posthog-js
jest.mock('posthog-js', () => ({
  init: jest.fn(),
  setPersonProperties: jest.fn(),
}));

// Mock posthog-js/react
jest.mock('posthog-js/react', () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('PostHogProvider', () => {
  const originalLang = document.documentElement.lang;
  const originalDisableLocalOptOut = process.env.NEXT_PUBLIC_POSTHOG_DISABLE_LOCAL_OPT_OUT;
  const mockPhClient = {
    opt_out_capturing: jest.fn(),
    opt_in_capturing: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    delete process.env.NEXT_PUBLIC_POSTHOG_DISABLE_LOCAL_OPT_OUT;
    // Mock document.documentElement.lang
    Object.defineProperty(document.documentElement, 'lang', {
      value: 'en',
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(document.documentElement, 'lang', {
      value: originalLang,
      configurable: true,
      writable: true,
    });
    if (originalDisableLocalOptOut === undefined) {
      delete process.env.NEXT_PUBLIC_POSTHOG_DISABLE_LOCAL_OPT_OUT;
    } else {
      process.env.NEXT_PUBLIC_POSTHOG_DISABLE_LOCAL_OPT_OUT = originalDisableLocalOptOut;
    }
    jest.useRealTimers();
  });

  function getLoadedCallback() {
    const initMock = posthog.init as jest.Mock;
    const initConfig = initMock.mock.calls[0]?.[1];
    return initConfig?.loaded as ((ph: typeof mockPhClient) => void) | undefined;
  }

  it('sets first_seen_at property if not present in localStorage', () => {
    const mockDate = new Date('2023-01-01T00:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    render(
      <PostHogProvider locale="en">
        <div>Test Child</div>
      </PostHogProvider>
    );

    expect(localStorage.getItem('first_seen_at')).toBe(mockDate.toISOString());
    expect(posthog.setPersonProperties).toHaveBeenCalledWith({
      first_seen_at: mockDate.toISOString(),
    });
  });

  it('does not set first_seen_at property if already present in localStorage', () => {
    const existingDate = '2022-01-01T00:00:00.000Z';
    localStorage.setItem('first_seen_at', existingDate);

    render(
      <PostHogProvider locale="en">
        <div>Test Child</div>
      </PostHogProvider>
    );

    expect(localStorage.getItem('first_seen_at')).toBe(existingDate);
    // Should verify it wasn't called with first_seen_at.
    // However, setPersonProperties is also called for language, so we check specifically for first_seen_at call.
    expect(posthog.setPersonProperties).not.toHaveBeenCalledWith(
      expect.objectContaining({ first_seen_at: expect.any(String) })
    );
  });

  it('initializes posthog and sets language property from document.documentElement.lang', () => {
    // Set mock lang
    document.documentElement.lang = 'es';

    render(
      <PostHogProvider locale="es">
        <div>Test Child</div>
      </PostHogProvider>
    );

    expect(posthog.init).toHaveBeenCalled();
    expect(posthog.setPersonProperties).toHaveBeenCalledWith({
      language: 'es',
    });
  });

  it('updates language property when locale prop changes (mocking route transition)', () => {
    // Initial render
    document.documentElement.lang = 'en';
    const { rerender } = render(
      <PostHogProvider locale="en">
        <div>Test Child</div>
      </PostHogProvider>
    );

    expect(posthog.setPersonProperties).toHaveBeenCalledWith({
      language: 'en',
    });

    // Simulate route change: update lang and rerender with new locale
    document.documentElement.lang = 'de';
    rerender(
      <PostHogProvider locale="de">
        <div>Test Child</div>
      </PostHogProvider>
    );

    expect(posthog.setPersonProperties).toHaveBeenCalledWith({
      language: 'de',
    });
  });

  it('falls back to locale prop if document.documentElement.lang is missing', () => {
    // Clear lang
    Object.defineProperty(document.documentElement, 'lang', {
      value: '',
      writable: true,
    });

    render(
      <PostHogProvider locale="de">
        <div>Test Child</div>
      </PostHogProvider>
    );

    expect(posthog.setPersonProperties).toHaveBeenCalledWith({
      language: 'de',
    });
  });

  it('opts out of PostHog on localhost by default', () => {
    render(
      <PostHogProvider locale="en">
        <div>Test Child</div>
      </PostHogProvider>
    );

    const loaded = getLoadedCallback();
    loaded?.(mockPhClient);

    expect(mockPhClient.opt_out_capturing).toHaveBeenCalled();
  });

  it('keeps PostHog enabled locally when local opt-out is disabled via env var', () => {
    process.env.NEXT_PUBLIC_POSTHOG_DISABLE_LOCAL_OPT_OUT = 'true';

    render(
      <PostHogProvider locale="en">
        <div>Test Child</div>
      </PostHogProvider>
    );

    const loaded = getLoadedCallback();
    loaded?.(mockPhClient);

    expect(mockPhClient.opt_out_capturing).not.toHaveBeenCalled();
    expect(mockPhClient.opt_in_capturing).toHaveBeenCalled();
  });
});
