import type { Meta, StoryObj } from "@storybook/react";
import { AnswerCard } from "./AnswerCard";

const meta: Meta<typeof AnswerCard> = {
  title: "AnswerBank/AnswerCard",
  component: AnswerCard,
  args: { onOpen: () => {} },
  render: (a) => (
    <div className="max-w-lg p-6">
      <AnswerCard {...a} />
    </div>
  ),
};
export default meta;
type S = StoryObj<typeof AnswerCard>;

export const Rehearsed: S = {
  args: {
    question: "Why sales after an FMCG analyst role?",
    status: "rehearsed",
    snippet: "Two years of watching distributor margins taught me where the real decisions sit.",
  },
};
export const Flagged: S = {
  args: {
    question: "Tell me about a failure.",
    status: "flagged",
    snippet: "We missed the Q3 target…",
    critique: "No number and no trade-off. A panel will probe this.",
  },
};
export const NotDrafted: S = {
  args: { question: "Where do you see yourself in 5 years?", status: "not-drafted" },
};
export const Phone: S = {
  args: {
    question: "Tell me about a failure.",
    status: "flagged",
    snippet: "We missed the Q3 target…",
    critique: "No number and no trade-off.",
  },
  parameters: { viewport: { defaultViewport: "phone" } },
};
