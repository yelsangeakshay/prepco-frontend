// Generated once from the screen list; edit freely.
// Every story starts from a fresh mock world. `parameters.mock` picks the scenario or forces
// loading, error and empty answers (see .storybook/preview.tsx).
import type { Meta, StoryObj } from "@storybook/react";
import { OpsOverview } from "@/features/ops/components/OpsOverview";
import { StudentsView } from "@/features/ops/components/StudentsView";
import { StudentDetailView } from "@/features/ops/components/StudentDetailView";
import { AssignmentsView } from "@/features/ops/components/AssignmentsView";
import { BookingsView } from "@/features/ops/components/BookingsView";
import { LedgerView } from "@/features/ops/components/LedgerView";
import { PanelistsView } from "@/features/ops/components/PanelistsView";
import { ApplicationsView } from "@/features/ops/components/ApplicationsView";

const meta: Meta = { title: "Views/Ops", parameters: { layout: "fullscreen" } };
export default meta;
type S = StoryObj;

export const OverviewSuccess: S = {
  name: "Overview: Success",
  parameters: { mock: { role: "ops" } },
  render: () => <OpsOverview />,
};

export const OverviewLoading: S = {
  name: "Overview: Loading",
  parameters: { mock: { role: "ops", loading: ["/ops/cohort"] } },
  render: () => <OpsOverview />,
};

export const OverviewError: S = {
  name: "Overview: Error",
  parameters: { mock: { role: "ops", error: ["/ops/cohort"] } },
  render: () => <OpsOverview />,
};

export const OverviewPhone: S = {
  name: "Overview: Phone",
  parameters: { mock: { role: "ops" }, viewport: { defaultViewport: "phone" } },
  render: () => <OpsOverview />,
};

export const StudentsSuccess: S = {
  name: "Students: Success",
  parameters: { mock: { role: "ops" } },
  render: () => <StudentsView />,
};

export const StudentsLoading: S = {
  name: "Students: Loading",
  parameters: { mock: { role: "ops", loading: ["/ops/students"] } },
  render: () => <StudentsView />,
};

export const StudentsError: S = {
  name: "Students: Error",
  parameters: { mock: { role: "ops", error: ["/ops/students"] } },
  render: () => <StudentsView />,
};

export const StudentsEmpty: S = {
  name: "Students: Empty",
  parameters: {
    mock: {
      role: "ops",
      respond: { "/ops/students": { items: [], total: 0, page: 1, pageSize: 25 } },
    },
  },
  render: () => <StudentsView />,
};

export const StudentsPhone: S = {
  name: "Students: Phone",
  parameters: { mock: { role: "ops" }, viewport: { defaultViewport: "phone" } },
  render: () => <StudentsView />,
};

export const StudentDetailSuccess: S = {
  name: "Student detail: Success",
  parameters: { mock: { role: "ops" } },
  render: () => <StudentDetailView id="st-riya" />,
};

export const StudentDetailLoading: S = {
  name: "Student detail: Loading",
  parameters: { mock: { role: "ops", loading: ["/ops/students/st-riya"] } },
  render: () => <StudentDetailView id="st-riya" />,
};

export const StudentDetailError: S = {
  name: "Student detail: Error",
  parameters: { mock: { role: "ops", error: ["/ops/students/st-riya"] } },
  render: () => <StudentDetailView id="st-riya" />,
};

export const StudentDetailNotFound: S = {
  name: "Student detail: NotFound",
  parameters: { mock: { role: "ops" } },
  render: () => <StudentDetailView id="st-nope" />,
};

export const StudentDetailPhone: S = {
  name: "Student detail: Phone",
  parameters: { mock: { role: "ops" }, viewport: { defaultViewport: "phone" } },
  render: () => <StudentDetailView id="st-riya" />,
};

export const AssignmentsSuccess: S = {
  name: "Assignments: Success",
  parameters: { mock: { role: "ops" } },
  render: () => <AssignmentsView />,
};

export const AssignmentsLoading: S = {
  name: "Assignments: Loading",
  parameters: { mock: { role: "ops", loading: ["/ops/assignments"] } },
  render: () => <AssignmentsView />,
};

export const AssignmentsError: S = {
  name: "Assignments: Error",
  parameters: { mock: { role: "ops", error: ["/ops/assignments"] } },
  render: () => <AssignmentsView />,
};

export const AssignmentsEmpty: S = {
  name: "Assignments: Empty",
  parameters: {
    mock: { role: "ops", respond: { "/ops/assignments": { unassigned: [], load: [] } } },
  },
  render: () => <AssignmentsView />,
};

