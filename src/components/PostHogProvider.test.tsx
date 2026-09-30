import { render } from '@testing-library/react';
import { PostHogProvider } from './PostHogProvider';
import posthog, { type CaptureResult } from 'posthog-js';
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

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
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
    jest.useRealTimers();
  });

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

  it.each([
    ['TypeError', 'NetworkError when attempting to fetch resource.'],
    ['NS_BINDING_ABORTED', ''],
    ['ReferenceError', 'readingPlan is not defined'],
  ])('preserves %s exceptions and attaches diagnostic context', (type, value) => {
    render(<PostHogProvider locale="en">Test</PostHogProvider>);
    const beforeSend = jest.mocked(posthog.init).mock.calls[0][1]?.before_send;
    if (typeof beforeSend !== 'function') throw new Error('Missing before_send callback');
    const event = {
      event: '$exception',
      properties: { $exception_list: [{ type, value }], error_operation: 'pwa.cache_document' },
    } as unknown as CaptureResult;

    expect(beforeSend(event)).toMatchObject({
      event: '$exception',
      properties: {
        $exception_list: [{ type, value }],
        error_operation: 'pwa.cache_document',
        network_online: expect.any(Boolean),
        service_worker_controlled: false,
      },
    });
    const pageview = { event: '$pageview', properties: {} } as unknown as CaptureResult;
    expect(beforeSend(pageview)).toBe(pageview);
    expect(pageview.properties).toEqual({});
  });
});
