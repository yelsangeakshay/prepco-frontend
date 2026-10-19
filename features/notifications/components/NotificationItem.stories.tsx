import type { Meta, StoryObj } from "@storybook/react";
import { NotificationItem } from "./NotificationItem";

const meta: Meta<typeof NotificationItem> = {
  title: "Notifications/NotificationItem",
  component: NotificationItem,
  args: { onRead: () => {} },
  render: (a) => (
    <div className="max-w-md bg-white">
      <NotificationItem {...a} />
    </div>
  ),
};
export default meta;
type S = StoryObj<typeof NotificationItem>;

const base = {
  title: "Panel moved to Thu 8 Oct",
  body: "Your panelist asked to reschedule.",
  time: "2 h ago",
};

export const Unread: S = { args: { ...base, read: false } };
export const Read: S = { args: { ...base, read: true } };
export const Phone: S = {
  args: { ...base, read: false },
  parameters: { viewport: { defaultViewport: "phone" } },
};
