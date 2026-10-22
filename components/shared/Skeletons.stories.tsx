import type { Meta, StoryObj } from "@storybook/react";
import {
  AnswersSkeleton,
  HomeSkeleton,
  ListPageSkeleton,
  OpsOverviewSkeleton,
  SessionsSkeleton,
  TablePageSkeleton,
} from "./PageSkeletons";
import { PageSkeleton } from "./Skeletons";

const meta: Meta<typeof PageSkeleton> = { title: "Shared/PageSkeleton", component: PageSkeleton };
export default meta;

export const Loading: StoryObj<typeof PageSkeleton> = {};
export const Home: StoryObj = { render: () => <HomeSkeleton /> };
export const Sessions: StoryObj = { render: () => <SessionsSkeleton /> };
export const Answers: StoryObj = { render: () => <AnswersSkeleton /> };
export const PanelistList: StoryObj = { render: () => <ListPageSkeleton stats={3} /> };
export const OpsOverview: StoryObj = { render: () => <OpsOverviewSkeleton /> };
export const OpsTable: StoryObj = { render: () => <TablePageSkeleton /> };
