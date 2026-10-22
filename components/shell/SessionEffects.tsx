"use client";

import { useEffect } from "react";
import { onSignOutElsewhere } from "@/lib/auth/signOut";
import { ROUTES } from "@/lib/config/routes";
import { useReloadOnRestore } from "@/lib/nav/useReloadOnRestore";

/**
 * Signed-in screens only: leave when another tab signs out, and reload a page restored from the browser's
 * back/forward cache so it cannot show a signed-out person's data.
 */
export default function SessionEffects() {
  useReloadOnRestore();
  useEffect(() => onSignOutElsewhere(() => window.location.assign(ROUTES.signIn)), []);
  return null;
}
