import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Disable unescaped entities rule - too strict for content-heavy pages
      "react/no-unescaped-entities": "off",
      
      // Change no-explicit-any from error to warning
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Change unused vars from error to warning
      "@typescript-eslint/no-unused-vars": "warn",
      
      // Change exhaustive deps from error to warning
      "react-hooks/exhaustive-deps": "warn",
      
      // Change no-html-link-for-pages from error to warning
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
];

export default eslintConfig;
