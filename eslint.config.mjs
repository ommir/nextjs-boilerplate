import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Copy in this boilerplate is intentionally rich; escaping every apostrophe adds noise.
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // Security guard rails.
  //
  // These encode rules that are otherwise only written down in a doc nobody
  // re-reads. A reviewer can miss `getSession()` in a diff; the linter cannot.
  // -------------------------------------------------------------------------
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.property.name='getSession'][callee.object.property.name='auth']",
          message:
            "supabase.auth.getSession() does not revalidate the token and its data comes straight from cookies, which a client can forge. Use getClaims() — it verifies the JWT signature — for anything that gates access.",
        },
        {
          selector:
            "MemberExpression[object.property.name='env'] > Identifier[name=/SERVICE_ROLE|SECRET_KEY/]",
          message:
            "The Supabase secret/service-role key bypasses RLS entirely. This app is designed not to need it — every query runs as the signed-in user. If you genuinely need it, isolate it behind `server-only` and justify it in review.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@supabase/supabase-js",
              importNames: ["createClient"],
              message:
                "Use @/lib/supabase/server (RSC, actions, route handlers) or @/lib/supabase/client (browser). Those wire up cookie-based sessions; a raw createClient does not, and would silently run unauthenticated.",
            },
          ],
        },
      ],
      // Product copy is rendered as text; there is no sanitiser in this app, so
      // there is no safe use of this prop here.
      "react/no-danger": "error",
    },
  },

  // The browser client is the one legitimate place a client component may talk
  // to Supabase directly (auth state listener / sign-out).
  {
    files: ["src/lib/supabase/**/*.ts"],
    rules: { "no-restricted-imports": "off" },
  },

  {
    ignores: [".next/**", "coverage/**", "playwright-report/**", "supabase/**"],
  },
];

export default eslintConfig;
