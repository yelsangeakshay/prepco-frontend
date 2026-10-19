import { Card } from "@/components/ui/card";
import type { Cv } from "../schemas";

/** Plain read-only rendering of the draft, as a panelist would read it. Loaded lazily. */
export default function CvPreview({ cv }: { cv: Cv }) {
  return (
    <Card aria-label="CV preview" className="font-display space-y-4 p-6 text-sm leading-relaxed">
      <div>
        <p className="text-xl font-bold">Draft preview</p>
        <p className="text-navy-400 font-sans text-xs">As a panelist reads it</p>
      </div>
      {cv.draft.sections.map((s) => (
        <section key={s.id}>
          <h3 className="border-line border-b pb-1 font-sans text-xs font-semibold tracking-widest uppercase">
            {s.title}
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {s.bullets.map((b) => (
              <li key={b.id}>{b.text}</li>
            ))}
          </ul>
        </section>
      ))}
    </Card>
  );
}
