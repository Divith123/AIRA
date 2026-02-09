"use client";

import React, { useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('ErrorBoundary caught an error:', error.error);
      setHasError(true);
      setError(error.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('ErrorBoundary caught an unhandled promise rejection:', event.reason);
      setHasError(true);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleRetry = () => {
    setHasError(false);
    setError(null);
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            We encountered an error while loading the application. This might be due to a connection issue with the backend.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={handleRetry}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;