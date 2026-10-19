import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AvailabilityGrid, type AvailabilityValue } from "./AvailabilityGrid";

const meta: Meta = { title: "Panelist/AvailabilityGrid" };
export default meta;
type S = StoryObj;

function Demo({ initial = {}, booked = [] }: { initial?: AvailabilityValue; booked?: string[] }) {
  const [v, setV] = useState(initial);
  return (
    <div className="p-6">
      <AvailabilityGrid value={v} onChange={setV} booked={booked} />
    </div>
  );
}

export const Empty: S = { render: () => <Demo /> };
export const WithSlots: S = {
  render: () => <Demo initial={{ "Mon-18:00": true, "Wed-19:00": true }} booked={["Wed-18:00"]} />,
};
export const Phone: S = { ...WithSlots, parameters: { viewport: { defaultViewport: "phone" } } };
