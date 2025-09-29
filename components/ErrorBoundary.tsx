import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorInfo>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

interface ErrorInfo {
  error?: Error;
  retry: () => void;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('💥 ErrorBoundary caught error:', error);
    console.error('📍 Error Info:', errorInfo);
    
    // Enhanced error logging for debugging
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Check for specific error types that might be recoverable
    const isReanimatedError = error.message?.includes('reanimated') || 
                              error.stack?.includes('Reanimated') ||
                              error.message?.includes('worklet');
    
    const isNavigationError = error.message?.includes('navigation') ||
                              error.stack?.includes('react-navigation');

    if (isReanimatedError) {
      console.warn('🎭 Detected Reanimated-related error, attempting graceful recovery...');
    }

    if (isNavigationError) {
      console.warn('🧭 Detected Navigation-related error, attempting graceful recovery...');
    }
    
    // You could also log to crash reporting service here
    // crashlytics().recordError(error);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app encountered an unexpected error. Please try restarting the app.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorDetails}>
              {this.state.error.toString()}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.background,
  },
  title: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: 'bold' as const,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.redTara,
    marginTop: DesignSystem.spacing.lg,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});