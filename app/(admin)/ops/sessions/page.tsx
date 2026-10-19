import type { Metadata } from "next";
import { BookingsView } from "@/features/ops/components/BookingsView";

export const metadata: Metadata = { title: "Sessions & bookings" };

export default function Page() {
  return <BookingsView />;
}
