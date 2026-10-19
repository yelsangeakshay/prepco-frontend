/** Lazy toast: keeps sonner out of page bundles until a toast is actually shown. */
export function notify(message: string) {
  void import("sonner").then(({ toast }) => toast.success(message));
}
