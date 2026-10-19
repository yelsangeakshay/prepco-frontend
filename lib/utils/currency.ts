const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** formatINR(623293) -> "₹6,23,293" */
export function formatINR(amount: number): string {
  return `${amount < 0 ? "-" : ""}₹${inr.format(Math.abs(Math.round(amount)))}`;
}
