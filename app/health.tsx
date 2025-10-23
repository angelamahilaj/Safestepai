import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Heart, Pill, Activity, Clock, Plus } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import Colors from '@/constants/colors';
import { useEffect, useState } from 'react';

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

export default function HealthScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Morning Medication',
      dosage: '1 pill',
      time: '08:00 AM',
      taken: false,
    },
    {
      id: '2',
      name: 'Afternoon Medication',
      dosage: '2 pills',
      time: '02:00 PM',
      taken: false,
    },
  ]);

  useEffect(() => {
    const pendingCount = medications.filter(m => !m.taken).length;
    speak(`Health screen. You have ${pendingCount} pending medication${pendingCount !== 1 ? 's' : ''}.`);
  }, [speak, medications]);

  const markAsTaken = (id: string) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id ? { ...med, taken: true } : med
      )
    );
    announceAndVibrate('Medication marked as taken', 'success');
  };

  const addMedication = () => {
    announceAndVibrate('Add medication feature coming soon', 'medium');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            style={styles.closeButton}
            onPress={() => {
              announceAndVibrate('Closing health screen', 'light');
              router.back();
            }}
            accessibilityLabel="Close health screen"
            accessibilityRole="button"
          >
            <X size={28} color={Colors.white} strokeWidth={3} />
          </Pressable>
          <Text style={styles.title}>Health Monitor</Text>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Activity size={32} color={Colors.blue} strokeWidth={2.5} />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Steps Today</Text>
            </View>

            <View style={styles.statCard}>
              <Heart size={32} color={Colors.red} strokeWidth={2.5} />
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Heart Rate</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Pill size={28} color={Colors.white} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Medication Reminders</Text>
          </View>

          <View style={styles.medicationContainer}>
            {medications.map((med) => (
              <View key={med.id} style={styles.medicationCard}>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{med.name}</Text>
                  <Text style={styles.medicationDosage}>{med.dosage}</Text>
                  <View style={styles.timeRow}>
                    <Clock size={16} color={Colors.lightGray} strokeWidth={2} />
                    <Text style={styles.medicationTime}>{med.time}</Text>
                  </View>
                </View>
                
                {!med.taken ? (
                  <Pressable
                    style={styles.takeButton}
                    onPress={() => markAsTaken(med.id)}
                    accessibilityLabel={`Mark ${med.name} as taken`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.takeButtonText}>Take</Text>
                  </Pressable>
                ) : (
                  <View style={styles.takenBadge}>
                    <Text style={styles.takenText}>✓ Taken</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <Pressable
            style={styles.addButton}
            onPress={addMedication}
            accessibilityLabel="Add new medication reminder"
            accessibilityRole="button"
          >
            <Plus size={28} color={Colors.white} strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add Medication</Text>
          </Pressable>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Tip: Set up your smart cane connection to track accurate step count throughout the day.
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
    borderBottomColor: Colors.green,
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
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.blue,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.white,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.lightGray,
    fontWeight: '600' as const,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  medicationContainer: {
    gap: 12,
  },
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: Colors.darkBlue,
    borderRadius: 16,
    gap: 16,
  },
  medicationInfo: {
    flex: 1,
    gap: 6,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  medicationDosage: {
    fontSize: 15,
    color: Colors.lightGray,
    fontWeight: '500' as const,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  medicationTime: {
    fontSize: 14,
    color: Colors.lightGray,
  },
  takeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.green,
    borderRadius: 12,
  },
  takeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  takenBadge: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  takenText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.green,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.blue,
    borderRadius: 16,
    gap: 12,
  },
  addButtonText: {
    fontSize: 18,
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
    fontSize: 15,
    color: Colors.lightGray,
    lineHeight: 22,
  },
});
