// Generated once from the screen list; edit freely.
// Every story starts from a fresh mock world. `parameters.mock` picks the scenario or forces
// loading, error and empty answers (see .storybook/preview.tsx).
import type { Meta, StoryObj } from "@storybook/react";
import { HomeView } from "@/features/runway/components/HomeView";
import { SessionsView } from "@/features/runway/components/SessionsView";
import { SessionDetail } from "@/features/runway/components/SessionDetail";
import { FreeSessionPanel } from "@/features/onboarding/components/FreeSessionPanel";
import { PlansView } from "@/features/plans/components/PlansView";
import { CheckoutView } from "@/features/checkout/components/CheckoutView";
import { WaitlistView } from "@/features/checkout/components/WaitlistView";
import { FeedbackList, FeedbackDetailView } from "@/features/feedback/components/FeedbackViews";
import { JourneyView } from "@/features/journey/components/JourneyView";
import { QuickSwitchView } from "@/features/journey/components/QuickSwitchView";
import { CaseTrackView } from "@/features/journey/components/CaseTrackView";
import { CvBuilderView } from "@/features/cv-builder/components/CvBuilderView";
import { CvVersionsView } from "@/features/cv-builder/components/CvVersionsView";
import { AnswersView } from "@/features/answer-bank/components/AnswersView";
import { AnswerDetailView } from "@/features/answer-bank/components/AnswerDetailView";
import { BillingView } from "@/features/billing/components/BillingView";
import { UpgradeView } from "@/features/billing/components/UpgradeView";
import { ProfileView } from "@/features/profile/components/ProfileView";
import { ChangeTargetView } from "@/features/profile/components/ChangeTargetView";
import { OutcomeView } from "@/features/outcome/components/OutcomeView";
import { NotificationsPage } from "@/features/notifications/components/NotificationsView";

const meta: Meta = { title: "Views/Student", parameters: { layout: "fullscreen" } };
export default meta;
type S = StoryObj;

export const HomeSuccess: S = {
  name: "Home: Success",
  parameters: { mock: { role: "student" } },
  render: () => <HomeView />,
};

export const HomeLoading: S = {
  name: "Home: Loading",
  parameters: { mock: { role: "student", loading: ["/students/me/runway"] } },
  render: () => <HomeView />,
};

export const HomeError: S = {
  name: "Home: Error",
  parameters: { mock: { role: "student", error: ["/students/me/runway"] } },
  render: () => <HomeView />,
};

export const HomeFirstLogin: S = {
  name: "Home: FirstLogin",
  parameters: { mock: { role: "student", scenario: "first-login" } },
  render: () => <HomeView />,
};

export const HomeLateJoiner: S = {
  name: "Home: LateJoiner",
  parameters: { mock: { role: "student", scenario: "late-joiner" } },
  render: () => <HomeView />,
};

export const HomeDay0Moved: S = {
  name: "Home: Day0Moved",
  parameters: { mock: { role: "student", scenario: "day0-moved" } },
  render: () => <HomeView />,
};

export const HomePlaced: S = {
  name: "Home: Placed",
  parameters: { mock: { role: "student", scenario: "placed" } },
  render: () => <HomeView />,
};

export const HomeNotPlaced: S = {
  name: "Home: NotPlaced",
  parameters: { mock: { role: "student", scenario: "not-placed" } },
  render: () => <HomeView />,
};

export const HomePhone: S = {
  name: "Home: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <HomeView />,
};

export const SessionsSuccess: S = {
  name: "Sessions: Success",
  parameters: { mock: { role: "student" } },
  render: () => <SessionsView />,
};

export const SessionsLoading: S = {
  name: "Sessions: Loading",
  parameters: { mock: { role: "student", loading: ["/sessions"] } },
  render: () => <SessionsView />,
};

export const SessionsError: S = {
  name: "Sessions: Error",
  parameters: { mock: { role: "student", error: ["/sessions"] } },
  render: () => <SessionsView />,
};

export const SessionsEmpty: S = {
  name: "Sessions: Empty",
  parameters: {
    mock: {
      role: "student",
      respond: { "/sessions": { items: [], total: 0, page: 1, pageSize: 25 } },
    },
  },
  render: () => <SessionsView />,
};

export const SessionsPhone: S = {
  name: "Sessions: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <SessionsView />,
};

