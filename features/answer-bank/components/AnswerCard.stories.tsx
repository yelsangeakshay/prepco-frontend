import type { Meta, StoryObj } from "@storybook/react";
import { AnswerCard } from "./AnswerCard";

const meta: Meta<typeof AnswerCard> = {
  title: "AnswerBank/AnswerCard",
  component: AnswerCard,
  render: (a) => (
    <div className="max-w-lg p-6">
      <AnswerCard {...a} />
    </div>
  ),
};
export default meta;
type S = StoryObj<typeof AnswerCard>;

export const Rehearsed: S = {
  args: { question: "Why MBA, and why now?", status: "rehearsed" },
};
export const Flagged: S = {
  args: { question: "Why did you cut those three channels?", status: "flagged" },
};
export const NotDrafted: S = {
  args: { question: "Walk me through a time you were wrong.", status: "not-drafted" },
};
export const SelectedFlagged: S = {
  args: {
    question: "You already have experience. Why should we hire you as an MT?",
    status: "flagged",
    selected: true,
    critique: "Lead with what an MT track gives you that your last role could not.",
    noteTags: ["situation", "decision", "result"],
  },
  parameters: { viewport: { defaultViewport: "phone" } },
};
