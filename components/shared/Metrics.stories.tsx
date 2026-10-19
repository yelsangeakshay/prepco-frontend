import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./ProgressBar";
import { ScoreBar } from "./ScoreBar";
import { ReadinessMeter } from "./ReadinessMeter";
import { StatCard } from "./StatCard";
import { CountdownCard } from "./CountdownCard";
import { FunnelBars } from "./FunnelBars";
import { EmptyState } from "./EmptyState";

const meta: Meta = { title: "Shared/Metrics" };
export default meta;
type S = StoryObj;

export const Progress: S = {
  render: () => (
    <div className="max-w-sm space-y-4 p-6">
      <ProgressBar value={0} label="Empty" />
      <ProgressBar value={33} label="Third" />
      <ProgressBar value={100} label="Full" />
    </div>
  ),
};

export const Scores: S = {
  render: () => (
    <div className="max-w-sm space-y-4 p-6">
      <ScoreBar label="Impact" value={88} />
      <ScoreBar label="Clarity" value={82} />
      <ScoreBar label="Defensibility" value={81} />
    </div>
  ),
};

export const Readiness: S = {
  render: () => (
    <div className="p-6">
      <ReadinessMeter value={64} />
    </div>
  ),
};

export const Stats: S = {
  render: () => (
    <div className="grid gap-4 p-6 md:grid-cols-3">
      <StatCard label="CV score" value={84} hint="V4 · Locked" tone="green" />
      <StatCard label="Need work" value={4} hint="of 18 answers" tone="maroon" />
      <StatCard label="Prepared" value={12} />
    </div>
  ),
};
export const StatsPhone: S = { ...Stats, parameters: { viewport: { defaultViewport: "phone" } } };

export const Countdown: S = {
  render: () => (
    <div className="max-w-xs p-6">
      <CountdownCard days={35} dateLabel="Mon 9 Nov 2026" />
    </div>
  ),
};

export const Funnel: S = {
  render: () => (
    <div className="max-w-md p-6">
      <FunnelBars
        stages={[
          { label: "Free session", value: 1000 },
          { label: "Plan viewed", value: 640 },
          { label: "Paid", value: 410 },
        ]}
      />
    </div>
  ),
};

export const Empty: S = {
  render: () => (
    <div className="p-6">
      <EmptyState title="No sessions yet" body="Pick a slot to start your runway." />
    </div>
  ),
};
