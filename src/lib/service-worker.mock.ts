// Mocks for service worker tests

export let cachePutPromise: Promise<void> | null = null;
let cachePutResolve: (() => void) | null = null;

export const mockCache = {
  addAll: jest.fn(),
  put: jest.fn().mockImplementation(() => {
    if (cachePutResolve) {
      cachePutResolve();
    }
    return Promise.resolve();
  }),
  match: jest.fn(),
  keys: jest.fn(),
  delete: jest.fn(),
};

export const mockCaches = {
  open: jest.fn().mockResolvedValue(mockCache),
  match: jest.fn(),
  keys: jest.fn().mockResolvedValue([]),
  delete: jest.fn(),
};

export const mockClients = {
  claim: jest.fn(),
};

interface MockServiceWorkerGlobalScope {
    addEventListener: jest.Mock;
    skipWaiting: jest.Mock;
    clients: {
        claim: jest.Mock;
    };
}

type EventListener = (event: Event) => void;

export function setupMocks() {
  // @ts-expect-error: mocking browser environment
  global.caches = mockCaches;
  (global.self as unknown as MockServiceWorkerGlobalScope) = {
    addEventListener: jest.fn(),
    skipWaiting: jest.fn(),
    clients: mockClients,
  };
  global.fetch = jest.fn();

  cachePutPromise = new Promise(resolve => {
    cachePutResolve = resolve;
  });
}

export function triggerInstall() {
  const selfMock = global.self as unknown as MockServiceWorkerGlobalScope;
  const installCallback = selfMock.addEventListener.mock.calls.find(
    (call: [string, EventListener]) => call[0] === "install"
  )[1];
  const event = { waitUntil: jest.fn() };
  installCallback(event as unknown as ExtendableEvent);
  return event;
}

export function triggerActivate() {
  const selfMock = global.self as unknown as MockServiceWorkerGlobalScope;
  const activateCallback = selfMock.addEventListener.mock.calls.find(
    (call: [string, EventListener]) => call[0] === "activate"
  )[1];
  const event = { waitUntil: jest.fn() };
  activateCallback(event as unknown as ExtendableEvent);
  return event;
}

export function triggerFetch(request: Request) {
    const selfMock = global.self as unknown as MockServiceWorkerGlobalScope;
    const fetchCall = selfMock.addEventListener.mock.calls.find(
        (call: [string, EventListener]) => call[0] === "fetch"
    );
    if (!fetchCall) {
        throw new Error("No 'fetch' event listener found");
    }
    const fetchCallback = fetchCall[1];
    const event = {
        request,
        respondWith: jest.fn(),
    };
    fetchCallback(event as unknown as FetchEvent);
    return event;
}
