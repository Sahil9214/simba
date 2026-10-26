'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AuthClientService } from '@/lib/services/auth.client.service';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Auth Error Boundary
 * Catches authentication-related errors and forces logout to prevent white screens
 */
export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔒 Auth Error Boundary caught an error:', error, errorInfo);

    // Check if it's an authentication-related error
    const isAuthError =
      error.message?.includes('token') ||
      error.message?.includes('auth') ||
      error.message?.includes('unauthorized') ||
      error.message?.includes('401') ||
      error.message?.includes('session');

    if (isAuthError) {
      console.log('🔒 Authentication error detected - Forcing logout');

      // Clear session
      AuthClientService.clearSession();

      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });

    // Check if we have a valid session
    AuthClientService.getSession().then((session) => {
      if (!session) {
        console.log('🔒 No valid session after retry - Redirecting to login');
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Session Error
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Your session has expired or is invalid. Please log in again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  AuthClientService.clearSession();
                  window.location.href = '/';
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={this.handleRetry}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
            {this.state.error && (
              <details className="mt-4 text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">
                  Error details
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

