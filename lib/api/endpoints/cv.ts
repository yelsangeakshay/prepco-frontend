import { api } from "../client";
import { okSchema } from "@/features/auth/schemas";
import {
  cvSchema,
  cvVersionsSchema,
  patchBulletResultSchema,
  relockResultSchema,
  type RelockBody,
} from "@/features/cv-builder/schemas";

export const getCv = () => api("/cv", cvSchema);
export const patchBullet = (id: string, text: string) =>
  api(`/cv/bullets/${id}`, patchBulletResultSchema, { method: "PATCH", json: { text } });
export const getCvVersions = () => api("/cv/versions", cvVersionsSchema);
export const lockCvVersion = (id: string) =>
  api(`/cv/versions/${id}/lock`, okSchema, { method: "POST" });
export const requestRelock = (body: RelockBody) =>
  api("/cv/relock-request", relockResultSchema, { method: "POST", json: body });
