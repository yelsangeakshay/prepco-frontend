import type { Preview } from "@storybook/react";
import "../app/globals.css";

// Storybook loads fonts from Google Fonts; the app itself uses next/font.
const fonts = document.createElement("link");
fonts.rel = "stylesheet";
fonts.href =
  "https://fonts.googleapis.com/css2?family=Caveat&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap";
document.head.appendChild(fonts);

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
  decorators: [
    (Story) => (
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
    ),
  ],
};

export default preview;
