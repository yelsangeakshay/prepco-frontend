import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import { server } from "@/mocks/server";
import { getMe } from "@/lib/api/endpoints";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("GET /me is answered by MSW and Zod-parsed", async () => {
  const me = await getMe();
  expect(me.name).toBe("Riya Kulkarni");
});
