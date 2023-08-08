import { Component, ErrorInfo, ReactNode } from 'react';

import ContextualErrorPage from 'lib/components/core/layouts/ContextualErrorPage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      info: null,
    };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ hasError: true, error, info });
  }

  override render(): ReactNode {
    const { hasError, error, info } = this.state;

    if (!hasError) return this.props.children;

    return (
      <ContextualErrorPage from={error} stack={info}>
        <main>
          <h1>Something went wrong.</h1>
          <h2>{error?.toString()}</h2>
          <pre>
            Component Stack
            {info?.componentStack}
          </pre>
          <pre>{error?.stack}</pre>
        </main>
      </ContextualErrorPage>
    );
  }
}

export default ErrorBoundary;
