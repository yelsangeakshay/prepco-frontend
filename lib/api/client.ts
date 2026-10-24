import type { ZodMiniType } from "zod/mini";
import { SCENARIO_HEADER } from "@/lib/config/scenarios";
import { SCENARIO_COOKIE } from "@/lib/auth/roles";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";
/** Mock data is on unless NEXT_PUBLIC_API_MOCKING is "off", so a deploy needs no environment variable. */
export const API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING !== "off";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function currentScenario(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${SCENARIO_COOKIE}=`));
  return match?.split("=")[1];
}

/** Typed fetch. Responses are Zod-parsed, so a real backend must honour the same contract. */
export async function api<T>(
  path: string,
  schema: ZodMiniType<T>,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = init;
  const scenario = currentScenario();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(scenario ? { [SCENARIO_HEADER]: scenario } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
    throw new ApiError(res.status, body.code ?? "unknown", body.message ?? res.statusText);
  }
  return schema.parse(await res.json());
}
