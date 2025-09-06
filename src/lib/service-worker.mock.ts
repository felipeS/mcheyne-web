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

export function setupMocks() {
  global.caches = mockCaches as any;
  global.self = {
    addEventListener: jest.fn(),
    skipWaiting: jest.fn(),
    clients: mockClients,
  } as any;
  global.fetch = jest.fn();

  cachePutPromise = new Promise(resolve => {
    cachePutResolve = resolve;
  });
}

export function triggerInstall(sw: any) {
  const installCallback = global.self.addEventListener.mock.calls.find(
    (call) => call[0] === "install"
  )[1];
  const event = { waitUntil: jest.fn() };
  installCallback(event);
  return event;
}

export function triggerActivate(sw: any) {
  const activateCallback = global.self.addEventListener.mock.calls.find(
    (call) => call[0] === "activate"
  )[1];
  const event = { waitUntil: jest.fn() };
  activateCallback(event);
  return event;
}

export function triggerFetch(sw: any, request: Request) {
    const fetchCallback = global.self.addEventListener.mock.calls.find(
        (call) => call[0] === "fetch"
    )[1];
    const event = {
        request,
        respondWith: jest.fn(),
    };
    fetchCallback(event);
    return event;
}
