import {
  setupMocks,
  triggerFetch,
  mockCache,
  mockCaches,
  cachePutPromise,
} from "./service-worker.mock";
import fs from "fs";
import path from "path";

describe("Service Worker", () => {
  beforeEach(() => {
    setupMocks();
    // Dynamically import the service worker script to be tested
    const swPath = path.resolve(__dirname, "../../public/sw.js");
    const swCode = fs.readFileSync(swPath, "utf-8");
    // eslint-disable-next-line no-eval
    eval(swCode);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should use stale-while-revalidate strategy", async () => {
    const request = new Request("/test.js");
    const cachedResponse = new Response("cached content");
    const networkResponse = new Response("network content");

    mockCaches.match.mockResolvedValue(cachedResponse);
    (global.fetch as jest.Mock).mockResolvedValue(networkResponse);

    const fetchEvent = triggerFetch(self, request);

    // Wait for the fetch event handler to respond
    await new Promise(process.nextTick);

    expect(fetchEvent.respondWith).toHaveBeenCalledWith(expect.any(Promise));

    const promise = fetchEvent.respondWith.mock.calls[0][0];
    const response = await promise;

    // It should return the cached response immediately
    expect(response).toBe(cachedResponse);

    // And it should have made a network request to update the cache
    expect(global.fetch).toHaveBeenCalledWith(request);

    // And it should have put the new response in the cache
    // We wait for the cachePutPromise to resolve, which happens when cache.put is called.
    await cachePutPromise;
    expect(mockCache.put).toHaveBeenCalledWith(request, expect.any(Response));
  });
});
