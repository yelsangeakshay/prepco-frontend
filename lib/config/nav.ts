import {
  BookOpen,
  Briefcase,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquareText,
  Route,
  Shuffle,
  UserCog,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/auth/roles";
import { ROUTES } from "./routes";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Static badge text (e.g. "Elite") or a count. */
  badge?: string;
  badgeTone?: "gold" | "maroon";
  /** Pinned in the phone bottom bar; the rest go in the "More" sheet. */
  mobile?: boolean;
  /** Only match when pathname equals href exactly. */
  exact?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface NavConfig {
  sections: NavSection[];
}

const s = ROUTES.student;
const p = ROUTES.panelist;
const o = ROUTES.ops;

/** ONLY source of sidebar links per role. */
export const NAV: Record<Role, NavConfig> = {
  student: {
    sections: [
      {
        title: "Your runway",
        items: [
          { label: "Home", href: s.home, icon: Home, mobile: true },
          { label: "Sessions & runway", href: s.sessions, icon: CalendarClock, mobile: true },
          { label: "Panel feedback", href: s.feedback, icon: MessageSquareText, mobile: true },
          { label: "Journey & routes", href: s.journey, icon: Route },
        ],
      },
      {
        title: "Tools",
        items: [
          { label: "CV Builder", href: s.cv, icon: FileText, mobile: true },
          { label: "HR Question Builder", href: s.answers, icon: BookOpen, mobile: true },
          { label: "Quick Switch", href: s.quickSwitch, icon: Shuffle },
          {
            label: "Case track",
            href: s.caseTrack,
            icon: Briefcase,
            badge: "Elite",
            badgeTone: "gold",
          },
        ],
      },
      {
        title: "Account",
        items: [
          { label: "Plan & billing", href: s.billing, icon: CreditCard },
          { label: "Profile", href: s.profile, icon: UserRound },
        ],
      },
    ],
  },
  panelist: {
    sections: [
      {
        title: "Panels",
        items: [
          { label: "Today", href: p.today, icon: CalendarDays, mobile: true },
          { label: "Pre-panel briefs", href: p.briefs, icon: ClipboardList, mobile: true },
          { label: "Scoring & feedback", href: p.scoring, icon: ClipboardCheck, mobile: true },
          { label: "Availability", href: p.availability, icon: CalendarClock, mobile: true },
        ],
      },
      {
        title: "Account",
        items: [{ label: "Profile", href: p.profile, icon: UserRound }],
      },
    ],
  },
  ops: {
    sections: [
      {
        title: "Cohort",
        items: [
          { label: "Overview", href: o.overview, icon: LayoutDashboard, exact: true, mobile: true },
          { label: "Students", href: o.students, icon: Users, mobile: true },
          {
            label: "Panel assignment",
            href: o.assignments,
            icon: UserCog,
            badge: "7",
            badgeTone: "maroon",
            mobile: true,
          },
          { label: "Sessions & bookings", href: o.sessions, icon: CalendarDays, mobile: true },
        ],
      },
      {
        title: "Business",
        items: [
          { label: "Plans & credits", href: o.ledger, icon: Wallet },
          { label: "Panelists", href: o.panelists, icon: UsersRound },
        ],
      },
    ],
  },
};

/** Footer cards under the sidebar. */
export const NAV_FOOTER = {
  student: { plan: "Premium", doneLabel: "2 of 6 runway sessions done", done: 2, total: 6 },
  panelist: { function: "Marketing & Brand", panelsThisSeason: 12 },
  ops: { season: "Season 1", day0Label: "Day 0 · Mon 9 Nov" },
} as const;

export const ROLE_PROFILE: Record<Role, { name: string; initials: string; subtitle: string }> = {
  student: { name: "Riya Kulkarni", initials: "RK", subtitle: "SCMHRD Pune · MBA 2025–27" },
  panelist: { name: "Arjun Mehta", initials: "AM", subtitle: "Marketing & Brand panelist" },
  ops: { name: "Ops team", initials: "OP", subtitle: "The Prep Co" },
};
