import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { UserPlus, LogIn, Mic, Phone, Mail, User as UserIcon, Lock, Calendar } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useAuth } from '@/contexts/AuthContext';
import AccessibleButton from '@/components/AccessibleButton';
import Colors from '@/constants/colors';

export default function AuthScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate, initializeWebSpeech } = useAccessibility();
  const { signIn, signUp, isAuthenticated } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const initSpeech = () => {
      initializeWebSpeech();
    };
    
    if (typeof window !== 'undefined') {
      document.addEventListener('click', initSpeech, { once: true });
      document.addEventListener('touchstart', initSpeech, { once: true });
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('click', initSpeech);
        document.removeEventListener('touchstart', initSpeech);
      }
    };
  }, [initializeWebSpeech]);

  useEffect(() => {
    const timer = setTimeout(() => {
      speak(isSignUp 
        ? 'Mirë se erdhe në Safe Step A I. Krijo llogarinë tënde për të filluar. Mund të përdorësh komanda me zë për të plotësuar informacionin tënd.'
        : 'Mirë se u ktheve në Safe Step A I. Ju lutem identifikohu për të vazhduar.'
      );
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isSignUp, speak]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleAuth = async () => {
    if (isProcessing) return;

    if (!email.trim()) {
      announceAndVibrate('Ju lutem vendosni adresën tuaj të emailit', 'error');
      return;
    }

    if (!password.trim()) {
      announceAndVibrate('Ju lutem vendosni fjalëkalimin', 'error');
      return;
    }

    if (isSignUp && !name.trim()) {
      announceAndVibrate('Ju lutem vendosni emrin tuaj', 'error');
      return;
    }

    if (isSignUp && password.length < 6) {
      announceAndVibrate('Fjalëkalimi duhet të ketë të paktën 6 karaktere', 'error');
      return;
    }

    setIsProcessing(true);
    announceAndVibrate('Duke përpunuar kërkesën tuaj', 'medium');

    try {
      const result = isSignUp 
        ? await signUp(name, email, password, phone, birthday)
        : await signIn(email, password);

      if (result.success) {
        announceAndVibrate(
          isSignUp 
            ? `Mirë se erdhe ${name}! Llogaria juaj u krijua me sukses.`
            : `Mirë se u ktheve! U identifikove me sukses.`,
          'success'
        );
        setTimeout(() => {
          router.replace('/');
        }, 1000);
      } else {
        announceAndVibrate(result.error || 'Identifikimi dështoi', 'error');
      }
    } catch (error) {
      console.error('[Auth] Error:', error);
      announceAndVibrate('Ndodhi një gabim. Ju lutem provoni përsëri.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    announceAndVibrate(
      isSignUp ? 'U ndryshue në mënyrën e identifikimit' : 'U ndryshue në mënyrën e krijimit të llogarisë',
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
                {isSignUp ? 'Krijo Llogarinë Tënde' : 'Mirë se u ktheve'}
              </Text>
            </View>

            <View style={styles.voiceSection}>
              <View style={styles.voiceIndicator}>
                <Mic size={32} color={Colors.white} />
              </View>
              <Text style={styles.voiceText}>
                Komandat me zë janë në dispozicion. Thuaj &quot;ndihmë&quot; për asistencë.
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
                    placeholder="Emri Juaj"
                    placeholderTextColor={Colors.lightGray}
                    value={name}
                    onChangeText={setName}
                    accessibilityLabel="Fusha e emrit"
                    accessibilityHint="Vendosni emrin tuaj të plotë"
                    onFocus={() => speak('Fusha e emrit. Vendosni emrin tuaj të plotë.')}
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
                  placeholder="Adresa e Emailit"
                  placeholderTextColor={Colors.lightGray}
                  value={email}
                  onChangeText={setEmail}
                  accessibilityLabel="Fusha e emailit"
                  accessibilityHint="Vendosni adresën tuaj të emailit"
                  onFocus={() => speak('Fusha e emailit. Vendosni adresën tuaj të emailit.')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputIconContainer}>
                  <Lock size={24} color={Colors.blue} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={isSignUp ? "Fjalëkalimi (min 6 karaktere)" : "Fjalëkalimi"}
                  placeholderTextColor={Colors.lightGray}
                  value={password}
                  onChangeText={setPassword}
                  accessibilityLabel="Fusha e fjalëkalimit"
                  accessibilityHint="Vendosni fjalëkalimin tuaj"
                  onFocus={() => speak('Fusha e fjalëkalimit.')}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                />
              </View>

              {isSignUp && (
                <View style={styles.inputGroup}>
                  <View style={styles.inputIconContainer}>
                    <Phone size={24} color={Colors.blue} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Numri i Telefonit (Opsionale)"
                    placeholderTextColor={Colors.lightGray}
                    value={phone}
                    onChangeText={setPhone}
                    accessibilityLabel="Fusha e numrit të telefonit"
                    accessibilityHint="Vendosni numrin tuaj të telefonit, opsionale"
                    onFocus={() => speak('Fusha e numrit të telefonit. Kjo është opsionale.')}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                  />
                </View>
              )}

              {isSignUp && (
                <View style={styles.inputGroup}>
                  <View style={styles.inputIconContainer}>
                    <Calendar size={24} color={Colors.blue} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Ditëlindja (Opsionale) - DD/MM/YYYY"
                    placeholderTextColor={Colors.lightGray}
                    value={birthday}
                    onChangeText={setBirthday}
                    accessibilityLabel="Fusha e ditëlindjes"
                    accessibilityHint="Vendosni ditëlindjen tuaj, opsionale"
                    onFocus={() => speak('Fusha e ditëlindjes. Kjo është opsionale.')}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              )}

              <AccessibleButton
                title={isProcessing 
                  ? 'Duke Përpunuar...' 
                  : isSignUp ? 'Krijo Llogari' : 'Identifikohu'
                }
                icon={isSignUp ? <UserPlus size={32} color={Colors.white} /> : <LogIn size={32} color={Colors.white} />}
                onPress={handleAuth}
                disabled={isProcessing}
                accessibilityLabel={isSignUp ? 'Butoni krijo llogari' : 'Butoni identifikohu'}
                accessibilityHint={isSignUp 
                  ? 'Krijon llogarinë tënde SafeStepAI' 
                  : 'Të identifikon në llogarinë tënde'
                }
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OSE</Text>
                <View style={styles.dividerLine} />
              </View>

              <AccessibleButton
                title={isSignUp ? 'Ke tashmë llogari? Identifikohu' : 'Keni nevojë për llogari? Regjistrohu'}
                onPress={toggleMode}
                variant="secondary"
                accessibilityLabel={isSignUp ? 'Kalo tek identifikimi' : 'Kalo tek regjistrimi'}
                accessibilityHint={isSignUp 
                  ? 'Ke tashmë llogari? Prek për t\'u identifikuar' 
                  : 'Përdorues i ri? Prek për të krijuar llogari'
                }
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Informacioni juaj mjekësor do të ruhet në mënyrë të sigurt në pajisjen tuaj
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
