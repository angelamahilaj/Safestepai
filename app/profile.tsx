import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { User as UserIcon, Mail, Phone, Heart, LogOut, Edit, AlertCircle } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useAuth } from '@/contexts/AuthContext';
import AccessibleButton from '@/components/AccessibleButton';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const { user, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        speak(`Ekrani i profilit. Mirë se erdhe ${user.name}. Këtu mund të shikoni dhe redaktoni informacionin tuaj personal dhe mjekësor.`);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user, speak]);

  const handleSignOut = async () => {
    announceAndVibrate('Duke dalë', 'medium');
    const result = await signOut();
    if (result.success) {
      announceAndVibrate('Dolët me sukses', 'success');
      router.replace('/auth');
    } else {
      announceAndVibrate('Dështoi dalja', 'error');
    }
  };

  if (!user) {
    return null;
  }

  const medicalInfo = user.medicalInfo;

  return (
    <View style={styles.backgroundContainer}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <UserIcon size={64} color={Colors.white} strokeWidth={2} />
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.memberSince}>
              Anëtar që nga {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informacioni Personal</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Mail size={24} color={Colors.blue} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email-i</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>

              {user.phone && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Phone size={24} color={Colors.blue} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Telefoni</Text>
                    <Text style={styles.infoValue}>{user.phone}</Text>
                  </View>
                </View>
              )}
            </View>

            <AccessibleButton
              title="Ndrysho Informacionin Personal"
              icon={<Edit size={24} color={Colors.white} />}
              onPress={() => {
                announceAndVibrate('Duke hapur redaktimin e profilit', 'light');
                router.push('/edit-profile');
              }}
              variant="secondary"
              accessibilityLabel="Butoni ndrysho informacionin personal"
              accessibilityHint="Hap ekranin për të ndryshuar emrin, emailin dhe numrin e telefonit tuaj"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informacioni Mjekësor</Text>
            
            {medicalInfo ? (
              <View style={styles.infoCard}>
                {medicalInfo.bloodType && (
                  <View style={styles.medicalItem}>
                    <Text style={styles.medicalLabel}>Grupi i Gjakut</Text>
                    <Text style={styles.medicalValue}>{medicalInfo.bloodType}</Text>
                  </View>
                )}

                {medicalInfo.allergies && medicalInfo.allergies.length > 0 && (
                  <View style={styles.medicalItem}>
                    <Text style={styles.medicalLabel}>Alergjitë</Text>
                    <Text style={styles.medicalValue}>{medicalInfo.allergies.join(', ')}</Text>
                  </View>
                )}

                {medicalInfo.conditions && medicalInfo.conditions.length > 0 && (
                  <View style={styles.medicalItem}>
                    <Text style={styles.medicalLabel}>Gjendjet Mjekësore</Text>
                    <Text style={styles.medicalValue}>{medicalInfo.conditions.join(', ')}</Text>
                  </View>
                )}

                {medicalInfo.medications && medicalInfo.medications.length > 0 && (
                  <View style={styles.medicalItem}>
                    <Text style={styles.medicalLabel}>Ilaçet</Text>
                    {medicalInfo.medications.map((med, index) => (
                      <Text key={index} style={styles.medicationItem}>
                        • {med.name} - {med.dosage}, {med.frequency}
                      </Text>
                    ))}
                  </View>
                )}

                {medicalInfo.emergencyContact && (
                  <View style={styles.medicalItem}>
                    <Text style={styles.medicalLabel}>Kontakti i Emergjencës</Text>
                    <Text style={styles.medicalValue}>
                      {medicalInfo.emergencyContact.name} ({medicalInfo.emergencyContact.relationship})
                    </Text>
                    <Text style={styles.medicalValueSecondary}>
                      {medicalInfo.emergencyContact.phone}
                    </Text>
                  </View>
                )}

                {medicalInfo.doctorContact && (
                  <View style={styles.medicalItem}>
                    <Text style={styles.medicalLabel}>Doktori</Text>
                    <Text style={styles.medicalValue}>
                      {medicalInfo.doctorContact.name} - {medicalInfo.doctorContact.specialty}
                    </Text>
                    <Text style={styles.medicalValueSecondary}>
                      {medicalInfo.doctorContact.phone}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <AlertCircle size={48} color={Colors.lightGray} />
                <Text style={styles.emptyText}>Nuk ka informacion mjekësor të shtuar ende</Text>
              </View>
            )}

            <AccessibleButton
              title={medicalInfo ? "Ndrysho Informacionin Mjekësor" : "Shto Informacion Mjekësor"}
              icon={<Heart size={24} color={Colors.white} />}
              onPress={() => {
                announceAndVibrate('Duke hapur redaktuesin e informacionit mjekësor', 'light');
                router.push('/medical-info');
              }}
              accessibilityLabel={medicalInfo ? "Butoni ndrysho informacionin mjekësor" : "Butoni shto informacion mjekësor"}
              accessibilityHint="Hap ekranin për të menaxhuar informacionin tuaj mjekësor, duke përfshirë alergji, ilaçe dhe kontakte emergjente"
            />
          </View>

          <View style={styles.section}>
            <AccessibleButton
              title="Dil"
              icon={<LogOut size={24} color={Colors.white} />}
              onPress={handleSignOut}
              variant="emergency"
              accessibilityLabel="Butoni dil"
              accessibilityHint="Të nxjerr nga llogaria jote SafeStepAI"
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
    gap: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.white,
    textAlign: 'center',
  },
  memberSince: {
    fontSize: 16,
    color: Colors.lightGray,
    textAlign: 'center',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  infoCard: {
    backgroundColor: Colors.darkBlue,
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.lightGray,
    fontWeight: '600' as const,
  },
  infoValue: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '600' as const,
  },
  medicalItem: {
    gap: 8,
    paddingVertical: 8,
  },
  medicalLabel: {
    fontSize: 16,
    color: Colors.lightGray,
    fontWeight: '700' as const,
  },
  medicalValue: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '600' as const,
  },
  medicalValueSecondary: {
    fontSize: 16,
    color: Colors.lightGray,
  },
  medicationItem: {
    fontSize: 16,
    color: Colors.white,
    paddingLeft: 8,
    lineHeight: 24,
  },
  emptyCard: {
    backgroundColor: Colors.darkBlue,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.lightGray,
    textAlign: 'center',
  },
});
