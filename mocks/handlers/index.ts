import { accountHandlers } from "./account";
import { answerHandlers } from "./answers";
import { cvHandlers } from "./cv";
import { authHandlers } from "./auth";
import { feedbackHandlers } from "./feedback";
import { onboardingHandlers } from "./onboarding";
import { plansHandlers } from "./plans";
import { runwayHandlers } from "./runway";

export const handlers = [
  ...authHandlers,
  ...onboardingHandlers,
  ...plansHandlers,
  ...runwayHandlers,
  ...feedbackHandlers,
  ...cvHandlers,
  ...answerHandlers,
  ...accountHandlers,
];
