import { View, Text, StyleSheet, Pressable, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Phone, Shield, Users, Heart } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import { useEffect } from 'react';

export default function EmergencyScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const { user } = useAuth();

  useEffect(() => {
    speak('SOS Emergjence. Zgjidhni një opsion për të marrë ndihmë menjëherë.');
  }, [speak]);

  const call911 = () => {
    announceAndVibrate('Duke thirrur 911 shërbimet e emergjencës', 'warning');
    Linking.openURL('tel:911');
  };

  const callLocalEmergency = () => {
    announceAndVibrate('Duke thirrur 112 shërbimet e emergjencës', 'warning');
    Linking.openURL('tel:112');
  };

  const callEmergencyContact = () => {
    if (user?.medicalInfo?.emergencyContact?.phone) {
      announceAndVibrate(`Duke thirrur ${user.medicalInfo.emergencyContact.name}`, 'warning');
      Linking.openURL(`tel:${user.medicalInfo.emergencyContact.phone}`);
    } else {
      announceAndVibrate('Nuk ka kontakt emergjence të ruajtur. Ju lutem shtoni një në profilin tuaj.', 'error');
    }
  };

  const callDoctor = () => {
    if (user?.medicalInfo?.doctorContact?.phone) {
      announceAndVibrate(`Duke thirrur doktorin ${user.medicalInfo.doctorContact.name}`, 'warning');
      Linking.openURL(`tel:${user.medicalInfo.doctorContact.phone}`);
    } else {
      announceAndVibrate('Nuk ka kontakt doktori të ruajtur. Ju lutem shtoni një në profilin tuaj.', 'error');
    }
  };

  const sendEmergencyMessage = () => {
    announceAndVibrate('Duke hapur mesazhin e emergjencës', 'warning');
    const message = 'EMERGJENCË! Kam nevojë për ndihmë. Ky është një mesazh i automatizuar nga SafeStepAI.';
    Linking.openURL(`sms:?body=${encodeURIComponent(message)}`);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            style={styles.closeButton}
            onPress={() => {
              announceAndVibrate('Duke mbyllur ekranin e emergjencës', 'light');
              router.back();
            }}
            accessibilityLabel="Mbyll ekranin e emergjencës"
            accessibilityRole="button"
          >
            <X size={28} color={Colors.white} strokeWidth={3} />
          </Pressable>
          <Text style={styles.title}>SOS EMERGJENCË</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.warningBox}>
            <Shield size={48} color={Colors.red} strokeWidth={2.5} />
            <Text style={styles.warningText}>
              Përdorni këto opsione vetëm në rast të emergjencës reale
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.emergencyButton}
              onPress={call911}
              accessibilityLabel="Thirr 911 shërbimet e emergjencës"
              accessibilityRole="button"
              accessibilityHint="Thirr 911 për ndihmë emergjente menjëherë"
            >
              <Phone size={56} color={Colors.white} strokeWidth={2.5} />
              <Text style={styles.emergencyButtonText}>Thirr 911</Text>
              <Text style={styles.emergencyButtonSubtext}>Shërbime Emergjence</Text>
            </Pressable>

            <Pressable
              style={styles.emergencyButton}
              onPress={callLocalEmergency}
              accessibilityLabel="Thirr 112 shërbimet e emergjencës"
              accessibilityRole="button"
              accessibilityHint="Thirr 112 për ndihmë emergjente menjëherë"
            >
              <Phone size={56} color={Colors.white} strokeWidth={2.5} />
              <Text style={styles.emergencyButtonText}>Thirr 112</Text>
              <Text style={styles.emergencyButtonSubtext}>Emergjencë Ndërkombëtare</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={sendEmergencyMessage}
              accessibilityLabel="Dërgo mesazh emergjence"
              accessibilityRole="button"
              accessibilityHint="Hap SMS për të dërguar mesazh emergjence te kontaktet"
            >
              <Users size={40} color={Colors.white} strokeWidth={2.5} />
              <Text style={styles.secondaryButtonText}>Dërgo SMS Emergjence</Text>
            </Pressable>
          </View>

          {(user?.medicalInfo?.emergencyContact || user?.medicalInfo?.doctorContact) && (
            <View style={styles.personalContactsSection}>
              <Text style={styles.sectionTitle}>Kontakte Personale</Text>
              
              {user?.medicalInfo?.emergencyContact && (
                <Pressable
                  style={styles.contactButton}
                  onPress={callEmergencyContact}
                  accessibilityLabel={`Thirr kontaktin e emergjencës ${user.medicalInfo.emergencyContact.name}`}
                  accessibilityRole="button"
                >
                  <Users size={40} color={Colors.white} strokeWidth={2.5} />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{user.medicalInfo.emergencyContact.name}</Text>
                    <Text style={styles.contactLabel}>{user.medicalInfo.emergencyContact.relationship}</Text>
                  </View>
                  <Phone size={32} color={Colors.white} />
                </Pressable>
              )}

              {user?.medicalInfo?.doctorContact && (
                <Pressable
                  style={styles.contactButton}
                  onPress={callDoctor}
                  accessibilityLabel={`Thirr doktorin ${user.medicalInfo.doctorContact.name}`}
                  accessibilityRole="button"
                >
                  <Heart size={40} color={Colors.white} strokeWidth={2.5} />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{user.medicalInfo.doctorContact.name}</Text>
                    <Text style={styles.contactLabel}>{user.medicalInfo.doctorContact.specialty}</Text>
                  </View>
                  <Phone size={32} color={Colors.white} />
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Vendndodhja juaj do të ndahet kur të bëni një telefonatë emergjence
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkNavy,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.red,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.red,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.red,
    gap: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 18,
    color: Colors.white,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  buttonContainer: {
    gap: 16,
  },
  emergencyButton: {
    padding: 32,
    backgroundColor: Colors.red,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonText: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.white,
  },
  emergencyButtonSubtext: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    opacity: 0.9,
  },
  secondaryButton: {
    padding: 24,
    backgroundColor: Colors.darkBlue,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 100,
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  infoBox: {
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.blue,
  },
  infoText: {
    fontSize: 16,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  personalContactsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.blue,
    borderRadius: 16,
    gap: 16,
    minHeight: 80,
  },
  contactInfo: {
    flex: 1,
    gap: 4,
  },
  contactName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    opacity: 0.8,
  },
});
