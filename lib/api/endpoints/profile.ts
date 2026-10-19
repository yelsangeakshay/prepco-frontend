import { api } from "../client";
import { okSchema } from "@/features/auth/schemas";
import {
  changeTargetResultSchema,
  profileViewSchema,
  type ChangeTargetBody,
  type UpdateProfileBody,
} from "@/features/profile/schemas";

export const getProfile = () => api("/profile", profileViewSchema);
export const updateProfile = (body: UpdateProfileBody) =>
  api("/profile", okSchema, { method: "PUT", json: body });
export const changeTarget = (body: ChangeTargetBody) =>
  api("/profile/change-target", changeTargetResultSchema, { method: "POST", json: body });