export const SessionDetailSuccess: S = {
  name: "Session detail: Success",
  parameters: { mock: { role: "student" } },
  render: () => <SessionDetail id="s-1003" />,
};

export const SessionDetailLoading: S = {
  name: "Session detail: Loading",
  parameters: { mock: { role: "student", loading: ["/sessions/s-1003"] } },
  render: () => <SessionDetail id="s-1003" />,
};

export const SessionDetailError: S = {
  name: "Session detail: Error",
  parameters: { mock: { role: "student", error: ["/sessions/s-1003"] } },
  render: () => <SessionDetail id="s-1003" />,
};

export const SessionDetailPanelistCancelled: S = {
  name: "Session detail: PanelistCancelled",
  parameters: { mock: { role: "student", scenario: "panelist-cancelled" } },
  render: () => <SessionDetail id="s-1003" />,
};

export const SessionDetailMoved: S = {
  name: "Session detail: Moved",
  parameters: { mock: { role: "student", scenario: "student-reschedule" } },
  render: () => <SessionDetail id="s-1003" />,
};

export const SessionDetailMissed: S = {
  name: "Session detail: Missed",
  parameters: { mock: { role: "student", scenario: "no-show" } },
  render: () => <SessionDetail id="s-1003" />,
};

export const SessionDetailPickASlot: S = {
  name: "Session detail: PickASlot",
  parameters: { mock: { role: "student" } },
  render: () => <SessionDetail id="s-1004" />,
};

export const SessionDetailCompleted: S = {
  name: "Session detail: Completed",
  parameters: { mock: { role: "student" } },
  render: () => <SessionDetail id="s-1002" />,
};

export const SessionDetailNotFound: S = {
  name: "Session detail: NotFound",
  parameters: { mock: { role: "student" } },
  render: () => <SessionDetail id="nope" />,
};

export const SessionDetailPhone: S = {
  name: "Session detail: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <SessionDetail id="s-1003" />,
};

export const FreeSessionSuccess: S = {
  name: "Free session: Success",
  parameters: { mock: { role: "student" } },
  render: () => <FreeSessionPanel />,
};

export const FreeSessionLoading: S = {
  name: "Free session: Loading",
  parameters: { mock: { role: "student", loading: ["/free-session"] } },
  render: () => <FreeSessionPanel />,
};

export const FreeSessionError: S = {
  name: "Free session: Error",
  parameters: { mock: { role: "student", error: ["/free-session"] } },
  render: () => <FreeSessionPanel />,
};

export const FreeSessionAlreadyUsed: S = {
  name: "Free session: AlreadyUsed",
  parameters: { mock: { role: "student", scenario: "returning-student" } },
  render: () => <FreeSessionPanel />,
};

export const FreeSessionPhone: S = {
  name: "Free session: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <FreeSessionPanel />,
};

export const FreeSessionSummaryPhone: S = {
  name: "Free session: Summary on a phone",
  parameters: {
    mock: { role: "student", scenario: "returning-student" },
    viewport: { defaultViewport: "phone" },
  },
  render: () => <FreeSessionPanel />,
};

export const PlansLateJoiner: S = {
  name: "Plans: Late joiner",
  parameters: { mock: { role: "student", scenario: "late-joiner" } },
  render: () => <PlansView />,
};

export const PlansSuccess: S = {
  name: "Plans: Success",
  parameters: { mock: { role: "student" } },
  render: () => <PlansView />,
};

export const PlansLoading: S = {
  name: "Plans: Loading",
  parameters: { mock: { role: "student", loading: ["/plans"] } },
  render: () => <PlansView />,
};

export const PlansError: S = {
  name: "Plans: Error",
  parameters: { mock: { role: "student", error: ["/plans"] } },
  render: () => <PlansView />,
};

export const PlansCohortFull: S = {
  name: "Plans: CohortFull",
  parameters: { mock: { role: "student", scenario: "cohort-full" } },
  render: () => <PlansView />,
};

export const PlansPhone: S = {
  name: "Plans: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <PlansView />,
};

export const CheckoutSuccess: S = {
  name: "Checkout: Success",
  parameters: { mock: { role: "student" } },
  render: () => <CheckoutView planId="premium" />,
};

export const CheckoutLoading: S = {
  name: "Checkout: Loading",
  parameters: { mock: { role: "student", loading: ["/plans"] } },
  render: () => <CheckoutView planId="premium" />,
};

