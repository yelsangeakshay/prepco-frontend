import { http as mswHttp } from "msw";
import { saveSnapshot } from "./persist";

type Method = "get" | "post" | "put" | "patch" | "delete";

/**
 * msw `http`, but every handler saves the mock world before its response goes out, so a reload
 * (or a role switch in a new navigation) right after an action never loses it.
 * `saveSnapshot` does nothing outside the browser.
 */
function wrap(method: Method): (typeof mswHttp)[Method] {
  const original = mswHttp[method] as (...args: unknown[]) => unknown;
  return ((path: unknown, resolver: (info: unknown) => unknown, options?: unknown) =>
    original(
      path,
      async (info: unknown) => {
        const res = await resolver(info);
        if (method !== "get") saveSnapshot();
        return res;
      },
      options,
    )) as unknown as (typeof mswHttp)[Method];
}

export const http = {
  get: wrap("get"),
  post: wrap("post"),
  put: wrap("put"),
  patch: wrap("patch"),
  delete: wrap("delete"),
};
