import type { Meta, StoryObj } from "@storybook/react";
import { PageSkeleton } from "./Skeletons";

const meta: Meta<typeof PageSkeleton> = { title: "Shared/PageSkeleton", component: PageSkeleton };
export default meta;

export const Loading: StoryObj<typeof PageSkeleton> = {};
