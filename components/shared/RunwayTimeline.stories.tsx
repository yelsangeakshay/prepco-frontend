import type { Meta, StoryObj } from "@storybook/react";
import { RunwayTimeline, type RunwayStep } from "./RunwayTimeline";

const steps: RunwayStep[] = [
  { id: "1", week: "Week -8", title: "Profiling call + CV lock", when: "Done", status: "done" },
  { id: "2", week: "Week -7", title: "P1: first mock panel", when: "Done", status: "done" },
  {
    id: "3",
    week: "Week -5",
    title: "Domain deep-dive",
    when: "Wed 7 Oct · 7:00 PM IST",
    status: "next",
  },
  { id: "4", week: "Week -4", title: "P2: external specialist panel", status: "pick-slot" },
  {
    id: "5",
    week: "Week -2",
    title: "Group positioning session",
    when: "Mon 26 Oct",
    status: "locked",
  },
  { id: "6", week: "Week -1", title: "P3: pressure mock", when: "Mon 2 Nov", status: "locked" },
  { id: "7", week: "Day 0", title: "You're in the room", when: "Mon 9 Nov", status: "day0" },
];

const meta: Meta<typeof RunwayTimeline> = {
  title: "Shared/RunwayTimeline",
  component: RunwayTimeline,
  args: { steps, onPickSlot: () => {} },
  render: (a) => (
    <div className="p-6">
      <RunwayTimeline {...a} />
    </div>
  ),
};
export default meta;
type S = StoryObj<typeof RunwayTimeline>;

export const Horizontal: S = { args: { orientation: "horizontal" } };
export const Vertical: S = { args: { orientation: "vertical" } };
export const AutoPhone: S = { parameters: { viewport: { defaultViewport: "phone" } } };
