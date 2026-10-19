import type { Meta, StoryObj } from "@storybook/react";
import { PlanCard } from "./PlanCard";

const features = ["3 mock panels", "CV Builder", "HR Question Builder"];

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

export const Basic: S = { args: { name: "Basic", price: 24999, features } };
export const MostChosen: S = {
  args: { name: "Premium", price: 62329, features, mostChosen: true },
};
export const Elite: S = {
  args: { name: "Elite", price: 123293, features: [...features, "Case track"], elite: true },
};
export const SoldOut: S = {
  args: {
    name: "Elite",
    price: 123293,
    features,
    elite: true,
    disabled: true,
    ctaLabel: "Cohort Full",
  },
};
export const Phone: S = {
  args: { name: "Premium", price: 62329, features, mostChosen: true },
  parameters: { viewport: { defaultViewport: "phone" } },
};
