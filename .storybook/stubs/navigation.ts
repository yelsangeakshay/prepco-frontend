/** Storybook stand-in for next/navigation. Navigation is a no-op. */
const noop = () => {};

export const useRouter = () => ({
  push: noop,
  replace: noop,
  back: noop,
  forward: noop,
  refresh: noop,
  prefetch: noop,
});
export const usePathname = () => "/";
export const useParams = () => ({});
export const useSearchParams = () =>
  new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
export const notFound = () => {
  throw new Error("notFound() called in a story");
};
export const redirect = () => {
  throw new Error("redirect() called in a story");
};
