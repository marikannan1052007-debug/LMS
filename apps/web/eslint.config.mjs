import { defineConfig, globalIgnores } from "eslint/config";
import nextConfig from "eslint-config-next";

export default defineConfig([
  ...nextConfig,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);