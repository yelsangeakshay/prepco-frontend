import { api } from "../client";
import {
  caseTrackSchema,
  journeySchema,
  quickSwitchDigestSchema,
  quickSwitchPrefsSchema,
  quickSwitchSchema,
  type QuickSwitchPrefs,
} from "@/features/journey/schemas";

export const getJourney = () => api("/journey", journeySchema);
export const getQuickSwitch = (to: string) =>
  api(`/quick-switch?to=${encodeURIComponent(to)}`, quickSwitchSchema);
export const getCaseTrack = () => api("/case-track", caseTrackSchema);

export const getQuickSwitchDigest = () => api("/quick-switch/digest", quickSwitchDigestSchema);
export const saveQuickSwitchPrefs = (body: QuickSwitchPrefs) =>
  api("/quick-switch/preferences", quickSwitchPrefsSchema, { method: "PUT", json: body });
export const toggleQuickSwitchSaved = (id: string) =>
  api(`/quick-switch/saved/${id}`, quickSwitchDigestSchema, { method: "POST" });
