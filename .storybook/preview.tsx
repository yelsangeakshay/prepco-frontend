import type { Preview } from "@storybook/react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpResponse, http } from "msw";
import "../app/globals.css";

// Storybook loads fonts from Google Fonts; the app itself uses next/font.
const fonts = document.createElement("link");
fonts.rel = "stylesheet";
fonts.href =
  "https://fonts.googleapis.com/css2?family=Caveat&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap";
document.head.appendChild(fonts);

(window as unknown as { __PREPCO_NO_LATENCY__: boolean }).__PREPCO_NO_LATENCY__ = true;

/** Per-story mock setup. Set it on a story as `parameters.mock`. */
export interface MockParams {
  /** One of the scenarios in lib/config/scenarios.ts. */
  scenario?: string;
  role?: "student" | "panelist" | "ops";
  /** Endpoints (without /api/v1) that never answer: shows the loading state. */
  loading?: string[];
  /** Endpoints that answer 500: shows the error state. */
  error?: string[];
  /** Endpoints that answer with this body: shows empty or edge states. */
  respond?: Record<string, unknown>;
}

let started: Promise<unknown> | null = null;
const API = "*/api/v1";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "cream", values: [{ name: "cream", value: "#F5F2EA" }] },
    viewport: {
      viewports: {
        phone: { name: "Phone 390", styles: { width: "390px", height: "844px" } },
        tablet: { name: "Tablet 768", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop 1280", styles: { width: "1280px", height: "800px" } },
      },
    },
  },
  loaders: [
    async ({ parameters }) => {
      const mock = (parameters.mock ?? {}) as MockParams;
      const [{ worker }, { resetDb }, { clearSnapshot }] = await Promise.all([
        import("../mocks/browser"),
        import("../mocks/db"),
        import("../mocks/persist"),
      ]);
      started ??= worker.start({ onUnhandledFrame: "bypass", quiet: true });
      await started;

      // Every story starts from a fresh mock world.
      worker.resetHandlers();
      clearSnapshot();
      resetDb();
      const set = (name: string, value: string | undefined) => {
        document.cookie = value ? `${name}=${value}; path=/` : `${name}=; path=/; max-age=0`;
      };
      set("prepco_scenario", mock.scenario);
      set("prepco_role", mock.role ?? "student");

      for (const p of mock.loading ?? []) {
        worker.use(http.all(`${API}${p}`, () => new Promise(() => {})));
      }
      for (const p of mock.error ?? []) {
        worker.use(
          http.all(`${API}${p}`, () =>
            HttpResponse.json(
              { code: "server_error", message: "Something broke" },
              { status: 500 },
            ),
          ),
        );
      }
      for (const [p, body] of Object.entries(mock.respond ?? {})) {
        worker.use(http.get(`${API}${p}`, () => HttpResponse.json(body as object)));
      }
      return {};
    },
  ],
  decorators: [
    (Story) => {
      // A fresh cache per story.
      const [client] = useState(
        () => new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } }),
      );
      return (
        <QueryClientProvider client={client}>
          <div
            style={
              {
                "--font-inter": "Inter",
                "--font-playfair": "'Playfair Display'",
                "--font-caveat": "Caveat",
              } as React.CSSProperties
            }
          >
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
};

export default preview;
