import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Legacy CRA code uses plain <img>, raw quotes/apostrophes in JSX text,
      // and prop-types-style PropTypes. Disable these to allow a 1:1 port.
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-key": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Vendor assets ported from the CRA app — don't lint third-party JS.
      "app/assets/**",
    ],
  },
];

export default eslintConfig;