export const AssignmentsPhone: S = {
  name: "Assignments: Phone",
  parameters: { mock: { role: "ops" }, viewport: { defaultViewport: "phone" } },
  render: () => <AssignmentsView />,
};

export const BookingsSuccess: S = {
  name: "Bookings: Success",
  parameters: { mock: { role: "ops" } },
  render: () => <BookingsView />,
};

export const BookingsLoading: S = {
  name: "Bookings: Loading",
  parameters: { mock: { role: "ops", loading: ["/ops/bookings"] } },
  render: () => <BookingsView />,
};

export const BookingsError: S = {
  name: "Bookings: Error",
  parameters: { mock: { role: "ops", error: ["/ops/bookings"] } },
  render: () => <BookingsView />,
};

export const BookingsEmpty: S = {
  name: "Bookings: Empty",
  parameters: {
    mock: {
      role: "ops",
      respond: {
        "/ops/bookings": {
          items: [],
          total: 0,
          page: 1,
          pageSize: 25,
          counts: { all: 0, unassigned: 0, noShows: 0 },
        },
      },
    },
  },
  render: () => <BookingsView />,
};

export const BookingsPhone: S = {
  name: "Bookings: Phone",
  parameters: { mock: { role: "ops" }, viewport: { defaultViewport: "phone" } },
  render: () => <BookingsView />,
};

export const LedgerSuccess: S = {
  name: "Ledger: Success",
  parameters: { mock: { role: "ops" } },
  render: () => <LedgerView />,
};

export const LedgerLoading: S = {
  name: "Ledger: Loading",
  parameters: { mock: { role: "ops", loading: ["/ops/ledger"] } },
  render: () => <LedgerView />,
};

export const LedgerError: S = {
  name: "Ledger: Error",
  parameters: { mock: { role: "ops", error: ["/ops/ledger"] } },
  render: () => <LedgerView />,
};

export const LedgerEmpty: S = {
  name: "Ledger: Empty",
  parameters: {
    mock: {
      role: "ops",
      respond: {
        "/ops/ledger": {
          items: [],
          total: 0,
          page: 1,
          pageSize: 25,
          totals: { payments: 0, refunds: 0, credits: 0, net: 0 },
        },
      },
    },
  },
  render: () => <LedgerView />,
};

export const LedgerPhone: S = {
  name: "Ledger: Phone",
  parameters: { mock: { role: "ops" }, viewport: { defaultViewport: "phone" } },
  render: () => <LedgerView />,
};

export const PanelistsSuccess: S = {
  name: "Panelists: Success",
  parameters: { mock: { role: "ops" } },
  render: () => <PanelistsView />,
};

export const PanelistsLoading: S = {
  name: "Panelists: Loading",
  parameters: { mock: { role: "ops", loading: ["/ops/panelists"] } },
  render: () => <PanelistsView />,
};

export const PanelistsError: S = {
  name: "Panelists: Error",
  parameters: { mock: { role: "ops", error: ["/ops/panelists"] } },
  render: () => <PanelistsView />,
};

export const PanelistsEmpty: S = {
  name: "Panelists: Empty",
  parameters: {
    mock: {
      role: "ops",
      respond: {
        "/ops/panelists": {
          items: [],
          total: 0,
          page: 1,
          pageSize: 25,
          counts: { all: 0, needsAttention: 0, paused: 0 },
        },
      },
    },
  },
  render: () => <PanelistsView />,
};

export const PanelistsPhone: S = {
  name: "Panelists: Phone",
  parameters: { mock: { role: "ops" }, viewport: { defaultViewport: "phone" } },
  render: () => <PanelistsView />,
};

export const ApplicationsSuccess: S = {
  name: "Applications: Success",
  parameters: { mock: { role: "ops" } },
  render: () => <ApplicationsView />,
};

export const ApplicationsLoading: S = {
  name: "Applications: Loading",
  parameters: { mock: { role: "ops", loading: ["/ops/applications"] } },
  render: () => <ApplicationsView />,
};

export const ApplicationsError: S = {
  name: "Applications: Error",
  parameters: { mock: { role: "ops", error: ["/ops/applications"] } },
  render: () => <ApplicationsView />,
};

export const ApplicationsEmpty: S = {
  name: "Applications: Empty",
  parameters: {
    mock: {
      role: "ops",
      respond: {
        "/ops/applications": { items: [], counts: { pending: 0, approved: 0, rejected: 0 } },
      },
    },
  },
  render: () => <ApplicationsView />,
};

export const ApplicationsPhone: S = {
  name: "Applications: Phone",
  parameters: { mock: { role: "ops" }, viewport: { defaultViewport: "phone" } },
  render: () => <ApplicationsView />,
};
