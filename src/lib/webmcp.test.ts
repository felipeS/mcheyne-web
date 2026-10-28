import { registerWebMcpTools, type WebMcpTool } from './webmcp';

const tool: WebMcpTool = {
  name: 'echo',
  description: 'Echo the input',
  execute: (input) => {
    if (input.fail) throw new Error('nope');
    return { echoed: input };
  },
};

describe('registerWebMcpTools', () => {
  afterEach(() => {
    delete (document as unknown as Record<string, unknown>).modelContext;
    delete (navigator as unknown as Record<string, unknown>).modelContext;
  });

  it('does nothing without a model context', () => {
    expect(() => registerWebMcpTools([tool], new AbortController().signal)).not.toThrow();
  });

  it('prefers document.modelContext and passes the abort signal', async () => {
    const registerTool = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'modelContext', {
      value: { registerTool },
      configurable: true,
    });
    Object.defineProperty(navigator, 'modelContext', {
      value: { registerTool: jest.fn() },
      configurable: true,
    });
    const controller = new AbortController();

    registerWebMcpTools([tool], controller.signal);

    expect(registerTool).toHaveBeenCalledWith(expect.objectContaining({ name: 'echo' }), {
      signal: controller.signal,
    });
    const { execute } = registerTool.mock.calls[0][0];
    await expect(execute({ a: 1 })).resolves.toEqual({ echoed: { a: 1 } });
    await expect(execute({ fail: true })).resolves.toEqual({ error: 'nope' });
  });

  it('wraps results and unregisters by name for legacy navigator.modelContext', async () => {
    const registerTool = jest.fn();
    const unregisterTool = jest.fn();
    Object.defineProperty(navigator, 'modelContext', {
      value: { registerTool, unregisterTool },
      configurable: true,
    });
    const controller = new AbortController();

    registerWebMcpTools([tool], controller.signal);

    const { execute } = registerTool.mock.calls[0][0];
    await expect(execute({ a: 1 })).resolves.toEqual({
      content: [{ type: 'text', text: '{"echoed":{"a":1}}' }],
    });
    await expect(execute({ fail: true })).resolves.toEqual({
      content: [{ type: 'text', text: 'nope' }],
      isError: true,
    });

    controller.abort();
    expect(unregisterTool).toHaveBeenCalledWith('echo');
  });

  it('keeps registering other tools when one fails', () => {
    const registerTool = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('duplicate');
      })
      .mockResolvedValue(undefined);
    Object.defineProperty(document, 'modelContext', {
      value: { registerTool },
      configurable: true,
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    registerWebMcpTools([tool, { ...tool, name: 'echo2' }], new AbortController().signal);

    expect(registerTool).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledWith('WebMCP: could not register tool "echo"', expect.any(Error));
    warn.mockRestore();
  });
});
