interface Props {
  code: string;
  title: string;
  params?: Record<string, string>;
}

/** Phase 1 stand-in. Replaced by the real screen in later phases. */
export function ScreenPlaceholder({ code, title, params }: Props) {
  return (
    <div data-testid="screen-placeholder" className="mx-auto max-w-3xl p-6 md:p-10">
      <p className="text-navy-400 text-xs font-semibold tracking-widest uppercase">Screen {code}</p>
      <h1 className="font-display mt-2 text-3xl font-bold md:text-4xl">{title}</h1>
      {params && (
        <p className="text-navy-400 mt-3 text-sm">
          {Object.entries(params)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}
