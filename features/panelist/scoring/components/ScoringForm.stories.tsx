import type { Meta, StoryObj } from "@storybook/react";
import { ScoringForm } from "./ScoringForm";

const meta: Meta<typeof ScoringForm> = {
  title: "Panelist/ScoringForm",
  component: ScoringForm,
  args: {
    onSubmit: () => {},
    eyebrow: "P2 · Live · Riya Kulkarni",
    briefHref: "#",
    p1Readiness: 64,
    questions: [
      { text: "Walk me through your profile." },
      { text: "Why Sales & Marketing?" },
      {
        text: "You already have experience. Why should we hire you as an MT?",
        tag: "Flagged at P1",
        p1Note: "You name the experience but never say what changes for us.",
      },
      { text: "Your own question" },
    ],
  },
};
export default meta;
type S = StoryObj<typeof ScoringForm>;

export const Empty: S = {};
export const Filled: S = {
  args: {
    defaultValues: {
      readiness: 72,
      answers: [
        {
          landed: { Situation: true, Decision: true, Result: false },
          verdict: "Okay",
          note: "Much better than P1. Close with what you would own in 90 days.",
          sendBack: true,
        },
      ],
    },
  },
};
export const Submitting: S = { args: { submitting: true } };
export const Phone: S = { parameters: { viewport: { defaultViewport: "phone" } } };
