import path from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

const stub = (name: string) => path.resolve(__dirname, "stubs", name);

const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(ts|tsx)",
    "../features/**/*.stories.@(ts|tsx)",
    "../stories/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  staticDirs: ["../public"],
  async viteFinal(config) {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    config.resolve = {
      ...config.resolve,
      alias: [
        // Views import Next.js modules. Storybook is not Next, so give them tiny stand-ins.
        { find: /^next\/link$/, replacement: stub("link.tsx") },
        { find: /^next\/navigation$/, replacement: stub("navigation.ts") },
        { find: /^next\/dynamic$/, replacement: stub("dynamic.tsx") },
        { find: "@", replacement: path.resolve(__dirname, "..") },
      ],
    };
    // tsconfig has jsx: preserve (for Next); stories need the automatic React runtime.
    config.esbuild = { ...config.esbuild, jsx: "automatic" };
    // The API client reads these at build time in Next; stories talk to the MSW worker.
    config.define = {
      ...config.define,
      "process.env.NEXT_PUBLIC_API_MOCKING": JSON.stringify("off"),
      "process.env.NEXT_PUBLIC_API_BASE_URL": JSON.stringify("/api/v1"),
    };
    return config;
  },
};

export default config;