export const CheckoutError: S = {
  name: "Checkout: Error",
  parameters: { mock: { role: "student", error: ["/plans"] } },
  render: () => <CheckoutView planId="premium" />,
};

export const CheckoutUnknownPlan: S = {
  name: "Checkout: UnknownPlan",
  parameters: { mock: { role: "student" } },
  render: () => <CheckoutView planId="nope" />,
};

export const CheckoutPhone: S = {
  name: "Checkout: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <CheckoutView planId="premium" />,
};

export const WaitlistSuccess: S = {
  name: "Waitlist: Success",
  parameters: { mock: { role: "student" } },
  render: () => <WaitlistView />,
};

export const WaitlistPhone: S = {
  name: "Waitlist: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <WaitlistView />,
};

export const FeedbackListSuccess: S = {
  name: "Feedback list: Success",
  parameters: { mock: { role: "student" } },
  render: () => <FeedbackList />,
};

export const FeedbackListLoading: S = {
  name: "Feedback list: Loading",
  parameters: { mock: { role: "student", loading: ["/feedback"] } },
  render: () => <FeedbackList />,
};

export const FeedbackListError: S = {
  name: "Feedback list: Error",
  parameters: { mock: { role: "student", error: ["/feedback"] } },
  render: () => <FeedbackList />,
};

export const FeedbackListEmpty: S = {
  name: "Feedback list: Empty",
  parameters: { mock: { role: "student", scenario: "first-login" } },
  render: () => <FeedbackList />,
};

export const FeedbackListPhone: S = {
  name: "Feedback list: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <FeedbackList />,
};

export const FeedbackDetailSuccess: S = {
  name: "Feedback detail: Success",
  parameters: { mock: { role: "student" } },
  render: () => <FeedbackDetailView panelId="p-1001" />,
};

export const FeedbackDetailLoading: S = {
  name: "Feedback detail: Loading",
  parameters: { mock: { role: "student", loading: ["/feedback/p-1001"] } },
  render: () => <FeedbackDetailView panelId="p-1001" />,
};

export const FeedbackDetailError: S = {
  name: "Feedback detail: Error",
  parameters: { mock: { role: "student", error: ["/feedback/p-1001"] } },
  render: () => <FeedbackDetailView panelId="p-1001" />,
};

export const FeedbackDetailNotFound: S = {
  name: "Feedback detail: NotFound",
  parameters: { mock: { role: "student" } },
  render: () => <FeedbackDetailView panelId="p-nope" />,
};

export const FeedbackDetailPhone: S = {
  name: "Feedback detail: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <FeedbackDetailView panelId="p-1001" />,
};

export const JourneySuccess: S = {
  name: "Journey: Success",
  parameters: { mock: { role: "student" } },
  render: () => <JourneyView />,
};

export const JourneyLoading: S = {
  name: "Journey: Loading",
  parameters: { mock: { role: "student", loading: ["/journey"] } },
  render: () => <JourneyView />,
};

export const JourneyError: S = {
  name: "Journey: Error",
  parameters: { mock: { role: "student", error: ["/journey"] } },
  render: () => <JourneyView />,
};

export const JourneyPhone: S = {
  name: "Journey: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <JourneyView />,
};

export const QuickSwitchSuccess: S = {
  name: "Quick Switch: Success",
  parameters: { mock: { role: "student" } },
  render: () => <QuickSwitchView />,
};

export const QuickSwitchPhone: S = {
  name: "Quick Switch: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <QuickSwitchView />,
};

export const CaseTrackSuccess: S = {
  name: "Case track: Success",
  parameters: { mock: { role: "student" } },
  render: () => <CaseTrackView />,
};

export const CaseTrackLoading: S = {
  name: "Case track: Loading",
  parameters: { mock: { role: "student", loading: ["/case-track"] } },
  render: () => <CaseTrackView />,
};

export const CaseTrackError: S = {
  name: "Case track: Error",
  parameters: { mock: { role: "student", error: ["/case-track"] } },
  render: () => <CaseTrackView />,
};

export const CaseTrackPhone: S = {
  name: "Case track: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <CaseTrackView />,
};

export const CVBuilderSuccess: S = {
  name: "CV Builder: Success",
  parameters: { mock: { role: "student" } },
  render: () => <CvBuilderView />,
};

export const CVBuilderLoading: S = {
  name: "CV Builder: Loading",
  parameters: { mock: { role: "student", loading: ["/cv"] } },
  render: () => <CvBuilderView />,
};

