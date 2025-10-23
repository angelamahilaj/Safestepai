import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { UserPlus, LogIn, Mic, Phone, Mail, User as UserIcon } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useAuth } from '@/contexts/AuthContext';
import AccessibleButton from '@/components/AccessibleButton';
import Colors from '@/constants/colors';

export default function AuthScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const { signIn, signUp, isAuthenticated } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      speak(isSignUp 
        ? 'Welcome to Safe Step A I. Create your account to get started. You can use voice commands to fill in your information.'
        : 'Welcome back to Safe Step A I. Please sign in to continue.'
      );
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isSignUp, speak]);

  const handleAuth = async () => {
    if (isProcessing) return;

    if (!email.trim()) {
      announceAndVibrate('Please enter your email address', 'error');
      return;
    }

    if (isSignUp && !name.trim()) {
      announceAndVibrate('Please enter your name', 'error');
      return;
    }

    setIsProcessing(true);
    announceAndVibrate('Processing your request', 'medium');

    try {
      const result = isSignUp 
        ? await signUp(name, email, phone)
        : await signIn(email);

      if (result.success) {
        announceAndVibrate(
          isSignUp 
            ? `Welcome ${name}! Your account has been created successfully.`
            : `Welcome back! Signed in successfully.`,
          'success'
        );
        setTimeout(() => {
          router.replace('/');
        }, 1000);
      } else {
        announceAndVibrate(result.error || 'Authentication failed', 'error');
      }
    } catch (error) {
      console.error('[Auth] Error:', error);
      announceAndVibrate('An error occurred. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    announceAndVibrate(
      isSignUp ? 'Switched to sign in mode' : 'Switched to sign up mode',
      'light'
    );
  };

  return (
    <View style={styles.backgroundContainer}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.logo}>SafeStepAI</Text>
              <Text style={styles.subtitle}>
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </Text>
            </View>

            <View style={styles.voiceSection}>
              <View style={styles.voiceIndicator}>
                <Mic size={32} color={Colors.white} />
              </View>
              <Text style={styles.voiceText}>
                Voice commands available. Say &quot;help&quot; for assistance.
              </Text>
            </View>

            <View style={styles.form}>
              {isSignUp && (
                <View style={styles.inputGroup}>
                  <View style={styles.inputIconContainer}>
                    <UserIcon size={24} color={Colors.blue} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    placeholderTextColor={Colors.lightGray}
                    value={name}
                    onChangeText={setName}
                    accessibilityLabel="Name input"
                    accessibilityHint="Enter your full name"
                    onFocus={() => speak('Name field. Enter your full name.')}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <View style={styles.inputIconContainer}>
                  <Mail size={24} color={Colors.blue} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor={Colors.lightGray}
                  value={email}
                  onChangeText={setEmail}
                  accessibilityLabel="Email input"
                  accessibilityHint="Enter your email address"
                  onFocus={() => speak('Email field. Enter your email address.')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {isSignUp && (
                <View style={styles.inputGroup}>
                  <View style={styles.inputIconContainer}>
                    <Phone size={24} color={Colors.blue} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number (Optional)"
                    placeholderTextColor={Colors.lightGray}
                    value={phone}
                    onChangeText={setPhone}
                    accessibilityLabel="Phone number input"
                    accessibilityHint="Enter your phone number, optional"
                    onFocus={() => speak('Phone number field. This is optional.')}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                  />
                </View>
              )}

              <AccessibleButton
                title={isProcessing 
                  ? 'Processing...' 
                  : isSignUp ? 'Create Account' : 'Sign In'
                }
                icon={isSignUp ? <UserPlus size={32} color={Colors.white} /> : <LogIn size={32} color={Colors.white} />}
                onPress={handleAuth}
                disabled={isProcessing}
                accessibilityLabel={isSignUp ? 'Create account button' : 'Sign in button'}
                accessibilityHint={isSignUp 
                  ? 'Creates your SafeStepAI account' 
                  : 'Signs you into your account'
                }
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <AccessibleButton
                title={isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                onPress={toggleMode}
                variant="secondary"
                accessibilityLabel={isSignUp ? 'Switch to sign in' : 'Switch to sign up'}
                accessibilityHint={isSignUp 
                  ? 'Already have an account? Tap to sign in instead' 
                  : 'New user? Tap to create an account'
                }
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Your medical information will be securely stored on your device
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: Colors.darkNavy,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  logo: {
    fontSize: 42,
    fontWeight: '900' as const,
    color: Colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: Colors.lightGray,
    textAlign: 'center',
  },
  voiceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue + '20',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  voiceIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceText: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600' as const,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkBlue,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.blue + '40',
    overflow: 'hidden',
  },
  inputIconContainer: {
    padding: 16,
    backgroundColor: Colors.darkBlue,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: Colors.white,
    padding: 16,
    paddingLeft: 8,
    minHeight: 56,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.lightGray + '40',
  },
  dividerText: {
    fontSize: 16,
    color: Colors.lightGray,
    fontWeight: '600' as const,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});
