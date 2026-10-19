import type { Meta, StoryObj } from "@storybook/react";
import { ErrorCard } from "./ErrorCard";

const meta: Meta<typeof ErrorCard> = { title: "Shared/ErrorCard", component: ErrorCard };
export default meta;

export const Default: StoryObj<typeof ErrorCard> = { args: { onRetry: () => {} } };
