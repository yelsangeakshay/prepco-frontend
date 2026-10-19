import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { NextSessionHero } from "./NextSessionHero";
import { TaskList, type Task } from "./TaskList";
import { SlotPicker, type Slot } from "./SlotPicker";

const meta: Meta = { title: "Runway/Domain" };
export default meta;
type S = StoryObj;

export const Hero: S = {
  render: () => (
    <div className="p-6">
      <NextSessionHero
        title="Domain deep-dive"
        when="Wed 7 Oct · 7:00 PM IST"
        detail="Panel: Sales & Marketing"
        ctaLabel="View Brief"
      />
    </div>
  ),
};
export const HeroPhone: S = { ...Hero, parameters: { viewport: { defaultViewport: "phone" } } };

const initial: Task[] = [
  { id: "1", label: "Rehearse your top 5 answers", hint: "4 need work", done: false },
  { id: "2", label: "Lock CV V4", done: true },
];

function Tasks({ empty }: { empty?: boolean }) {
  const [tasks, setTasks] = useState(empty ? [] : initial);
  if (tasks.length === 0) return <p className="p-6 text-sm">All caught up.</p>;
  return (
    <div className="max-w-md p-6">
      <TaskList
        tasks={tasks}
        onToggle={(id, done) => setTasks((t) => t.map((x) => (x.id === id ? { ...x, done } : x)))}
      />
    </div>
  );
}
export const TaskListDefault: S = { render: () => <Tasks /> };
export const TaskListEmpty: S = { render: () => <Tasks empty /> };

const slots: Slot[] = [
  { id: "a", label: "Wed 14 Oct · 6:00 PM IST" },
  { id: "b", label: "Wed 14 Oct · 7:00 PM IST", taken: true },
  { id: "c", label: "Thu 15 Oct · 7:00 PM IST" },
  { id: "d", label: "Fri 16 Oct · 8:00 PM IST" },
];
const pick = (props: Partial<React.ComponentProps<typeof SlotPicker>>) => (
  <div className="p-6">
    <SlotPicker slots={slots} onConfirm={() => {}} {...props} />
  </div>
);
export const Slots: S = { render: () => pick({}) };
export const SlotsLoading: S = { render: () => pick({ loading: true }) };
export const SlotsEmpty: S = { render: () => pick({ slots: [] }) };
export const SlotTaken: S = { render: () => pick({ slotTakenError: true }) };
export const SlotsPhone: S = {
  render: () => pick({}),
  parameters: { viewport: { defaultViewport: "phone" } },
};
