import { cacheCurrentDocument } from './pwa';

describe('offline document caching', () => {
  const fetchMock = jest.fn();
  const put = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    Object.defineProperty(window, 'caches', {
      configurable: true,
      value: { open: jest.fn().mockResolvedValue({ put }) },
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Reflect.deleteProperty(window, 'caches');
    Reflect.deleteProperty(navigator, 'onLine');
  });

  it('caches a successful HTML response for the first offline visit', async () => {
    const response = new Response('<html>Reading plan</html>', {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
    fetchMock.mockResolvedValue(response);

    await cacheCurrentDocument(new AbortController().signal);

    expect(put).toHaveBeenCalledWith('http://localhost/', response);
  });

  it('does not replace a cached page with the service worker offline fallback', async () => {
    const response = new Response('<html>Offline</html>', {
      headers: { 'content-type': 'text/html' },
    });
    Object.defineProperty(response, 'url', { value: 'http://localhost/offline.html' });
    fetchMock.mockResolvedValue(response);

    await cacheCurrentDocument(new AbortController().signal);

    expect(put).not.toHaveBeenCalled();
  });

  it('does not send background requests while already offline', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    await cacheCurrentDocument(new AbortController().signal);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects server errors instead of caching them as usable pages', async () => {
    fetchMock.mockResolvedValue(new Response('Unavailable', { status: 503 }));
    await expect(cacheCurrentDocument(new AbortController().signal)).rejects.toThrow('503');
    expect(put).not.toHaveBeenCalled();
  });
});
