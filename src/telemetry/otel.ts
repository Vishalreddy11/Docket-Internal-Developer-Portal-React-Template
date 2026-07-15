// Browser OpenTelemetry setup — OPT-IN, gated on runtime config.
//
// This template does NOT wire OTel by default. Reasons:
//   1. Adding @opentelemetry/sdk-trace-web to the bundle adds ~50KB gzipped.
//   2. Frontend tracing has real privacy implications (URLs may contain
//      customer IDs, PII in query params, etc.) that need company approval.
//   3. Enterprise policies often route browser telemetry to a specific
//      collector — Datadog RUM, Grafana Faro, Elastic APM Real-User
//      Monitoring — each with its own SDK. Committing to one wastes
//      forkers' time.
//
// TODO(observability): When you enable this, use the vendor SDK your
// company mandates. If it's raw OTLP, install:
//     pnpm add @opentelemetry/api @opentelemetry/sdk-trace-web \
//              @opentelemetry/instrumentation-fetch \
//              @opentelemetry/exporter-trace-otlp-http
// and follow the pattern in the backend template's tracing.ts — set up
// the tracer BEFORE any component that emits spans is imported.
//
// KEY RULES (privacy + security):
//   - NEVER capture Authorization headers, cookies, or query params
//     that could contain tokens.
//   - NEVER capture form field values.
//   - NEVER capture the full response body — only status + duration.
//   - Sample aggressively — 1-5% is plenty for a real user population.

import { getRuntimeConfig } from '@/config/runtime';

export function initTelemetry(): void {
  const cfg = getRuntimeConfig();
  if (!cfg.enableTelemetry) return;
  if (!cfg.otelEndpoint) {
    // eslint-disable-next-line no-console
    console.warn('[telemetry] enableTelemetry=true but otelEndpoint is empty');
    return;
  }
  // Wire your SDK here — see TODO above.
  // eslint-disable-next-line no-console
  console.info('[telemetry] endpoint configured:', cfg.otelEndpoint);
}
