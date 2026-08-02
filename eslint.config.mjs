import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import nextEslint from "eslint-config-next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = [
  ...nextEslint,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "supabase/functions/**",
    ],
  },
];

export default config;
