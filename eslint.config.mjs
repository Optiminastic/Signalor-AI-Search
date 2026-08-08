import { dirname } from 'path'
import { fileURLToPath } from 'url'

import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import importPlugin from 'eslint-plugin-import'
import prettierPlugin from 'eslint-plugin-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // Global ignores
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'dist/**',
      'coverage/**',
      'next-env.d.ts',
      '*.config.mjs',
      '*.config.js',
      '*.config.ts',
      // Ported ranking-fe marketing/site stack (features/site) — it follows the old
      // app's conventions, not this project's strict lint rules. Still type-checked
      // by tsc; just not linted here.
      'features/site/**',
      // Sanity Studio config/schemas (generated/tool-owned, default exports etc.)
      'sanity.cli.ts',
      'sanity/**',
      // BoardUI (ui.boardui.com) copy-in components. Vendored source in its own
      // style (double quotes, semicolons); still type-checked by tsc, just not
      // reformatted to this project's rules. Our brand-retint edits live here too.
      'components/base/**',
    ],
  },

  // Next.js core-web-vitals + TypeScript presets (flat-config natively)
  ...nextCoreWebVitals,
  ...nextTypescript,

  // Project-wide rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // ─── File & function size ───────────────────────────────────────────
      'max-lines': ['error', { max: 350, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': [
        'error',
        { max: 40, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      'max-params': ['error', 3],
      complexity: ['error', 10],
      'max-depth': ['error', 3],

      // ─── TypeScript strict ──────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // ─── Imports ────────────────────────────────────────────────────────
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-default-export': 'error',
      'import/no-duplicates': 'error',

      // ─── General quality ────────────────────────────────────────────────
      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-nested-ternary': 'error',

      // ─── Prettier ───────────────────────────────────────────────────────
      'prettier/prettier': 'error',
    },
  },

  // Allow default exports in Next.js App Router files & middleware
  {
    files: ['app/**/*.tsx', 'app/**/*.ts', 'middleware.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },

  // Relax strict size/complexity rules in legacy/landing components and
  // shadcn-generated UI primitives. These predate the strict ruleset and
  // tightening them is out of scope for this template setup.
  {
    files: [
      'components/**/*.tsx',
      'components/**/*.ts',
      'features/landing/**/*.tsx',
      'features/landing/**/*.ts',
      'hooks/**/*.ts',
      'hooks/**/*.tsx',
      // Ported ranking-fe marketing/tools/blog/creator pages live in the App
      // Router tree; they predate the strict ruleset (long compositions, lots of
      // copy with apostrophes/quotes). Correctness rules still apply everywhere.
      'app/**/*.tsx',
      'app/**/*.ts',
    ],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      complexity: 'off',
      'max-depth': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-default-export': 'off',
      'no-nested-ternary': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      '@next/next/no-img-element': 'off',
    },
  },

  // Ported marketing/tools pages import heavily from features/site; multi-line
  // @/features/site imports trigger import/order false-positives ("empty line within
  // group") that --fix can't resolve. Import ordering there is cosmetic — the core app
  // (lib/**, services/**, non-site features) keeps strict import/order.
  {
    files: ['app/**/*.tsx', 'app/**/*.ts'],
    rules: {
      'import/order': 'off',
    },
  },

  // Auth pages have necessarily long form components; relax fn-length only.
  {
    files: ['app/sign-in/**/*.tsx', 'app/sign-up/**/*.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },

  // Allow utility lib files (clsx/tailwind helpers) to skip explicit return types
  {
    files: ['lib/utils.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // Relax function length for test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
]

export default config
