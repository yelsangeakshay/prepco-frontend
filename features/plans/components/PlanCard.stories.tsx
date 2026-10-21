import type { Meta, StoryObj } from "@storybook/react";
import { PlanCard } from "./PlanCard";

const features = [
  { text: "CV Builder + expert review, 1 re-lock", included: true },
  { text: "P1 mock with an external industry expert", included: true },
  { text: "No P2 or P3 panel", included: false },
];

const meta: Meta<typeof PlanCard> = {
  title: "Plans/PlanCard",
  component: PlanCard,
  render: (a) => (
    <div className="max-w-sm p-6">
      <PlanCard {...a} />
    </div>
  ),
};
export default meta;
type S = StoryObj<typeof PlanCard>;

const coverage = { done: 2, total: 6, caption: "CV lock · P1, then stops" };

export const Basic: S = {
  args: {
    name: "Basic",
    price: 5999,
    listPrice: 8999,
    badge: "33% off · Season 1",
    coverage,
    features,
    topUp: 1799,
  },
};
export const MostChosen: S = {
  args: {
    name: "Premium",
    price: 9999,
    listPrice: 17999,
    badge: "Most chosen",
    suggested: true,
    inherits: "Basic",
    features,
    mostChosen: true,
    coverage: { done: 6, total: 6, caption: "CV lock → P1 → deep-dive → P2 → P3 → Day 0" },
  },
};
export const Elite: S = {
  args: {
    name: "Elite",
    price: 13999,
    listPrice: 26999,
    badge: "Best value",
    inherits: "Premium",
    features,
    elite: true,
    note: "The case track alone is ₹7,999 on its own. Elite costs ₹4,000 more than Premium.",
  },
};
export const SoldOut: S = {
  args: {
    name: "Elite",
    price: 13999,
    features,
    elite: true,
    disabled: true,
    ctaLabel: "Cohort Full",
  },
};
export const Phone: S = {
  args: { name: "Premium", price: 9999, features, mostChosen: true },
  parameters: { viewport: { defaultViewport: "phone" } },
};
