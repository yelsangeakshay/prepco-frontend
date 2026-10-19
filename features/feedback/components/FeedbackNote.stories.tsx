import type { Meta, StoryObj } from "@storybook/react";
import { FeedbackNote } from "./FeedbackNote";

const args = {
  panelist: "Arjun Mehta",
  role: "Marketing & Brand",
  when: "Wed 30 Sep · 7:00 PM IST",
  verdict: "Almost There",
  note: "Strong on structure. When I pushed on the pricing trade-off you went quiet. Prepare one number you can defend.",
  scores: [
    { label: "Structure", value: 82 },
    { label: "Defensibility", value: 61 },
    { label: "Composure", value: 74 },
  ],
};

const meta: Meta<typeof FeedbackNote> = {
  title: "Feedback/FeedbackNote",
  component: FeedbackNote,
  render: (a) => (
    <div className="max-w-2xl p-6">
      <FeedbackNote {...a} />
    </div>
  ),
};
export default meta;
type S = StoryObj<typeof FeedbackNote>;

export const Default: S = { args };
export const NoScores: S = { args: { ...args, scores: undefined } };
export const Phone: S = { args, parameters: { viewport: { defaultViewport: "phone" } } };
