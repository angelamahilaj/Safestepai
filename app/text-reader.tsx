import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { X, Camera, Loader2 } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { trpc } from '@/lib/trpc';
import Colors from '@/constants/colors';

export default function TextReaderScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const [permission, requestPermission] = useCameraPermissions();
  const readMutation = trpc.text.read.useMutation();
  const [lastText, setLastText] = useState('');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    speak('Lexuesi i tekstit u aktivizua. Drejtoni kamerën drejt tekstit dhe prekni butonin lexo.');
    
    return () => {
      console.log('[TextReader] Cleaning up camera');
    };
  }, [speak]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Qasja në kamerë është e nevojshme për të lexuar tekst nga dokumentet dhe tabelat
          </Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Jep Leje</Text>
          </Pressable>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Kthehu Prapa</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  const captureAndRead = async () => {
    if (!cameraRef.current || readMutation.isPending) return;

    announceAndVibrate('Duke lexuar tekstin. Ju lutem prisni.', 'medium');

    try {
      console.log('[TextReader] Starting image capture...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture image');
      }

      console.log('[TextReader] Image captured successfully');
      console.log('[TextReader] Sending to backend for text extraction...');

      const result = await readMutation.mutateAsync({
        imageBase64: `data:image/jpeg;base64,${photo.base64}`,
      });

      console.log('[TextReader] Text extraction completed successfully');
      
      if (!result?.text) {
        throw new Error('Përgjigje e pavlefshme nga AI');
      }

      setLastText(result.text);
      speak(result.text);
      announceAndVibrate('Leximi u krye', 'success');
    } catch (error: any) {
      console.error('[TextReader] Error:', error);
      
      let errorMessage = 'Shërbimi i AI nuk është i disponueshëm aktualisht. Ju lutem provoni përsëri më vonë.';
      
      const errorStr = String(error?.message || error || '');
      
      if (errorStr.toLowerCase().includes('network') || errorStr.toLowerCase().includes('fetch failed')) {
        errorMessage = 'Gabim në rrjet. Ju lutem kontrolloni lidhjen tuaj të internetit.';
      } else if (errorStr.toLowerCase().includes('camera') || errorStr.includes('capture')) {
        errorMessage = 'Gabim në kamerë. Ju lutem provoni përsëri.';
      } else if (errorStr.toLowerCase().includes('timeout')) {
        errorMessage = 'Koha e pritjes skadoi. Ju lutem provoni përsëri.';
      }
      
      speak(errorMessage);
      announceAndVibrate('Leximi dështoi', 'error');
      setLastText(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
          <View style={styles.topBar}>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                announceAndVibrate('Duke mbyllur lexuesin e tekstit', 'light');
                router.back();
              }}
              accessibilityLabel="Mbyll lexuesin e tekstit"
              accessibilityRole="button"
            >
              <X size={32} color={Colors.white} strokeWidth={3} />
            </Pressable>
            <Text style={styles.title}>Lexo Tekst</Text>
          </View>

          {lastText !== '' && (
            <View style={styles.textBox}>
              <Text style={styles.textContent}>{lastText}</Text>
            </View>
          )}

          <View style={styles.bottomBar}>
            <Pressable
              style={[styles.captureButton, readMutation.isPending && styles.captureButtonDisabled]}
              onPress={captureAndRead}
              disabled={readMutation.isPending}
              accessibilityLabel={readMutation.isPending ? 'Duke lexuar tekstin' : 'Kapo dhe lexo tekstin'}
              accessibilityRole="button"
              accessibilityHint="Merr një fotografi dhe lexon tekstin me zë të lartë"
            >
              {readMutation.isPending ? (
                <>
                  <Loader2 size={40} color={Colors.white} />
                  <Text style={styles.captureButtonText}>Duke lexuar...</Text>
                </>
              ) : (
                <>
                  <Camera size={40} color={Colors.white} />
                  <Text style={styles.captureButtonText}>Lexo Tekst</Text>
                </>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkNavy,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  closeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  textBox: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.blue,
  },
  textContent: {
    fontSize: 18,
    color: Colors.white,
    lineHeight: 26,
  },
  bottomBar: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    paddingVertical: 24,
    paddingHorizontal: 48,
    backgroundColor: Colors.darkBlue,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonDisabled: {
    backgroundColor: Colors.gray,
    opacity: 0.7,
  },
  captureButtonText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 20,
  },
  permissionText: {
    fontSize: 20,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 28,
  },
  permissionButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: Colors.blue,
    borderRadius: 16,
  },
  permissionButtonText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: Colors.gray,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
