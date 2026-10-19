"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Loader2, UploadCloud, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { ROUTES } from "@/lib/config/routes";
import { markOnboarded } from "@/lib/auth/client";
import { useApiReady } from "@/components/shell/Providers";
import { useOnboardingDraft } from "../draft";
import { useUploadCv } from "../hooks/useOnboarding";
import { validateCvFile } from "../schemas";
import { OnboardingLayout } from "./OnboardingLayout";

/** E2: reading / done / failed, plus a consent checkbox. */
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

  const finish = () => {
    markOnboarded();
    clearDraft();
    router.push(ROUTES.student.freeSession);
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

  return (
    <OnboardingLayout
      step={3}
      total={3}
      title="Upload your CV"
      subtitle="We read it once to pre-fill your CV Builder. PDF or DOCX, up to 5 MB."
    >
      {result?.status === "done" ? (
        <div className="space-y-4">
          <div role="status" className="rounded-card flex gap-3 bg-green-100 p-4 text-sm">
            <CheckCircle2 className="size-5 shrink-0 text-green-600" aria-hidden />
            <div>
              <p className="font-semibold">CV read successfully</p>
              <p className="text-navy-400">
                Found {result.extracted?.roles} roles, {result.extracted?.bullets} bullets and{" "}
                {result.extracted?.education}.
              </p>
            </div>
          </div>
          <Button className="w-full" onClick={finish}>
            Continue
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            ref={inputRef}
            id="cv-file"
            aria-label="Choose your CV file"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-card border-line hover:bg-cream flex min-h-28 w-full flex-col items-center justify-center gap-2 border-2 border-dashed bg-white p-4 text-sm"
          >
            {file ? (
              <>
                <FileText className="text-maroon-600 size-6" aria-hidden />
                <span className="font-semibold">{file.name}</span>
                <span className="text-navy-400">
                  {(file.size / 1024).toFixed(0)} KB · tap to change
                </span>
              </>
            ) : (
              <>
                <UploadCloud className="text-navy-400 size-6" aria-hidden />
                <span className="font-semibold">Choose your CV</span>
              </>
            )}
          </button>
          <FieldError>{fileError ?? undefined}</FieldError>

          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setConsentError(false);
              }}
              className="accent-maroon-600 mt-0.5 size-5"
            />
            <span>
              I agree that The Prep Co may read my CV to build my profile and share it with my
              panelists.
            </span>
          </label>
          <FieldError>{consentError ? "Please give consent to continue." : undefined}</FieldError>

          {reading && (
            <p role="status" className="text-navy-400 flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Reading your CV…
            </p>
          )}
          {failed && (
            <div
              role="alert"
              className="bg-maroon-100 text-maroon-600 rounded-card flex gap-3 p-4 text-sm"
            >
              <XCircle className="size-5 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">We could not read your CV</p>
                <p>{result?.reason ?? "Something went wrong. Please try again."}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={onUpload} disabled={reading || !ready}>
              {failed ? "Try Again" : "Upload CV"}
            </Button>
            <Button variant="secondary" onClick={finish} disabled={reading}>
              Skip For Now
            </Button>
          </div>
        </div>
      )}
    </OnboardingLayout>
  );
}
