"use client";

import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { forgotPassword, resetPassword, signIn, signOut, signUp } from "@/lib/api/endpoints/auth";
import { startMockSession } from "@/lib/auth/client";
import { announceSignOut, clearLocalSession } from "@/lib/auth/signOut";
import { ROUTES } from "@/lib/config/routes";

export function useSignIn() {
  return useMutation({
    mutationFn: signIn,
    onSuccess: (r) => startMockSession(r.role, r.onboarded),
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: signUp,
    onSuccess: (r) => {
      // Unverified accounts must verify before getting a session.
      if (!r.verifyRequired) startMockSession(r.role, r.onboarded);
    },
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}

/**
 * Ends the session. The local session is cleared whether or not the request succeeds (an offline user
 * must still get out), then a full page load to sign-in drops every in-memory cache and store.
 * `pending` stays true until that load, so the button cannot be pressed twice.
 */
export function useSignOut() {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: signOut,
    onSettled: async () => {
      await clearLocalSession(qc);
      announceSignOut();
      window.location.assign(ROUTES.signIn);
    },
  });
  // The mutation state reaches React a tick after the click; the ref stops a fast second click.
  const started = useRef(false);
  const signOutOnce = () => {
    if (started.current) return;
    started.current = true;
    m.mutate();
  };
  return { signOut: signOutOnce, pending: !m.isIdle };
}
