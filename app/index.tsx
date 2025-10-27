import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye, FileText, Banknote, MapPin, AlertCircle, Navigation2, Heart, Mic, User as UserIcon } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useAuth } from '@/contexts/AuthContext';
import AccessibleButton from '@/components/AccessibleButton';
import Colors from '@/constants/colors';
import { useEffect, useState, useRef } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate, initializeWebSpeech } = useAccessibility();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const isInitialized = useRef(false);
  const welcomeSpoken = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user && !welcomeSpoken.current) {
      const timer = setTimeout(() => {
        if (Platform.OS !== 'web') {
          speak(`Mirë se erdhe ${user.name}. Safe Step A I është gati për t'ju ndihmuar.`);
          welcomeSpoken.current = true;
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated, speak]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.backgroundContainer}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              style={styles.profileButton}
              onPress={() => {
                if (Platform.OS === 'web' && !isInitialized.current) {
                  initializeWebSpeech();
                  isInitialized.current = true;
                }
                announceAndVibrate('Profili juaj', 'light');
                router.push('/profile');
              }}
              accessibilityLabel="Butoni i profilit tuaj"
              accessibilityHint="Shikoni dhe redaktoni profilin dhe informacionin mjekësor"
            >
              <UserIcon size={32} color={Colors.white} strokeWidth={2} />
            </Pressable>
            <Text style={styles.logo}>SafeStepAI</Text>
            <Text style={styles.subtitle}>Asistenti Juaj i Shikimit</Text>
            {user && (
              <Text style={styles.welcomeText}>Përshëndetje, {user.name}!</Text>
            )}
          </View>

          <Pressable
            style={styles.voiceButton}
            onPress={() => {
              if (Platform.OS === 'web' && !isInitialized.current) {
                initializeWebSpeech();
                isInitialized.current = true;
              }
              setIsListening(!isListening);
              if (!isListening) {
                announceAndVibrate('Komandë me zë. Duke dëgjuar. Ju lutem flisni komandën tuaj.', 'medium');
                setTimeout(() => {
                  setIsListening(false);
                  speak('Thuaj: Navigim, Kamera, Shëndet, Emergjencë, Lexo tekst, Valutë, ose Vendndodhje.');
                }, 3000);
              } else {
                announceAndVibrate('Komandë me zë. Ndali dëgjimin', 'light');
              }
            }}
            accessibilityLabel="Butoni i komandës me zë"
            accessibilityHint="Prekni për të folur një komandë me zë"
          >
            <View style={[styles.voiceButtonInner, isListening && styles.voiceButtonListening]}>
              <Mic size={64} color={Colors.white} strokeWidth={2.5} />
            </View>
            <Text style={styles.voiceButtonText}>
              {isListening ? 'Duke dëgjuar...' : 'Prek dhe Fol'}
            </Text>
          </Pressable>

          <View style={styles.grid}>
            <AccessibleButton
              title="Çfarë Sheh?"
              icon={<Eye size={48} color={Colors.white} />}
              onPress={() => router.push('/vision')}
              accessibilityLabel="Çfarë sheh? Hap kamerën për të përshkruar rrethinën tuaj"
              accessibilityHint="Aktivizon vizionin AI për të përshkruar atë që shikon kamera"
            />

            <AccessibleButton
              title="Lexo Tekst"
              icon={<FileText size={48} color={Colors.white} />}
              onPress={() => router.push('/text-reader')}
              variant="secondary"
              accessibilityLabel="Lexo tekst. Hap kamerën për të lexuar tekst nga dokumentet dhe tabelat"
              accessibilityHint="Përdor OCR për të lexuar tekstin me zë të lartë"
            />

            <AccessibleButton
              title="Identifiko Valutë"
              icon={<Banknote size={48} color={Colors.white} />}
              onPress={() => router.push('/currency')}
              accessibilityLabel="Identifiko valutë. Hap kamerën për të njohur bankënotat"
              accessibilityHint="Identifikon vlerën e parasë"
            />

            <AccessibleButton
              title="Navigim"
              icon={<Navigation2 size={48} color={Colors.white} />}
              onPress={() => router.push('/navigation')}
              accessibilityLabel="Navigim. Hap navigimin dhe ndihmën për lëvizshmëri"
              accessibilityHint="Udhëzime hap pas hapi dhe zbulim pengesash"
            />

            <AccessibleButton
              title="Ku Jam?"
              icon={<MapPin size={48} color={Colors.white} />}
              onPress={() => router.push('/location')}
              variant="secondary"
              accessibilityLabel="Ku jam? Merr vendndodhjen tuaj aktuale"
              accessibilityHint="Jep adresën tuaj aktuale dhe pikat e referimit në afërsi"
            />

            <AccessibleButton
              title="Monitorim Shëndetësor"
              icon={<Heart size={48} color={Colors.white} />}
              onPress={() => router.push('/health')}
              variant="secondary"
              accessibilityLabel="Monitorim shëndetësor. Gjurmoni shëndetin dhe ilaçet tuaja"
              accessibilityHint="Kujtuese për ilaçe dhe gjurmim shëndetësor"
            />

            <AccessibleButton
              title="SOS EMERGJENCË"
              icon={<AlertCircle size={56} color={Colors.white} />}
              onPress={() => router.push('/emergency')}
              variant="emergency"
              accessibilityLabel="SOS Emergjencë. Akses i shpejtë në ndihmë emergjence"
              accessibilityHint="Hap opsionet e kontaktit të emergjencës"
            />
          </View>
        </ScrollView>
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
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
    position: 'relative' as const,
  },
  profileButton: {
    position: 'absolute' as const,
    top: 20,
    right: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  welcomeText: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  grid: {
    gap: 16,
  },
  voiceButton: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  voiceButtonInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  voiceButtonListening: {
    backgroundColor: Colors.red,
    transform: [{ scale: 1.1 }],
  },
  voiceButtonText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
