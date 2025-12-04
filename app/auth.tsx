import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";

import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAuth } from "@/contexts/AuthContext";
import AccessibleButton from "@/components/AccessibleButton";
import Colors from "@/constants/colors";

export default function AuthScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate, initializeWebSpeech } = useAccessibility();
  const { signIn, signUp, isAuthenticated } = useAuth();

  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ------------------------------
  // Initialize Web Speech (WEB ONLY)
  // ------------------------------
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const init = () => initializeWebSpeech();

    document.addEventListener("click", init, { once: true });
    document.addEventListener("touchstart", init, { once: true });

    return () => {
      document.removeEventListener("click", init);
      document.removeEventListener("touchstart", init);
    };
  }, [initializeWebSpeech]);

  // ------------------------------
  // Voice Welcome
  // ------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(
        isSignUp
          ? "Krijo llogarinë tënde në SafeStep AI. Mund të përdorësh edhe komandat me zë."
          : "Identifikohu për të vazhduar."
      );
    }, 600);

    return () => clearTimeout(timer);
  }, [isSignUp, speak]);

  // Auto redirect if logged in
  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  // ------------------------------
  // Handle Login/Register
  // ------------------------------
  const handleAuth = async () => {
    if (isProcessing) return;

    if (!email.trim()) {
      return announceAndVibrate("Ju lutem vendosni emailin", "error");
    }
    if (!password.trim()) {
      return announceAndVibrate("Ju lutem vendosni fjalëkalimin", "error");
    }
    if (isSignUp && !name.trim()) {
      return announceAndVibrate("Ju lutem vendosni emrin", "error");
    }
    if (isSignUp && password.length < 6) {
      return announceAndVibrate(
        "Fjalëkalimi duhet të ketë të paktën 6 karaktere",
        "error"
      );
    }

    setIsProcessing(true);
    announceAndVibrate("Duke përpunuar...", "medium");

    const result = isSignUp
      ? await signUp(name, email, password, phone, birthday)
      : await signIn(email, password);

    if (result.success) {
      announceAndVibrate(
        isSignUp ? `Mirë se erdhe ${name}!` : "U identifikove me sukses.",
        "success"
      );
      setTimeout(() => router.replace("/"), 700);
    } else {
      announceAndVibrate(result.error || "Gabim në identifikim", "error");
    }

    setIsProcessing(false);
  };

  return (
    <View style={styles.backgroundContainer}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.logo}>SafeStepAI</Text>
              <Text style={styles.subtitle}>
                {isSignUp ? "Krijo llogarinë" : "Identifikohu"}
              </Text>
            </View>

            {/* VOICE STATUS */}
            <View style={styles.voiceSection}>
              <View style={styles.voiceIndicator}>
                <Ionicons name="mic" size={28} color="white" />
              </View>
              <Text style={styles.voiceText}>
                Komandat me zë janë aktive. Thuaj &ldquo;ndihmë&rdquo; për asistencë.
              </Text>
            </View>

            {/* -------------------------
                 FORM INPUTS
            --------------------------- */}
            <View style={styles.form}>
              {isSignUp && (
                <View style={styles.inputGroup}>
                  <FontAwesome
                    name="user"
                    size={22}
                    color={Colors.blue}
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Emri juaj"
                    placeholderTextColor={Colors.lightGray}
                    value={name}
                    onChangeText={setName}
                    onFocus={() => speak("Fusha e emrit")}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <MaterialIcons
                  name="email"
                  size={22}
                  color={Colors.blue}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={Colors.lightGray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <FontAwesome
                  name="lock"
                  size={22}
                  color={Colors.blue}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Fjalëkalimi"
                  placeholderTextColor={Colors.lightGray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* REGISTER FIELDS */}
              {isSignUp && (
                <>
                  <View style={styles.inputGroup}>
                    <Ionicons
                      name="call"
                      size={22}
                      color={Colors.blue}
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Numri i telefonit (opsionale)"
                      placeholderTextColor={Colors.lightGray}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Ionicons
                      name="calendar"
                      size={22}
                      color={Colors.blue}
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Ditëlindja - DD/MM/YYYY"
                      placeholderTextColor={Colors.lightGray}
                      value={birthday}
                      onChangeText={setBirthday}
                    />
                  </View>
                </>
              )}

              {/* BUTTON LOGIN / REGISTER */}
              <AccessibleButton
                title={
                  isProcessing
                    ? "Duke përpunuar..."
                    : isSignUp
                    ? "Krijo Llogari"
                    : "Identifikohu"
                }
                onPress={handleAuth}
                icon={
                  isSignUp ? (
                    <FontAwesome name="user-plus" size={28} color="white" />
                  ) : (
                    <FontAwesome name="sign-in" size={28} color="white" />
                  )
                }
              />

              {/* SWITCH MODE */}
              <AccessibleButton
                title={
                  isSignUp
                    ? "Ke llogari? Hyr"
                    : "Je i ri? Krijo llogari"
                }
                onPress={() => setIsSignUp(!isSignUp)}
                variant="secondary"
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Të dhënat ruhen vetëm në pajisjen tuaj dhe nuk ndahen me askënd.
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
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: "900",
    color: Colors.white,
  },
  subtitle: {
    fontSize: 22,
    color: Colors.lightGray,
  },
  voiceSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue + "30",
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  voiceIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.blue,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceText: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkBlue,
    borderColor: Colors.blue + "40",
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
    marginLeft: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.white,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors.lightGray,
    textAlign: "center",
  },
});