export const CVBuilderError: S = {
  name: "CV Builder: Error",
  parameters: { mock: { role: "student", error: ["/cv"] } },
  render: () => <CvBuilderView />,
};

export const CVBuilderEmpty: S = {
  name: "CV Builder: Empty",
  parameters: { mock: { role: "student", scenario: "first-login" } },
  render: () => <CvBuilderView />,
};

export const CVBuilderPhone: S = {
  name: "CV Builder: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <CvBuilderView />,
};

export const CVVersionsSuccess: S = {
  name: "CV versions: Success",
  parameters: { mock: { role: "student" } },
  render: () => <CvVersionsView />,
};

export const CVVersionsLoading: S = {
  name: "CV versions: Loading",
  parameters: { mock: { role: "student", loading: ["/cv/versions"] } },
  render: () => <CvVersionsView />,
};

export const CVVersionsError: S = {
  name: "CV versions: Error",
  parameters: { mock: { role: "student", error: ["/cv/versions"] } },
  render: () => <CvVersionsView />,
};

export const CVVersionsEmpty: S = {
  name: "CV versions: Empty",
  parameters: { mock: { role: "student", scenario: "first-login" } },
  render: () => <CvVersionsView />,
};

export const CVVersionsPhone: S = {
  name: "CV versions: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <CvVersionsView />,
};

export const AnswersSuccess: S = {
  name: "Answers: Success",
  parameters: { mock: { role: "student" } },
  render: () => <AnswersView />,
};

export const AnswersLoading: S = {
  name: "Answers: Loading",
  parameters: { mock: { role: "student", loading: ["/answers"] } },
  render: () => <AnswersView />,
};

export const AnswersError: S = {
  name: "Answers: Error",
  parameters: { mock: { role: "student", error: ["/answers"] } },
  render: () => <AnswersView />,
};

export const AnswersEmpty: S = {
  name: "Answers: Empty",
  parameters: {
    mock: {
      role: "student",
      respond: {
        "/answers": {
          items: [],
          total: 0,
          page: 1,
          pageSize: 25,
          counts: { all: 0, rehearsed: 0, flagged: 0, notDrafted: 0 },
        },
      },
    },
  },
  render: () => <AnswersView />,
};

export const AnswersPhone: S = {
  name: "Answers: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <AnswersView />,
};

export const AnswerDetailSuccess: S = {
  name: "Answer detail: Success",
  parameters: { mock: { role: "student" } },
  render: () => <AnswerDetailView id="a-1005" />,
};

export const AnswerDetailLoading: S = {
  name: "Answer detail: Loading",
  parameters: { mock: { role: "student", loading: ["/answers/a-1005"] } },
  render: () => <AnswerDetailView id="a-1005" />,
};

export const AnswerDetailError: S = {
  name: "Answer detail: Error",
  parameters: { mock: { role: "student", error: ["/answers/a-1005"] } },
  render: () => <AnswerDetailView id="a-1005" />,
};

export const AnswerDetailRehearsed: S = {
  name: "Answer detail: Rehearsed",
  parameters: { mock: { role: "student" } },
  render: () => <AnswerDetailView id="a-1001" />,
};

export const AnswerDetailNotDrafted: S = {
  name: "Answer detail: NotDrafted",
  parameters: { mock: { role: "student" } },
  render: () => <AnswerDetailView id="a-1015" />,
};

export const AnswerDetailNotFound: S = {
  name: "Answer detail: NotFound",
  parameters: { mock: { role: "student" } },
  render: () => <AnswerDetailView id="a-nope" />,
};

export const AnswerDetailPhone: S = {
  name: "Answer detail: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <AnswerDetailView id="a-1005" />,
};

export const BillingSuccess: S = {
  name: "Billing: Success",
  parameters: { mock: { role: "student" } },
  render: () => <BillingView />,
};

export const BillingLoading: S = {
  name: "Billing: Loading",
  parameters: { mock: { role: "student", loading: ["/billing"] } },
  render: () => <BillingView />,
};

export const BillingError: S = {
  name: "Billing: Error",
  parameters: { mock: { role: "student", error: ["/billing"] } },
  render: () => <BillingView />,
};

export const BillingBasicEnded: S = {
  name: "Billing: BasicEnded",
  parameters: { mock: { role: "student", scenario: "basic-ended" } },
  render: () => <BillingView />,
};

