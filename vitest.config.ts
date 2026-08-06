import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

/**
 * `pnpm test` was declared in package.json but had no config, so `@/` imports
 * could not resolve and no test could run. The alias mirrors the `paths` entry
 * in tsconfig.json (`@/*` → repo root) so tests import modules exactly the way
 * application code does.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules/**', '.next/**'],
    // lib/env.ts validates on import and throws without a full secret set, so
    // importing anything that touches it (middleware, auth) would fail here.
    env: { SKIP_ENV_VALIDATION: '1' },
  },
})
