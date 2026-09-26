import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('Uncaught error:', error, errorInfo);
    
    // Log to error monitoring service
    // Example: Sentry.captureException(error);
  }
  
  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-5 py-4 rounded-lg shadow-sm" role="alert">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-6 h-6 mr-2" />
            <h3 className="text-lg font-semibold">
              {this.props.componentName 
                ? `Error in ${this.props.componentName}` 
                : 'Something went wrong'}
            </h3>
          </div>
          
          <div className="mb-3 text-sm">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          
          <button 
            onClick={this.handleReset} 
            className="inline-flex items-center px-3 py-1.5 text-sm bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Try Again
          </button>
          
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="mt-3 text-xs whitespace-pre-wrap">
              <summary className="cursor-pointer text-red-600 dark:text-red-400 font-medium">
                Stack Trace
              </summary>
              <pre className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;