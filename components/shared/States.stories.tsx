import type { Meta, StoryObj } from "@storybook/react";
import { ErrorCard } from "./ErrorCard";
import { PageSkeleton } from "./Skeletons";

const meta: Meta = { title: "Shared/States" };
export default meta;

export const Loading: StoryObj = { render: () => <PageSkeleton /> };
export const ErrorState: StoryObj = { render: () => <ErrorCard onRetry={() => {}} /> };
export const ErrorPhone: StoryObj = {
  ...ErrorState,
  parameters: { viewport: { defaultViewport: "phone" } },
};