export const BillingFirstLogin: S = {
  name: "Billing: FirstLogin",
  parameters: { mock: { role: "student", scenario: "first-login" } },
  render: () => <BillingView />,
};

export const BillingPhone: S = {
  name: "Billing: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <BillingView />,
};

export const UpgradeSuccess: S = {
  name: "Upgrade: Success",
  parameters: { mock: { role: "student" } },
  render: () => <UpgradeView />,
};

export const UpgradeLoading: S = {
  name: "Upgrade: Loading",
  parameters: { mock: { role: "student", loading: ["/billing/upgrade-quote"] } },
  render: () => <UpgradeView />,
};

export const UpgradeError: S = {
  name: "Upgrade: Error",
  parameters: { mock: { role: "student", error: ["/billing/upgrade-quote"] } },
  render: () => <UpgradeView />,
};

export const UpgradeEliteFull: S = {
  name: "Upgrade: EliteFull",
  parameters: { mock: { role: "student", scenario: "cohort-full" } },
  render: () => <UpgradeView />,
};

export const UpgradePhone: S = {
  name: "Upgrade: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <UpgradeView />,
};

export const ProfileSuccess: S = {
  name: "Profile: Success",
  parameters: { mock: { role: "student" } },
  render: () => <ProfileView />,
};

export const ProfileLoading: S = {
  name: "Profile: Loading",
  parameters: { mock: { role: "student", loading: ["/profile"] } },
  render: () => <ProfileView />,
};

export const ProfileError: S = {
  name: "Profile: Error",
  parameters: { mock: { role: "student", error: ["/profile"] } },
  render: () => <ProfileView />,
};

export const ProfileTargetChanged: S = {
  name: "Profile: TargetChanged",
  parameters: { mock: { role: "student", scenario: "target-change" } },
  render: () => <ProfileView />,
};

export const ProfilePhone: S = {
  name: "Profile: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <ProfileView />,
};

export const ChangeTargetSuccess: S = {
  name: "Change target: Success",
  parameters: { mock: { role: "student" } },
  render: () => <ChangeTargetView />,
};

export const ChangeTargetLoading: S = {
  name: "Change target: Loading",
  parameters: { mock: { role: "student", loading: ["/profile"] } },
  render: () => <ChangeTargetView />,
};

export const ChangeTargetError: S = {
  name: "Change target: Error",
  parameters: { mock: { role: "student", error: ["/profile"] } },
  render: () => <ChangeTargetView />,
};

export const ChangeTargetPhone: S = {
  name: "Change target: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <ChangeTargetView />,
};

export const OutcomeSuccess: S = {
  name: "Outcome: Success",
  parameters: { mock: { role: "student" } },
  render: () => <OutcomeView />,
};

export const OutcomeLoading: S = {
  name: "Outcome: Loading",
  parameters: { mock: { role: "student", loading: ["/outcome"] } },
  render: () => <OutcomeView />,
};

export const OutcomeError: S = {
  name: "Outcome: Error",
  parameters: { mock: { role: "student", error: ["/outcome"] } },
  render: () => <OutcomeView />,
};

export const OutcomePlaced: S = {
  name: "Outcome: Placed",
  parameters: { mock: { role: "student", scenario: "placed" } },
  render: () => <OutcomeView />,
};

export const OutcomeNotPlaced: S = {
  name: "Outcome: NotPlaced",
  parameters: { mock: { role: "student", scenario: "not-placed" } },
  render: () => <OutcomeView />,
};

export const OutcomePhone: S = {
  name: "Outcome: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <OutcomeView />,
};

export const NotificationsSuccess: S = {
  name: "Notifications: Success",
  parameters: { mock: { role: "student" } },
  render: () => <NotificationsPage />,
};

export const NotificationsLoading: S = {
  name: "Notifications: Loading",
  parameters: { mock: { role: "student", loading: ["/notifications"] } },
  render: () => <NotificationsPage />,
};

export const NotificationsError: S = {
  name: "Notifications: Error",
  parameters: { mock: { role: "student", error: ["/notifications"] } },
  render: () => <NotificationsPage />,
};

export const NotificationsEmpty: S = {
  name: "Notifications: Empty",
  parameters: {
    mock: { role: "student", respond: { "/notifications": { items: [], unread: 0 } } },
  },
  render: () => <NotificationsPage />,
};

export const NotificationsPhone: S = {
  name: "Notifications: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <NotificationsPage />,
};
