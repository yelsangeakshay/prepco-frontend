import type { Meta, StoryObj } from "@storybook/react";
import { ScoringForm } from "./ScoringForm";

const meta: Meta<typeof ScoringForm> = {
  title: "Panelist/ScoringForm",
  component: ScoringForm,
  args: { onSubmit: () => {} },
  render: (a) => (
    <div className="max-w-xl p-6">
      <ScoringForm {...a} />
    </div>
  ),
};
export default meta;
type S = StoryObj<typeof ScoringForm>;

export const Empty: S = {};
export const Filled: S = {
  args: {
    defaultValues: {
      scores: { Structure: 4, Defensibility: 3, Composure: 5 },
      verdict: "Almost There",
      note: "Good structure. Prepare a defensible number for pricing.",
      sendBack: true,
    },
  },
};
export const Submitting: S = { args: { submitting: true } };
export const Phone: S = { parameters: { viewport: { defaultViewport: "phone" } } };
