import type { Meta, StoryObj } from "@storybook/react";
import * as B from "./Badges";

const meta: Meta = { title: "Shared/Badges" };
export default meta;

export const All: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-6">
      <B.RehearsedBadge />
      <B.FlaggedBadge />
      <B.NotDraftedBadge />
      <B.LockedVersionBadge />
      <B.MostChosenBadge />
      <B.EliteBadge />
      <B.NeedWorkBadge count={4} />
      <B.Day0Badge />
      <B.ProposedBadge />
      <B.SampleDataBadge />
    </div>
  ),
};
