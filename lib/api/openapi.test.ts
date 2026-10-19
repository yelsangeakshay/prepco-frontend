import { writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { OPERATIONS } from "./contract";
import { buildOpenApi } from "./openapi";

describe("OpenAPI export", () => {
  it("covers every operation and writes docs/openapi.json", () => {
    const spec = buildOpenApi();
    const count = Object.values(spec.paths).reduce((n, p) => n + Object.keys(p).length, 0);
    expect(count).toBe(OPERATIONS.length);
    expect(spec.paths["/sessions/{id}/book"]).toBeDefined();
    writeFileSync(
      path.resolve(__dirname, "../../docs/openapi.json"),
      JSON.stringify(spec, null, 2) + "\n",
    );
  });

  it("never lists the same method and path twice", () => {
    const keys = OPERATIONS.map((o) => `${o.method} ${o.path}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
