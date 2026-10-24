import * as z from "zod/mini";
import { OPERATIONS, type Operation } from "./contract";

const json = (schema: z.ZodMiniType) => {
  const out = z.toJSONSchema(schema, {
    target: "draft-7",
    unrepresentable: "any",
    io: "output",
  }) as Record<string, unknown>;
  delete out.$schema;
  return out;
};

function pathParams(path: string) {
  return [...path.matchAll(/\{(\w+)\}/g)].map((m) => ({
    name: m[1],
    in: "path",
    required: true,
    schema: { type: "string" },
  }));
}

function operation(op: Operation) {
  const parameters = [
    ...pathParams(op.path),
    ...(op.query ?? []).map((name) => ({
      name,
      in: "query",
      required: false,
      schema: { type: "string" },
    })),
  ];
  const errors = Object.fromEntries(
    (op.errors ?? []).map(([status]) => [
      String(status),
      {
        description: (op.errors ?? [])
          .filter(([s]) => s === status)
          .map(([, code]) => code)
          .join(", "),
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    ]),
  );
  return {
    tags: [op.tag],
    summary: op.summary,
    ...(parameters.length ? { parameters } : {}),
    ...(op.request
      ? {
          requestBody: {
            required: true,
            content: { "application/json": { schema: json(op.request) } },
          },
        }
      : {}),
    responses: {
      "200": { description: "OK", content: { "application/json": { schema: json(op.response) } } },
      ...errors,
    },
  };
}

/** OpenAPI 3.0 document generated from the same Zod schemas the UI validates against. */
export function buildOpenApi() {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const op of OPERATIONS) {
    (paths[op.path] ??= {})[op.method] = operation(op);
  }
  return {
    openapi: "3.0.3",
    info: {
      title: "The Prep Co web API (mock contract)",
      version: "0.5.0",
      description: "Generated from lib/api/contract.ts. Student, panelist and ops endpoints.",
    },
    servers: [{ url: "/api/v1" }],
    paths,
    components: {
      schemas: {
        Error: {
          type: "object",
          required: ["code", "message"],
          properties: { code: { type: "string" }, message: { type: "string" } },
        },
      },
    },
  };
}
