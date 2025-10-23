import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Save, Plus, X, Heart } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useAuth, MedicalInfo } from '@/contexts/AuthContext';
import AccessibleButton from '@/components/AccessibleButton';
import Colors from '@/constants/colors';

export default function MedicalInfoScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const { user, updateMedicalInfo } = useAuth();

  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      speak('Medical information editor. Fill in your medical details. All fields are optional but recommended for emergencies.');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [speak]);

  useEffect(() => {
    if (user?.medicalInfo) {
      const info = user.medicalInfo;
      setBloodType(info.bloodType || '');
      setAllergies(info.allergies || []);
      setConditions(info.conditions || []);
      if (info.emergencyContact) {
        setEmergencyName(info.emergencyContact.name);
        setEmergencyPhone(info.emergencyContact.phone);
        setEmergencyRelation(info.emergencyContact.relationship);
      }
      if (info.doctorContact) {
        setDoctorName(info.doctorContact.name);
        setDoctorPhone(info.doctorContact.phone);
        setDoctorSpecialty(info.doctorContact.specialty);
      }
    }
  }, [user]);

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
      announceAndVibrate(`Added allergy: ${newAllergy}`, 'success');
    }
  };

  const removeAllergy = (index: number) => {
    const removed = allergies[index];
    setAllergies(allergies.filter((_, i) => i !== index));
    announceAndVibrate(`Removed allergy: ${removed}`, 'light');
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
      announceAndVibrate(`Added condition: ${newCondition}`, 'success');
    }
  };

  const removeCondition = (index: number) => {
    const removed = conditions[index];
    setConditions(conditions.filter((_, i) => i !== index));
    announceAndVibrate(`Removed condition: ${removed}`, 'light');
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    announceAndVibrate('Saving medical information', 'medium');

    const medicalInfo: MedicalInfo = {
      bloodType: bloodType.trim() || undefined,
      allergies: allergies.length > 0 ? allergies : undefined,
      conditions: conditions.length > 0 ? conditions : undefined,
      emergencyContact: emergencyName.trim() 
        ? {
            name: emergencyName.trim(),
            phone: emergencyPhone.trim(),
            relationship: emergencyRelation.trim(),
          }
        : undefined,
      doctorContact: doctorName.trim()
        ? {
            name: doctorName.trim(),
            phone: doctorPhone.trim(),
            specialty: doctorSpecialty.trim(),
          }
        : undefined,
    };

    const result = await updateMedicalInfo(medicalInfo);

    if (result.success) {
      announceAndVibrate('Medical information saved successfully', 'success');
      setTimeout(() => {
        router.back();
      }, 1000);
    } else {
      announceAndVibrate('Failed to save medical information', 'error');
    }

    setIsSaving(false);
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
              <Heart size={48} color={Colors.white} />
              <Text style={styles.title}>Medical Information</Text>
              <Text style={styles.subtitle}>
                This information is stored securely on your device and can be accessed in emergencies
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Blood Type</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., A+, O-, AB+"
                placeholderTextColor={Colors.lightGray}
                value={bloodType}
                onChangeText={setBloodType}
                accessibilityLabel="Blood type input"
                onFocus={() => speak('Blood type field. Enter your blood type, for example A plus or O negative.')}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Allergies</Text>
              <View style={styles.addItemContainer}>
                <TextInput
                  style={[styles.input, styles.addItemInput]}
                  placeholder="Add allergy"
                  placeholderTextColor={Colors.lightGray}
                  value={newAllergy}
                  onChangeText={setNewAllergy}
                  accessibilityLabel="New allergy input"
                  onFocus={() => speak('Add allergy field')}
                  onSubmitEditing={addAllergy}
                />
                <Pressable
                  style={styles.addButton}
                  onPress={addAllergy}
                  accessibilityLabel="Add allergy button"
                >
                  <Plus size={24} color={Colors.white} />
                </Pressable>
              </View>
              {allergies.map((allergy, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>{allergy}</Text>
                  <Pressable
                    onPress={() => removeAllergy(index)}
                    accessibilityLabel={`Remove ${allergy}`}
                    style={styles.removeButton}
                  >
                    <X size={20} color={Colors.white} />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical Conditions</Text>
              <View style={styles.addItemContainer}>
                <TextInput
                  style={[styles.input, styles.addItemInput]}
                  placeholder="Add condition"
                  placeholderTextColor={Colors.lightGray}
                  value={newCondition}
                  onChangeText={setNewCondition}
                  accessibilityLabel="New condition input"
                  onFocus={() => speak('Add medical condition field')}
                  onSubmitEditing={addCondition}
                />
                <Pressable
                  style={styles.addButton}
                  onPress={addCondition}
                  accessibilityLabel="Add condition button"
                >
                  <Plus size={24} color={Colors.white} />
                </Pressable>
              </View>
              {conditions.map((condition, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>{condition}</Text>
                  <Pressable
                    onPress={() => removeCondition(index)}
                    accessibilityLabel={`Remove ${condition}`}
                    style={styles.removeButton}
                  >
                    <X size={20} color={Colors.white} />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={Colors.lightGray}
                value={emergencyName}
                onChangeText={setEmergencyName}
                accessibilityLabel="Emergency contact name"
                onFocus={() => speak('Emergency contact name field')}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={Colors.lightGray}
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                accessibilityLabel="Emergency contact phone"
                onFocus={() => speak('Emergency contact phone number field')}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Relationship (e.g., Mother, Spouse)"
                placeholderTextColor={Colors.lightGray}
                value={emergencyRelation}
                onChangeText={setEmergencyRelation}
                accessibilityLabel="Emergency contact relationship"
                onFocus={() => speak('Emergency contact relationship field')}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Doctor Information</Text>
              <TextInput
                style={styles.input}
                placeholder="Doctor Name"
                placeholderTextColor={Colors.lightGray}
                value={doctorName}
                onChangeText={setDoctorName}
                accessibilityLabel="Doctor name"
                onFocus={() => speak('Doctor name field')}
              />
              <TextInput
                style={styles.input}
                placeholder="Doctor Phone"
                placeholderTextColor={Colors.lightGray}
                value={doctorPhone}
                onChangeText={setDoctorPhone}
                accessibilityLabel="Doctor phone"
                onFocus={() => speak('Doctor phone number field')}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Specialty"
                placeholderTextColor={Colors.lightGray}
                value={doctorSpecialty}
                onChangeText={setDoctorSpecialty}
                accessibilityLabel="Doctor specialty"
                onFocus={() => speak('Doctor specialty field')}
              />
            </View>

            <AccessibleButton
              title={isSaving ? 'Saving...' : 'Save Medical Information'}
              icon={<Save size={24} color={Colors.white} />}
              onPress={handleSave}
              disabled={isSaving}
              accessibilityLabel="Save medical information button"
              accessibilityHint="Saves all your medical information securely"
            />

            <Pressable
              onPress={() => router.back()}
              accessibilityLabel="Cancel and go back"
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
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
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  input: {
    backgroundColor: Colors.darkBlue,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.blue + '40',
    fontSize: 18,
    color: Colors.white,
    padding: 16,
    minHeight: 56,
  },
  addItemContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  addItemInput: {
    flex: 1,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.darkBlue,
    borderRadius: 12,
    padding: 16,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600' as const,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 18,
    color: Colors.lightGray,
    fontWeight: '600' as const,
  },
});
