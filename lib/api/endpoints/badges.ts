import * as z from "zod/mini";
import { api } from "../client";

const opsBadgesSchema = z.object({ unassigned: z.number() });

/** Tiny on purpose: the ops sidebar calls it on every page, so it must not pull in the ops schemas. */
export const getOpsBadges = () => api("/ops/badges", opsBadgesSchema);
