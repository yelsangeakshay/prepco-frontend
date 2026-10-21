"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, FileX, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/config/routes";
import { markOnboarded } from "@/lib/auth/client";
import { useApiReady } from "@/components/shell/Providers";
import { useOnboardingDraft } from "../draft";
import { useUploadCv } from "../hooks/useOnboarding";
import { validateCvFile } from "../schemas";
import { OnboardingLayout } from "./OnboardingLayout";

type Tone = "plain" | "done" | "error";

function StatusCard({
  title,
  pill,
  tone,
  alert,
  children,
}: {
  title: string;
  pill: string;
  tone: Tone;
  alert?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      role={alert ? "alert" : undefined}
      className={cn(
        "rounded-feature bg-white p-6",
        tone === "plain" && "border-line border",
        tone === "done" && "border-2 border-green-600/40",
        tone === "error" && "border-maroon-600 border-2",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase",
            tone === "plain" && "text-navy-400 bg-cream-soft",
            tone === "done" && "bg-green-100 text-green-600",
            tone === "error" && "bg-maroon-100 text-maroon-600",
          )}
        >
          {pill}
        </span>
      </div>
      {children}
    </section>
  );
}

function FileCard({ name, detail, bad }: { name: string; detail: string; bad?: boolean }) {
  const Icon = bad ? FileX : FileText;
  return (
    <div className="bg-cream rounded-card mt-4 flex items-center gap-3 p-4">
      <Icon className="text-maroon-600 size-6 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="truncate font-semibold">{name}</p>
        <p className="text-navy-400 text-sm">{detail}</p>
      </div>
    </div>
  );
}

/** E2 (e02.png): reading, done and failed states on one screen, a drop zone and the consent box. */
export function CvUpload() {
  const router = useRouter();
  const ready = useApiReady();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadCv();
  const clearDraft = useOnboardingDraft((s) => s.clear);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const finish = (to: string = ROUTES.student.freeSession) => {
    markOnboarded();
    clearDraft();
    router.push(to);
    router.refresh();
  };

  const onPick = (f: File | undefined) => {
    if (!f) return;
    const err = validateCvFile(f);
    setFileError(err);
    setFile(err ? null : f);
    upload.reset();
  };

  const onUpload = () => {
    if (!file) return setFileError("Choose your CV first.");
    if (!consent) return setConsentError(true);
    upload.mutate({ fileName: file.name, size: file.size, consent: true });
  };

  const result = upload.data;
  const reading = upload.isPending;
  const failed = upload.isError || result?.status === "failed";
  const done = result?.status === "done" ? result.extracted : null;

  return (
    <OnboardingLayout
      step={3}
      title="Upload the CV you have today"
      subtitle="Any version. We read it before your free session, and it becomes V1 in the CV Builder."
    >
      <div className="space-y-6">
        {reading && file && (
          <StatusCard title="Reading your CV" pill="In progress" tone="plain">
            <div role="status">
              <FileCard
                name={file.name}
                detail={`${Math.max(1, Math.round(file.size / 1024))} KB`}
              />
              <div className="bg-line mt-5 h-2 overflow-hidden rounded-full">
                <div className="from-maroon-600 to-gold-500 h-full w-3/5 animate-pulse rounded-full bg-gradient-to-r" />
              </div>
              <p className="text-navy-400 mt-3 text-sm">
                Finding sections and bullets... usually under 20 seconds.
              </p>
            </div>
          </StatusCard>
        )}

        {done && (
          <StatusCard title="Done. This is your V1." pill="Read" tone="done">
            <div role="status">
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <li>✓ Education · {done.education}</li>
                <li>✓ Work experience · {done.workBullets} bullets</li>
                <li>✓ Projects · {done.projects}</li>
                <li>✓ Achievements · {done.achievements}</li>
              </ul>
              <p className="text-navy-400 mt-4 text-sm">
                First score: <strong className="text-navy-900">{done.score}/100</strong>.
                That&apos;s normal for a first draft; the builder shows you why.
              </p>
              <Button className="mt-5 w-full" onClick={() => finish()}>
                Finish and book free session
              </Button>
            </div>
          </StatusCard>
        )}

        {failed && (
          <StatusCard title="We couldn't read this file" pill="Error" tone="error" alert>
            <div>
              <FileCard
                name={file?.name ?? "Your file"}
                detail={result?.reason ?? "Something went wrong."}
                bad
              />
              <p className="mt-4 text-[15px]">
                Upload the Word or PDF version, or type it in. Nothing is lost; your onboarding
                answers are saved.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => inputRef.current?.click()}>Upload another file</Button>
                <Button variant="secondary" onClick={() => finish(ROUTES.student.cv)}>
                  Enter manually
                </Button>
              </div>
            </div>
          </StatusCard>
        )}

        {!done && (
          <>
            <input
              ref={inputRef}
              id="cv-file"
              aria-label="Choose your CV file"
              type="file"
              accept=".pdf,.doc,.docx,application/msword,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(e) => onPick(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-feature border-maroon-600/30 hover:bg-cream-soft flex min-h-36 w-full flex-col items-center justify-center gap-2 border-2 border-dashed bg-white/60 p-4 text-center"
            >
              {file ? (
                <>
                  <FileText className="text-maroon-600 size-6" aria-hidden />
                  <span className="font-semibold">{file.name}</span>
                  <span className="text-navy-400 text-sm">
                    {(file.size / 1024).toFixed(0)} KB · tap to change
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud className="text-maroon-600 size-6" aria-hidden />
                  <span className="font-semibold">
                    Drop a PDF or Word file, or <u className="text-maroon-600">browse</u>
                  </span>
                  <span className="text-navy-400 text-sm">Up to 5 MB · PDF, DOC, DOCX</span>
                </>
              )}
            </button>
            <FieldError>{fileError ?? undefined}</FieldError>
          </>
        )}

        <section className="rounded-feature border-line border bg-white p-6">
          <h2 className="text-maroon-600 text-xs font-semibold tracking-[0.18em] uppercase">
            Your panel sees your history
          </h2>
          <label className="mt-4 flex min-h-11 items-start gap-3 text-[15px]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setConsentError(false);
              }}
              className="accent-maroon-600 mt-0.5 size-5 shrink-0"
            />
            <span>
              Let my assigned panelists read my locked CV, profiling notes, answer bank and past
              feedback.{" "}
              <span className="text-navy-400">
                This continuity is how the panel at P3 knows what you said at P1. You can see
                exactly what&apos;s shared in Profile.
              </span>
            </span>
          </label>
          <FieldError>{consentError ? "Please give consent to continue." : undefined}</FieldError>
        </section>

        {!done && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={onUpload} disabled={reading || !ready}>
              Upload CV
            </Button>
            <Button variant="secondary" onClick={() => finish()} disabled={reading}>
              Skip for now
            </Button>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
