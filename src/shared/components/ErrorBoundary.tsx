// ErrorBoundary — catches render errors before they crash the whole tree.
//
// Enterprise apps MUST have a top-level error boundary. Without it, one
// buggy component (unhandled promise, undefined destructure) kills the
// entire app and users see a white screen with no way to recover.

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO(observability): forward to Sentry / Datadog RUM / your OTel
    // exporter here. See src/telemetry/otel.ts for the browser tracer.
    // eslint-disable-next-line no-console
    console.error('React error boundary caught:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-md space-y-3 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong.</h1>
          <p className="text-sm text-muted-foreground">
            The application encountered an error and can't recover. Refresh the page.
          </p>
          <p className="text-xs text-muted-foreground">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
