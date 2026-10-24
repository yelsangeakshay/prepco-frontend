import * as z from "zod/mini";

export const notificationSchema = z.object({
  id: z.string(),
  kind: z.enum(["session", "feedback", "billing", "runway", "system"]),
  title: z.string(),
  body: z.nullable(z.string()),
  /** ISO time. */
  at: z.string(),
  read: z.boolean(),
  href: z.nullable(z.string()),
  /** Small pill after the title, e.g. "Runway updated" (e10.png). */
  tag: z.optional(z.nullable(z.string())),
  /** Link text under the body, e.g. "Review runway" (e10.png). */
  action: z.optional(z.nullable(z.string())),
});
export type Notification = z.infer<typeof notificationSchema>;

export const notificationsSchema = z.object({
  items: z.array(notificationSchema),
  unread: z.number(),
});

export const markReadBodySchema = z.object({
  ids: z.optional(z.array(z.string())),
  all: z.optional(z.boolean()),
});
export type MarkReadBody = z.infer<typeof markReadBodySchema>;
