import { api } from "../client";
import {
  billingSchema,
  buyTopUpResultSchema,
  upgradeQuoteSchema,
  upgradeResultSchema,
} from "@/features/billing/schemas";

export const getBilling = () => api("/billing", billingSchema);
export const getUpgradeQuote = () => api("/billing/upgrade-quote", upgradeQuoteSchema);
export const buyTopUp = (id: string) =>
  api("/billing/top-ups", buyTopUpResultSchema, { method: "POST", json: { id } });
export const postUpgrade = () => api("/billing/upgrade", upgradeResultSchema, { method: "POST" });
