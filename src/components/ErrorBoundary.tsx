'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const resetError = () => {
        this.setState({ hasError: false, error: undefined });
      };

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={resetError} />;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <CardTitle className="text-red-800">Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An error occurred while loading the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error?.message.includes('Firebase') && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This appears to be a Firebase configuration issue. Please check:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Firebase project is properly configured</li>
                      <li>Firestore security rules are deployed</li>
                      <li>Internet connection is stable</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded font-mono">
                {this.state.error?.message || 'Unknown error occurred'}
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={resetError} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={() => window.location.reload()} className="flex-1">
                  Reload Page
                </Button>
              </div>
              
              <div className="text-center">
                <Button 
                  variant="link" 
                  onClick={() => window.location.href = '/setup'}
                  className="text-sm"
                >
                  Go to Setup Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;