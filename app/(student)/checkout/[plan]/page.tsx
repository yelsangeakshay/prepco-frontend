import type { Metadata } from "next";
import { CheckoutView } from "@/features/checkout/components/CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default async function Page({ params }: { params: Promise<{ plan: string }> }) {
  const { plan } = await params;
  return <CheckoutView planId={plan} />;
}
