import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { ZodType } from "zod";

/**
 * Minimal Zod resolver for React Hook Form. Replaces @hookform/resolvers/zod, which bundles
 * adapters for several Zod majors we do not use (it costs ~6 kB on every form route).
 */
export function zodResolver<T extends FieldValues, C = unknown, O = T>(
  schema: ZodType<unknown>,
): Resolver<T, C, O> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values: result.data as O, errors: {} };

    const errors: Record<string, unknown> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.map(String);
      if (path.length === 0) continue;
      let node = errors;
      path.forEach((key, i) => {
        if (i === path.length - 1) {
          if (!node[key]) node[key] = { type: issue.code, message: issue.message };
        } else {
          node = (node[key] ??= {}) as Record<string, unknown>;
        }
      });
    }
    return { values: {}, errors: errors as FieldErrors<T> };
  };
}
