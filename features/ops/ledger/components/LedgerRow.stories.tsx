import type { Meta, StoryObj } from "@storybook/react";
import { LedgerRow } from "./LedgerRow";

const meta: Meta<typeof LedgerRow> = {
  title: "Ops/LedgerRow",
  component: LedgerRow,
  render: (a) => (
    <div className="max-w-xl p-6">
      <LedgerRow {...a} />
    </div>
  ),
};
export default meta;
type S = StoryObj<typeof LedgerRow>;

const credit = {
  date: "Mon 5 Oct",
  description: "Premium plan · Riya Kulkarni",
  amount: 62329,
  balance: 623293,
};

export const Credit: S = { args: credit };
export const Debit: S = {
  args: { date: "Mon 5 Oct", description: "Refund · seat hold expired", amount: -24999 },
};
export const Phone: S = { args: credit, parameters: { viewport: { defaultViewport: "phone" } } };
