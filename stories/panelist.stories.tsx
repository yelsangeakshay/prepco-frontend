// Generated once from the screen list; edit freely.
// Every story starts from a fresh mock world. `parameters.mock` picks the scenario or forces
// loading, error and empty answers (see .storybook/preview.tsx).
import type { Meta, StoryObj } from "@storybook/react";
import { TodayView } from "@/features/panelist/components/TodayView";
import { BriefList, BriefDetail } from "@/features/panelist/components/BriefViews";
import { ScoringList, LiveScoring } from "@/features/panelist/components/ScoringViews";
import { AvailabilityView } from "@/features/panelist/components/AvailabilityView";
import { PanelistProfileView } from "@/features/panelist/components/PanelistProfileView";

const meta: Meta = { title: "Views/Panelist", parameters: { layout: "fullscreen" } };
export default meta;
type S = StoryObj;

export const TodaySuccess: S = {
  name: "Today: Success",
  parameters: { mock: { role: "panelist" } },
  render: () => <TodayView />,
};

export const TodayLoading: S = {
  name: "Today: Loading",
  parameters: { mock: { role: "panelist", loading: ["/panelist/today"] } },
  render: () => <TodayView />,
};

export const TodayError: S = {
  name: "Today: Error",
  parameters: { mock: { role: "panelist", error: ["/panelist/today"] } },
  render: () => <TodayView />,
};

export const TodayPhone: S = {
  name: "Today: Phone",
  parameters: { mock: { role: "panelist" }, viewport: { defaultViewport: "phone" } },
  render: () => <TodayView />,
};

export const BriefsSuccess: S = {
  name: "Briefs: Success",
  parameters: { mock: { role: "panelist" } },
  render: () => <BriefList />,
};

export const BriefsLoading: S = {
  name: "Briefs: Loading",
  parameters: { mock: { role: "panelist", loading: ["/panelist/briefs"] } },
  render: () => <BriefList />,
};

export const BriefsError: S = {
  name: "Briefs: Error",
  parameters: { mock: { role: "panelist", error: ["/panelist/briefs"] } },
  render: () => <BriefList />,
};

export const BriefsEmpty: S = {
  name: "Briefs: Empty",
  parameters: { mock: { role: "panelist", respond: { "/panelist/briefs": { items: [] } } } },
  render: () => <BriefList />,
};

export const BriefsPhone: S = {
  name: "Briefs: Phone",
  parameters: { mock: { role: "panelist" }, viewport: { defaultViewport: "phone" } },
  render: () => <BriefList />,
};

export const BriefSuccess: S = {
  name: "Brief: Success",
  parameters: { mock: { role: "panelist" } },
  render: () => <BriefDetail sessionId="s-1002" />,
};

export const BriefLoading: S = {
  name: "Brief: Loading",
  parameters: { mock: { role: "panelist", loading: ["/briefs/s-1002"] } },
  render: () => <BriefDetail sessionId="s-1002" />,
};

export const BriefError: S = {
  name: "Brief: Error",
  parameters: { mock: { role: "panelist", error: ["/briefs/s-1002"] } },
  render: () => <BriefDetail sessionId="s-1002" />,
};

export const BriefNotYours: S = {
  name: "Brief: NotYours",
  parameters: { mock: { role: "panelist" } },
  render: () => <BriefDetail sessionId="s-1003" />,
};

export const BriefPhone: S = {
  name: "Brief: Phone",
  parameters: { mock: { role: "panelist" }, viewport: { defaultViewport: "phone" } },
  render: () => <BriefDetail sessionId="s-1002" />,
};

export const ScoringListSuccess: S = {
  name: "Scoring list: Success",
  parameters: { mock: { role: "panelist" } },
  render: () => <ScoringList />,
};

export const ScoringListLoading: S = {
  name: "Scoring list: Loading",
  parameters: { mock: { role: "panelist", loading: ["/panelist/scoring"] } },
  render: () => <ScoringList />,
};

export const ScoringListError: S = {
  name: "Scoring list: Error",
  parameters: { mock: { role: "panelist", error: ["/panelist/scoring"] } },
  render: () => <ScoringList />,
};

export const ScoringListEmpty: S = {
  name: "Scoring list: Empty",
  parameters: {
    mock: { role: "panelist", respond: { "/panelist/scoring": { awaiting: [], done: [] } } },
  },
  render: () => <ScoringList />,
};

export const ScoringListPhone: S = {
  name: "Scoring list: Phone",
  parameters: { mock: { role: "panelist" }, viewport: { defaultViewport: "phone" } },
  render: () => <ScoringList />,
};

export const LiveScoringSuccess: S = {
  name: "Live scoring: Success",
  parameters: { mock: { role: "panelist" } },
  render: () => <LiveScoring sessionId="s-1002" />,
};

export const LiveScoringLoading: S = {
  name: "Live scoring: Loading",
  parameters: { mock: { role: "panelist", loading: ["/briefs/s-1002"] } },
  render: () => <LiveScoring sessionId="s-1002" />,
};

export const LiveScoringError: S = {
  name: "Live scoring: Error",
  parameters: { mock: { role: "panelist", error: ["/briefs/s-1002"] } },
  render: () => <LiveScoring sessionId="s-1002" />,
};

export const LiveScoringNotYours: S = {
  name: "Live scoring: NotYours",
  parameters: { mock: { role: "panelist" } },
  render: () => <LiveScoring sessionId="s-1003" />,
};

export const LiveScoringPhone: S = {
  name: "Live scoring: Phone",
  parameters: { mock: { role: "panelist" }, viewport: { defaultViewport: "phone" } },
  render: () => <LiveScoring sessionId="s-1002" />,
};

export const AvailabilitySuccess: S = {
  name: "Availability: Success",
  parameters: { mock: { role: "panelist" } },
  render: () => <AvailabilityView />,
};

export const AvailabilityLoading: S = {
  name: "Availability: Loading",
  parameters: { mock: { role: "panelist", loading: ["/availability"] } },
  render: () => <AvailabilityView />,
};

export const AvailabilityError: S = {
  name: "Availability: Error",
  parameters: { mock: { role: "panelist", error: ["/availability"] } },
  render: () => <AvailabilityView />,
};

export const AvailabilityPhone: S = {
  name: "Availability: Phone",
  parameters: { mock: { role: "panelist" }, viewport: { defaultViewport: "phone" } },
  render: () => <AvailabilityView />,
};

export const ProfileSuccess: S = {
  name: "Profile: Success",
  parameters: { mock: { role: "panelist" } },
  render: () => <PanelistProfileView />,
};

export const ProfileLoading: S = {
  name: "Profile: Loading",
  parameters: { mock: { role: "panelist", loading: ["/panelist/profile"] } },
  render: () => <PanelistProfileView />,
};

export const ProfileError: S = {
  name: "Profile: Error",
  parameters: { mock: { role: "panelist", error: ["/panelist/profile"] } },
  render: () => <PanelistProfileView />,
};

export const ProfilePhone: S = {
  name: "Profile: Phone",
  parameters: { mock: { role: "panelist" }, viewport: { defaultViewport: "phone" } },
  render: () => <PanelistProfileView />,
};
