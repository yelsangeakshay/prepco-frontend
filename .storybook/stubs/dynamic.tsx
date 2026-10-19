import { Suspense, lazy, type ComponentType, type ReactNode } from "react";

interface Options {
  ssr?: boolean;
  loading?: () => ReactNode;
}

/** Storybook stand-in for next/dynamic, built on React.lazy. */
export default function dynamic<P extends object>(
  loader: () => Promise<ComponentType<P> | { default: ComponentType<P> }>,
  options: Options = {},
): ComponentType<P> {
  const Lazy = lazy(async () => {
    const mod = await loader();
    return "default" in (mod as object)
      ? (mod as { default: ComponentType<P> })
      : { default: mod as ComponentType<P> };
  });
  return function Dynamic(props: P) {
    return (
      <Suspense fallback={options.loading?.() ?? null}>
        <Lazy {...(props as P & object)} />
      </Suspense>
    );
  };
}
