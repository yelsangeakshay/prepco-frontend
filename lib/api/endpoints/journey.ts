import { api } from "../client";
import { caseTrackSchema, journeySchema, quickSwitchSchema } from "@/features/journey/schemas";

export const getJourney = () => api("/journey", journeySchema);
export const getQuickSwitch = (to: string) =>
  api(`/quick-switch?to=${encodeURIComponent(to)}`, quickSwitchSchema);
export const getCaseTrack = () => api("/case-track", caseTrackSchema);
