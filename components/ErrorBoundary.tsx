import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { AlertCircle } from 'lucide-react-native';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends Component<Props, State> {
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.content}>
              <AlertCircle size={80} color={Colors.red} strokeWidth={2} />
              <Text style={styles.title}>Something Went Wrong</Text>
              <Text style={styles.message}>
                The app encountered an error. Please try restarting.
              </Text>
              {this.state.error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    {this.state.error.message}
                  </Text>
                </View>
              )}
              <Pressable style={styles.button} onPress={this.handleReset}>
                <Text style={styles.buttonText}>Try Again</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkNavy,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.white,
    textAlign: 'center',
  },
  message: {
    fontSize: 20,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 28,
  },
  errorBox: {
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.red,
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: Colors.red,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 48,
    backgroundColor: Colors.blue,
    borderRadius: 16,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
