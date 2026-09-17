import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      // Türkçe metinlerdeki kesme işaretleri (Erik'in vb.) için gereksiz;
      // React metni zaten güvenli escape eder.
      "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/components/ui/**",
    "src/types/database.ts",
  ]),
]);

export default eslintConfig;
