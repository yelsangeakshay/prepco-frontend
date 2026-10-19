import type { Metadata, Viewport } from "next";
import { Caveat, Inter, Playfair_Display } from "next/font/google";
import dynamic from "next/dynamic";
import { Providers } from "@/components/shell/Providers";
import "./globals.css";

// Dev-only: the import is eliminated from production builds.
const DevToolbar =
  process.env.NODE_ENV === "production"
    ? () => null
    : dynamic(() => import("@/components/shell/DevToolbar").then((m) => m.DevToolbar));

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: { default: "The Prep Co", template: "%s · The Prep Co" },
  description: "MBA placement prep: mock panels, CV and answer builders, one runway to Day 0.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F5F2EA" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${caveat.variable}`}>
      <body>
        <Providers>
          {children}
          <DevToolbar />
        </Providers>
      </body>
    </html>
  );
}
