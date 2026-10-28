/**
 * Thin adapter over the WebMCP API (https://webmachinelearning.github.io/webmcp/), which lets
 * in-browser AI agents call tools exposed by the page.
 *
 * The spec exposes the API as `document.modelContext` and serializes whatever `execute` resolves
 * to as JSON. Earlier Chrome previews and the MCP-B polyfill expose `navigator.modelContext`,
 * unregister by name and expect MCP `CallToolResult` objects, so those get wrapped here.
 */

export type WebMcpToolAnnotations = {
  readOnlyHint?: boolean;
  consequentialHint?: boolean;
  untrustedContentHint?: boolean;
};

export type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: WebMcpToolAnnotations;
  execute: (input: Record<string, unknown>) => unknown;
};

type ModelContext = {
  registerTool: (tool: object, options?: { signal?: AbortSignal }) => unknown;
  unregisterTool?: (name: string) => void;
};

function getModelContext(): { context: ModelContext; legacy: boolean } | null {
  if (typeof document === 'undefined') return null;
  const spec = (document as Document & { modelContext?: ModelContext }).modelContext;
  if (typeof spec?.registerTool === 'function') return { context: spec, legacy: false };
  const legacy = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
  if (typeof legacy?.registerTool === 'function') return { context: legacy, legacy: true };
  return null;
}

function warn(name: string, error: unknown) {
  console.warn(`WebMCP: could not register tool "${name}"`, error);
}

/** Registers `tools` with the browser's agent, if any, until `signal` aborts. */
export function registerWebMcpTools(tools: WebMcpTool[], signal: AbortSignal) {
  const mc = getModelContext();
  if (!mc || signal.aborted) return;
  const { context, legacy } = mc;

  for (const tool of tools) {
    // Errors are returned rather than thrown so the agent always sees the message.
    const execute = async (input?: Record<string, unknown>) => {
      try {
        const result = await tool.execute(input ?? {});
        return legacy ? { content: [{ type: 'text', text: JSON.stringify(result) }] } : result;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return legacy
          ? { content: [{ type: 'text', text: message }], isError: true }
          : { error: message };
      }
    };

    try {
      Promise.resolve(context.registerTool({ ...tool, execute }, { signal })).catch((error) =>
        warn(tool.name, error)
      );
    } catch (error) {
      warn(tool.name, error);
      continue;
    }

    if (legacy && context.unregisterTool) {
      signal.addEventListener(
        'abort',
        () => {
          try {
            context.unregisterTool?.(tool.name);
          } catch {
            // Already gone.
          }
        },
        { once: true }
      );
    }
  }
}
