// Generated once from the screen list; edit freely.
// Every story starts from a fresh mock world. `parameters.mock` picks the scenario or forces
// loading, error and empty answers (see .storybook/preview.tsx).
import type { Meta, StoryObj } from "@storybook/react";
import { SignInForm } from "@/features/auth/components/SignInForm";
import { SignUpForm } from "@/features/auth/components/SignUpForm";
import { ForgotPasswordForm, ResetPasswordForm } from "@/features/auth/components/RecoveryForms";
import { VerifyEmailPanel } from "@/features/auth/components/VerifyEmailPanel";
import { ApplyForm } from "@/features/panelist/components/ApplyForm";
import { ApplicationSubmitted } from "@/features/panelist/components/ApplicationSubmitted";
import { OnboardingStep } from "@/features/onboarding/components/OnboardingSteps";
import { CvUpload } from "@/features/onboarding/components/CvUpload";

const meta: Meta = { title: "Views/Public and onboarding", parameters: { layout: "fullscreen" } };
export default meta;
type S = StoryObj;

export const SignInSuccess: S = {
  name: "Sign in: Success",
  parameters: { mock: { role: "student" } },
  render: () => <SignInForm />,
};

export const SignInPhone: S = {
  name: "Sign in: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <SignInForm />,
};

export const SignUpSuccess: S = {
  name: "Sign up: Success",
  parameters: { mock: { role: "student" } },
  render: () => <SignUpForm />,
};

export const SignUpPhone: S = {
  name: "Sign up: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <SignUpForm />,
};

export const ForgotPasswordSuccess: S = {
  name: "Forgot password: Success",
  parameters: { mock: { role: "student" } },
  render: () => <ForgotPasswordForm />,
};

export const ForgotPasswordPhone: S = {
  name: "Forgot password: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <ForgotPasswordForm />,
};

export const ResetPasswordSuccess: S = {
  name: "Reset password: Success",
  parameters: { mock: { role: "student" } },
  render: () => <ResetPasswordForm token="demo" />,
};

export const ResetPasswordPhone: S = {
  name: "Reset password: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <ResetPasswordForm token="demo" />,
};

export const VerifyEmailSuccess: S = {
  name: "Verify email: Success",
  parameters: { mock: { role: "student" } },
  render: () => <VerifyEmailPanel email="riya@example.com" />,
};

export const VerifyEmailPhone: S = {
  name: "Verify email: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <VerifyEmailPanel email="riya@example.com" />,
};

export const ApplyToBeAPanelistSuccess: S = {
  name: "Apply to be a panelist: Success",
  parameters: { mock: { role: "student" } },
  render: () => <ApplyForm />,
};

export const ApplyToBeAPanelistPhone: S = {
  name: "Apply to be a panelist: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <ApplyForm />,
};

export const ApplicationSubmittedSuccess: S = {
  name: "Application submitted: Success",
  parameters: { mock: { role: "student" } },
  render: () => <ApplicationSubmitted />,
};

export const ApplicationSubmittedPhone: S = {
  name: "Application submitted: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <ApplicationSubmitted />,
};

export const OnboardingStep1Success: S = {
  name: "Onboarding step 1: Success",
  parameters: { mock: { role: "student" } },
  render: () => <OnboardingStep step={1} />,
};

export const OnboardingStep1Phone: S = {
  name: "Onboarding step 1: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <OnboardingStep step={1} />,
};

export const OnboardingStep2Success: S = {
  name: "Onboarding step 2: Success",
  parameters: { mock: { role: "student" } },
  render: () => <OnboardingStep step={2} />,
};

export const OnboardingStep2Phone: S = {
  name: "Onboarding step 2: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <OnboardingStep step={2} />,
};

export const OnboardingStep3Success: S = {
  name: "Onboarding step 3: Success",
  parameters: { mock: { role: "student" } },
  render: () => <OnboardingStep step={3} />,
};

export const OnboardingStep3Phone: S = {
  name: "Onboarding step 3: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <OnboardingStep step={3} />,
};

export const OnboardingLateJoinerSuccess: S = {
  name: "Onboarding late joiner: Success",
  parameters: { mock: { role: "student" } },
  render: () => <OnboardingStep step={1} lateJoiner />,
};

export const OnboardingLateJoinerPhone: S = {
  name: "Onboarding late joiner: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <OnboardingStep step={1} lateJoiner />,
};

export const CVUploadSuccess: S = {
  name: "CV upload: Success",
  parameters: { mock: { role: "student" } },
  render: () => <CvUpload />,
};

export const CVUploadPhone: S = {
  name: "CV upload: Phone",
  parameters: { mock: { role: "student" }, viewport: { defaultViewport: "phone" } },
  render: () => <CvUpload />,
};
