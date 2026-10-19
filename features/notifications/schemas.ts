import { z } from "zod";

export const notificationSchema = z.object({
  id: z.string(),
  kind: z.enum(["session", "feedback", "billing", "runway", "system"]),
  title: z.string(),
  body: z.string().nullable(),
  /** ISO time. */
  at: z.string(),
  read: z.boolean(),
  href: z.string().nullable(),
});
export type Notification = z.infer<typeof notificationSchema>;

export const notificationsSchema = z.object({
  items: z.array(notificationSchema),
  unread: z.number(),
});

export const markReadBodySchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});
export type MarkReadBody = z.infer<typeof markReadBodySchema>;
