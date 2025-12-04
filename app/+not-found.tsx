import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useEffect } from "react";

export default function NotFoundScreen() {
  const { speak, announceAndVibrate } = useAccessibility();

  useEffect(() => {
    speak("Faqja që kërkoni nuk ekziston. Prekni butonin për t'u kthyer në faqen kryesore.");
    announceAndVibrate("Faqja nuk u gjet", "error");
  }, [speak, announceAndVibrate]);

  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Kjo faqe nuk ekziston.</Text>

        <Link href="/" asChild>
          <Pressable
            style={styles.link}
            accessibilityLabel="Kthehu në faqen kryesore"
            accessibilityHint="Prek për t'u kthyer te faqja kryesore e aplikacionit"
            onPress={() => {
              speak("Duke u kthyer në faqen kryesore.");
              announceAndVibrate("Kthim", "light");
            }}
          >
            <Text style={styles.linkText}>Kthehu tek faqja kryesore</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.darkNavy,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.white,
    textAlign: "center",
  },
  link: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: Colors.blue,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.white,
  },
});
