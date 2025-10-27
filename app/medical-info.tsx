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
      speak('Redaktuesi i informacionit mjekësor. Plotësoni detajet tuaja mjekësore. Të gjitha fushat janë opsionale por të rekomanduara për emergjenca.');
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
      announceAndVibrate(`U shtua alergjia: ${newAllergy}`, 'success');
    }
  };

  const removeAllergy = (index: number) => {
    const removed = allergies[index];
    setAllergies(allergies.filter((_, i) => i !== index));
    announceAndVibrate(`U hoq alergjia: ${removed}`, 'light');
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
      announceAndVibrate(`U shtua gjendja: ${newCondition}`, 'success');
    }
  };

  const removeCondition = (index: number) => {
    const removed = conditions[index];
    setConditions(conditions.filter((_, i) => i !== index));
    announceAndVibrate(`U hoq gjendja: ${removed}`, 'light');
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    announceAndVibrate('Duke ruajtur informacionin mjekësor', 'medium');

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
      announceAndVibrate('Informacioni mjekësor u ruajt me sukses', 'success');
      setTimeout(() => {
        router.back();
      }, 1000);
    } else {
      announceAndVibrate('Dështoi ruajtja e informacionit mjekësor', 'error');
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
              <Text style={styles.title}>Informacioni Mjekësor</Text>
              <Text style={styles.subtitle}>
                Ky informacion ruhet në mënyrë të sigurt në pajisjen tuaj dhe mund të aksesohet në emergjenca
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Grupi i Gjakut</Text>
              <TextInput
                style={styles.input}
                placeholder="p.sh., A+, O-, AB+"
                placeholderTextColor={Colors.lightGray}
                value={bloodType}
                onChangeText={setBloodType}
                accessibilityLabel="Fusha e grupit të gjakut"
                onFocus={() => speak('Fusha e grupit të gjakut. Vendosni grupin tuaj të gjakut, për shembull A plus ose O negativ.')}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alergjitë</Text>
              <View style={styles.addItemContainer}>
                <TextInput
                  style={[styles.input, styles.addItemInput]}
                  placeholder="Shto alergji"
                  placeholderTextColor={Colors.lightGray}
                  value={newAllergy}
                  onChangeText={setNewAllergy}
                  accessibilityLabel="Fusha e alergjisë së re"
                  onFocus={() => speak('Fusha shto alergji')}
                  onSubmitEditing={addAllergy}
                />
                <Pressable
                  style={styles.addButton}
                  onPress={addAllergy}
                  accessibilityLabel="Butoni shto alergji"
                >
                  <Plus size={24} color={Colors.white} />
                </Pressable>
              </View>
              {allergies.map((allergy, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>{allergy}</Text>
                  <Pressable
                    onPress={() => removeAllergy(index)}
                    accessibilityLabel={`Hiq ${allergy}`}
                    style={styles.removeButton}
                  >
                    <X size={20} color={Colors.white} />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gjendjet Mjekësore</Text>
              <View style={styles.addItemContainer}>
                <TextInput
                  style={[styles.input, styles.addItemInput]}
                  placeholder="Shto gjendje"
                  placeholderTextColor={Colors.lightGray}
                  value={newCondition}
                  onChangeText={setNewCondition}
                  accessibilityLabel="Fusha e gjendjes së re"
                  onFocus={() => speak('Fusha shto gjendje mjekësore')}
                  onSubmitEditing={addCondition}
                />
                <Pressable
                  style={styles.addButton}
                  onPress={addCondition}
                  accessibilityLabel="Butoni shto gjendje"
                >
                  <Plus size={24} color={Colors.white} />
                </Pressable>
              </View>
              {conditions.map((condition, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>{condition}</Text>
                  <Pressable
                    onPress={() => removeCondition(index)}
                    accessibilityLabel={`Hiq ${condition}`}
                    style={styles.removeButton}
                  >
                    <X size={20} color={Colors.white} />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kontakti i Emergjencës</Text>
              <TextInput
                style={styles.input}
                placeholder="Emri"
                placeholderTextColor={Colors.lightGray}
                value={emergencyName}
                onChangeText={setEmergencyName}
                accessibilityLabel="Emri i kontaktit të emergjencës"
                onFocus={() => speak('Fusha e emrit të kontaktit të emergjencës')}
              />
              <TextInput
                style={styles.input}
                placeholder="Numri i Telefonit"
                placeholderTextColor={Colors.lightGray}
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                accessibilityLabel="Telefoni i kontaktit të emergjencës"
                onFocus={() => speak('Fusha e numrit të telefonit të kontaktit të emergjencës')}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Lidhja (p.sh., Nënë, Bashkëshort/e)"
                placeholderTextColor={Colors.lightGray}
                value={emergencyRelation}
                onChangeText={setEmergencyRelation}
                accessibilityLabel="Lidhja e kontaktit të emergjencës"
                onFocus={() => speak('Fusha e lidhjes së kontaktit të emergjencës')}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informacioni i Doktorit</Text>
              <TextInput
                style={styles.input}
                placeholder="Emri i Doktorit"
                placeholderTextColor={Colors.lightGray}
                value={doctorName}
                onChangeText={setDoctorName}
                accessibilityLabel="Emri i doktorit"
                onFocus={() => speak('Fusha e emrit të doktorit')}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefoni i Doktorit"
                placeholderTextColor={Colors.lightGray}
                value={doctorPhone}
                onChangeText={setDoctorPhone}
                accessibilityLabel="Telefoni i doktorit"
                onFocus={() => speak('Fusha e numrit të telefonit të doktorit')}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Specialiteti"
                placeholderTextColor={Colors.lightGray}
                value={doctorSpecialty}
                onChangeText={setDoctorSpecialty}
                accessibilityLabel="Specialiteti i doktorit"
                onFocus={() => speak('Fusha e specialitetit të doktorit')}
              />
            </View>

            <AccessibleButton
              title={isSaving ? 'Duke Ruajtur...' : 'Ruaj Informacionin Mjekësor'}
              icon={<Save size={24} color={Colors.white} />}
              onPress={handleSave}
              disabled={isSaving}
              accessibilityLabel="Butoni ruaj informacionin mjekësor"
              accessibilityHint="Ruan të gjithë informacionin tuaj mjekësor në mënyrë të sigurt"
            />

            <Pressable
              onPress={() => router.back()}
              accessibilityLabel="Anulo dhe kthehu mbrapa"
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Anulo</Text>
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
