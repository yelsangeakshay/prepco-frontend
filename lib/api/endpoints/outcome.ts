import { api } from "../client";
import { outcomeSchema, type OutcomeBody } from "@/features/outcome/schemas";

export const getOutcome = () => api("/outcome", outcomeSchema);
export const postOutcome = (body: OutcomeBody) =>
  api("/outcome", outcomeSchema, { method: "POST", json: body });
