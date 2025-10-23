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
      speak('Edit profile screen. Update your personal information.');
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
      announceAndVibrate('Please enter your name', 'error');
      return;
    }

    if (!email.trim()) {
      announceAndVibrate('Please enter your email', 'error');
      return;
    }

    setIsSaving(true);
    announceAndVibrate('Saving profile', 'medium');

    const result = await updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });

    if (result.success) {
      announceAndVibrate('Profile updated successfully', 'success');
      setTimeout(() => {
        router.back();
      }, 1000);
    } else {
      announceAndVibrate('Failed to update profile', 'error');
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
              <Text style={styles.title}>Edit Profile</Text>
              <Text style={styles.subtitle}>
                Update your personal information
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Name</Text>
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
                  onFocus={() => speak('Name field. Enter your full name.')}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Email</Text>
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
                  onFocus={() => speak('Email field. Enter your email address.')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Phone (Optional)</Text>
              <View style={styles.inputGroup}>
                <View style={styles.inputIconContainer}>
                  <Phone size={24} color={Colors.blue} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor={Colors.lightGray}
                  value={phone}
                  onChangeText={setPhone}
                  accessibilityLabel="Phone number input"
                  onFocus={() => speak('Phone number field. This is optional.')}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <AccessibleButton
              title={isSaving ? 'Saving...' : 'Save Changes'}
              icon={<Save size={24} color={Colors.white} />}
              onPress={handleSave}
              disabled={isSaving}
              accessibilityLabel="Save changes button"
              accessibilityHint="Saves your updated profile information"
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
