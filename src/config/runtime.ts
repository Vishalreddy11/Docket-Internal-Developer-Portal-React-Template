// Runtime configuration loader.
//
// Patterns applied (see ARCHITECTURE.md):
//   - Runtime config over build-time env — one image, N environments.
//     The container reads /config/runtime-config.json served by nginx from
//     a K8s ConfigMap mount. In dev, we fall back to import.meta.env (via
//     .env.example) so developers don't need to maintain both.
//   - Fail-fast — config is validated by Zod at boot. Invalid config
//     throws before the first render.
//   - Single source of truth — no other module reads process.env /
//     import.meta.env directly. All settings flow through here.
//
// SECURITY: anything shipped to the browser is public. This file MUST NOT
// contain API keys, client secrets, or backend credentials.

import { z } from 'zod';

const RuntimeConfigSchema = z.object({
  apiBaseUrl: z.string().default(''),
  authMode: z.enum(['oidc', 'mock', 'none']).default('mock'),
  oidc: z.object({
    issuer: z.string().default(''),
    clientId: z.string().default(''),
    redirectUri: z.string().default(''),
    scopes: z.string().default('openid profile email'),
  }),
  environment: z.string().default('development'),
  enableTelemetry: z.boolean().default(false),
  otelEndpoint: z.string().default(''),
});

export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>;

let cached: RuntimeConfig | undefined;

/**
 * Load the runtime config once at app boot.
 *
 * In production, fetches /config/runtime-config.json (mounted from a K8s
 * ConfigMap by the operator). In dev, if the file isn't found, falls back
 * to Vite's import.meta.env (VITE_* keys from .env.local).
 */
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (cached) return cached;

  const fromFile = await tryFetchConfigFile();
  const fromEnv = configFromViteEnv();
  const merged = { ...fromEnv, ...fromFile };

  cached = RuntimeConfigSchema.parse(merged);
  return cached;
}

async function tryFetchConfigFile(): Promise<Partial<RuntimeConfig>> {
  try {
    const res = await fetch('/config/runtime-config.json', { cache: 'no-store' });
    if (!res.ok) return {};
    return (await res.json()) as Partial<RuntimeConfig>;
  } catch {
    return {};
  }
}

function configFromViteEnv(): Partial<RuntimeConfig> {
  const env = import.meta.env;
  return {
    apiBaseUrl: env.VITE_API_BASE_URL || '',
    authMode: (env.VITE_AUTH_MODE as RuntimeConfig['authMode']) || 'mock',
    oidc: {
      issuer: env.VITE_OIDC_ISSUER || '',
      clientId: env.VITE_OIDC_CLIENT_ID || '',
      redirectUri: env.VITE_OIDC_REDIRECT_URI || '',
      scopes: env.VITE_OIDC_SCOPES || 'openid profile email',
    },
  };
}

export function getRuntimeConfig(): RuntimeConfig {
  if (!cached) {
    throw new Error('runtime config accessed before loadRuntimeConfig()');
  }
  return cached;
}
