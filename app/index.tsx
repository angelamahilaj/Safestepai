import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye, FileText, Banknote, MapPin, AlertCircle, Navigation2, Heart, Mic, User as UserIcon } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useAuth } from '@/contexts/AuthContext';
import AccessibleButton from '@/components/AccessibleButton';
import Colors from '@/constants/colors';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const timer = setTimeout(() => {
        speak(`Welcome back ${user.name}. Safe Step A I is ready to assist you.`);
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
                announceAndVibrate('Your profile', 'light');
                router.push('/profile');
              }}
              accessibilityLabel="Your profile button"
              accessibilityHint="View and edit your profile and medical information"
            >
              <UserIcon size={32} color={Colors.white} strokeWidth={2} />
            </Pressable>
            <Text style={styles.logo}>SafeStepAI</Text>
            <Text style={styles.subtitle}>Your Vision Assistant</Text>
            {user && (
              <Text style={styles.welcomeText}>Hello, {user.name}!</Text>
            )}
          </View>

          <Pressable
            style={styles.voiceButton}
            onPress={() => {
              setIsListening(!isListening);
              if (!isListening) {
                announceAndVibrate('Voice command. Listening. Please speak your command.', 'medium');
                setTimeout(() => {
                  setIsListening(false);
                  speak('Say: Navigation, Camera, Health, Emergency, Read text, Currency, or Location.');
                }, 3000);
              } else {
                announceAndVibrate('Voice command. Stopped listening', 'light');
              }
            }}
            accessibilityLabel="Voice command button"
            accessibilityHint="Tap to speak a voice command"
          >
            <View style={[styles.voiceButtonInner, isListening && styles.voiceButtonListening]}>
              <Mic size={64} color={Colors.white} strokeWidth={2.5} />
            </View>
            <Text style={styles.voiceButtonText}>
              {isListening ? 'Listening...' : 'Tap and Speak'}
            </Text>
          </Pressable>

          <View style={styles.grid}>
            <AccessibleButton
              title="What Do You See?"
              icon={<Eye size={48} color={Colors.white} />}
              onPress={() => router.push('/vision')}
              accessibilityLabel="What do you see? Opens camera to describe your surroundings"
              accessibilityHint="Activates AI vision to describe what the camera sees"
            />

            <AccessibleButton
              title="Read Text"
              icon={<FileText size={48} color={Colors.white} />}
              onPress={() => router.push('/text-reader')}
              variant="secondary"
              accessibilityLabel="Read text. Opens camera to read text from documents and signs"
              accessibilityHint="Uses OCR to read text aloud"
            />

            <AccessibleButton
              title="Identify Currency"
              icon={<Banknote size={48} color={Colors.white} />}
              onPress={() => router.push('/currency')}
              accessibilityLabel="Identify currency. Opens camera to recognize banknotes"
              accessibilityHint="Identifies money denomination"
            />

            <AccessibleButton
              title="Navigation"
              icon={<Navigation2 size={48} color={Colors.white} />}
              onPress={() => router.push('/navigation')}
              accessibilityLabel="Navigation. Opens navigation and mobility assistance"
              accessibilityHint="Step-by-step directions and obstacle detection"
            />

            <AccessibleButton
              title="Where Am I?"
              icon={<MapPin size={48} color={Colors.white} />}
              onPress={() => router.push('/location')}
              variant="secondary"
              accessibilityLabel="Where am I? Gets your current location"
              accessibilityHint="Provides your current address and nearby landmarks"
            />

            <AccessibleButton
              title="Health Monitor"
              icon={<Heart size={48} color={Colors.white} />}
              onPress={() => router.push('/health')}
              variant="secondary"
              accessibilityLabel="Health monitor. Track your health and medications"
              accessibilityHint="Medication reminders and health tracking"
            />

            <AccessibleButton
              title="EMERGENCY SOS"
              icon={<AlertCircle size={56} color={Colors.white} />}
              onPress={() => router.push('/emergency')}
              variant="emergency"
              accessibilityLabel="Emergency SOS. Quick access to emergency help"
              accessibilityHint="Opens emergency contact options"
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
