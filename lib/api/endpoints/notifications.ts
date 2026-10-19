import { api } from "../client";
import { okSchema } from "@/features/auth/schemas";
import { notificationsSchema, type MarkReadBody } from "@/features/notifications/schemas";

export const getNotifications = () => api("/notifications", notificationsSchema);
export const markNotificationsRead = (body: MarkReadBody) =>
  api("/notifications/read", okSchema, { method: "POST", json: body });
