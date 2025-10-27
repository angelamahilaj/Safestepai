import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Save, User as UserIcon, Mail, Phone } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useAuth } from '@/contexts/AuthContext';
import AccessibleButton from '@/components/AccessibleButton';
import Colors from '@/constants/colors';

export default function EditProfileScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      speak('Ekrani i redaktimit të profilit. Përditësoni informacionin tuaj personal.');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [speak]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (isSaving) return;

    if (!name.trim()) {
      announceAndVibrate('Ju lutem vendosni emrin tuaj', 'error');
      return;
    }

    if (!email.trim()) {
      announceAndVibrate('Ju lutem vendosni emailin tuaj', 'error');
      return;
    }

    setIsSaving(true);
    announceAndVibrate('Duke ruajtur profilin', 'medium');

    const result = await updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });

    if (result.success) {
      announceAndVibrate('Profili u përditësua me sukses', 'success');
      setTimeout(() => {
        router.back();
      }, 1000);
    } else {
      announceAndVibrate('Dështoi përditësimi i profilit', 'error');
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
              <UserIcon size={48} color={Colors.white} />
              <Text style={styles.title}>Ndrysho Profilin</Text>
              <Text style={styles.subtitle}>
                Përditëso informacionin tuaj personal
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Emri</Text>
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
                  onFocus={() => speak('Fusha e emrit. Vendosni emrin tuaj të plotë.')}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Email-i</Text>
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
                  onFocus={() => speak('Fusha e emailit. Vendosni adresën tuaj të emailit.')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Telefoni (Opsional)</Text>
              <View style={styles.inputGroup}>
                <View style={styles.inputIconContainer}>
                  <Phone size={24} color={Colors.blue} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Numri i Telefonit"
                  placeholderTextColor={Colors.lightGray}
                  value={phone}
                  onChangeText={setPhone}
                  accessibilityLabel="Fusha e numrit të telefonit"
                  onFocus={() => speak('Fusha e numrit të telefonit. Kjo është opsionale.')}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <AccessibleButton
              title={isSaving ? 'Duke Ruajtur...' : 'Ruaj Ndryshimet'}
              icon={<Save size={24} color={Colors.white} />}
              onPress={handleSave}
              disabled={isSaving}
              accessibilityLabel="Butoni ruaj ndryshimet"
              accessibilityHint="Ruan informacionin tuaj të përditësuar të profilit"
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
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
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
