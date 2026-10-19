"use client";

import { useMutation } from "@tanstack/react-query";
import { forgotPassword, resetPassword, signIn, signUp } from "@/lib/api/endpoints";
import { startMockSession } from "@/lib/auth/client";

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
