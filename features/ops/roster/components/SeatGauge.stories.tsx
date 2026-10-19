import type { Meta, StoryObj } from "@storybook/react";
import { SeatGauge } from "./SeatGauge";

const meta: Meta<typeof SeatGauge> = {
  title: "Ops/SeatGauge",
  component: SeatGauge,
  render: (a) => (
    <div className="max-w-xs p-6">
      <SeatGauge {...a} />
    </div>
  ),
};
export default meta;
type S = StoryObj<typeof SeatGauge>;

export const Open: S = { args: { label: "Premium", taken: 312, total: 400 } };
export const Full: S = { args: { label: "Elite", taken: 50, total: 50 } };
export const Empty: S = { args: { label: "Basic", taken: 0, total: 300 } };
