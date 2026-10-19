import { api } from "../client";
import { billingSchema, upgradeQuoteSchema, upgradeResultSchema } from "@/features/billing/schemas";

export const getBilling = () => api("/billing", billingSchema);
export const getUpgradeQuote = () => api("/billing/upgrade-quote", upgradeQuoteSchema);
export const postUpgrade = () => api("/billing/upgrade", upgradeResultSchema, { method: "POST" });
