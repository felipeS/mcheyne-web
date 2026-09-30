import { act, render, waitFor } from '@testing-library/react';
import { Workbox } from 'workbox-window';
import posthog from 'posthog-js';
import { ServiceWorkerUpdater } from './ServiceWorkerUpdater';

jest.mock('next/navigation', () => ({ usePathname: () => '/' }));
jest.mock('posthog-js', () => ({ captureException: jest.fn() }));
jest.mock('workbox-window', () => ({ Workbox: jest.fn() }));

describe('PWA network interruptions', () => {
  const register = jest.fn();
  const fetchMock = jest.fn();
  const put = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    register.mockResolvedValue({});
    fetchMock.mockResolvedValue(
      new Response('<html>Reading plan</html>', { headers: { 'content-type': 'text/html' } })
    );
    jest.mocked(Workbox).mockImplementation(
      () =>
        ({
          register,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        }) as unknown as Workbox
    );
    global.fetch = fetchMock;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { controller: null },
    });
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    Object.defineProperty(window, 'caches', {
      configurable: true,
      value: { open: jest.fn().mockResolvedValue({ put }) },
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Reflect.deleteProperty(navigator, 'serviceWorker');
    Reflect.deleteProperty(navigator, 'onLine');
    Reflect.deleteProperty(window, 'caches');
  });

  it('handles a dropped connection and reports the failed operation without suppressing it', async () => {
    const error = new TypeError('NetworkError when attempting to fetch resource.');
    fetchMock.mockRejectedValueOnce(error);
    render(<ServiceWorkerUpdater />);

    await waitFor(() => {
      expect(posthog.captureException).toHaveBeenCalledWith(error, {
        error_operation: 'pwa.cache_document',
        network_online: true,
        service_worker_controlled: false,
        service_worker_script: null,
        pwa_display_mode: 'browser',
      });
    });
    expect(put).not.toHaveBeenCalled();

    act(() => window.dispatchEvent(new Event('online')));
    await waitFor(() => expect(put).toHaveBeenCalledTimes(1));
    expect(posthog.captureException).toHaveBeenCalledTimes(1);
  });

  it('retries a failed registration after connectivity returns', async () => {
    const error = new TypeError('Service worker registration failed');
    register.mockRejectedValueOnce(error);
    render(<ServiceWorkerUpdater />);

    await waitFor(() => {
      expect(posthog.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({ error_operation: 'pwa.register_service_worker' })
      );
    });
    act(() => window.dispatchEvent(new Event('online')));
    await waitFor(() => expect(register).toHaveBeenCalledTimes(2));
  });

  it('waits for connectivity when mounted offline', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    render(<ServiceWorkerUpdater />);
    await act(async () => {});
    expect(register).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();

    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    act(() => window.dispatchEvent(new Event('online')));
    await waitFor(() => expect(put).toHaveBeenCalledTimes(1));
    expect(register).toHaveBeenCalledTimes(1);
  });

  it('cancels its own pending refresh on unmount and removes reconnect listeners', async () => {
    fetchMock.mockImplementationOnce(
      (_url, { signal }: RequestInit) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          );
        })
    );
    const { unmount } = render(<ServiceWorkerUpdater />);
    await act(async () => unmount());
    act(() => window.dispatchEvent(new Event('online')));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(posthog.captureException).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
  });
});
