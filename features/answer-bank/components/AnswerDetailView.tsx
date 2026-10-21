"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/config/routes";
import { AnswerPanel } from "./AnswerPanel";

/** S8 detail on its own page (the phone route, and a direct link on desktop). */
export function AnswerDetailView({ id }: { id: string }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <Link
        href={ROUTES.student.answers}
        className="text-maroon-600 text-sm font-semibold underline"
      >
        All answers
      </Link>
      <AnswerPanel id={id} as="h1" />
    </div>
  );
}
