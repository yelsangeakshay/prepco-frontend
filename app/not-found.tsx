import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center p-6 text-center">
      <p className="text-gold-500 font-display text-6xl font-bold">404</p>
      <h1 className="font-display mt-2 text-2xl font-bold">We could not find that page</h1>
      <p className="text-navy-400 mt-2 text-sm">The link may be old, or the page has moved.</p>
      <Link
        href="/"
        className="bg-maroon-600 hover:bg-maroon-700 rounded-control mt-6 inline-flex min-h-11 items-center px-5 text-sm font-semibold text-white"
      >
        Go Home
      </Link>
    </main>
  );
}
