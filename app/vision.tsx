import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { X, Camera, Loader2 } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { trpc } from '@/lib/trpc';
import Colors from '@/constants/colors';

export default function VisionScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const [permission, requestPermission] = useCameraPermissions();
  const analyzeMutation = trpc.vision.analyze.useMutation();
  const [lastDescription, setLastDescription] = useState('');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    speak('Kamera e aktivizuar. Drejtojeni drejt diçkaje dhe prekni butonin analizo skenën.');
    
    return () => {
      console.log('[Vision] Cleaning up camera');
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
            Qasja në kamerë është e nevojshme për të përshkruar rrethinën tuaj
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

  const captureAndAnalyze = async () => {
    if (!cameraRef.current || analyzeMutation.isPending) return;

    announceAndVibrate('Duke analizuar skenën. Ju lutem prisni.', 'medium');

    try {
      console.log('[Vision] Starting image capture...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture image');
      }

      console.log('[Vision] Image captured successfully');
      console.log('[Vision] Sending to backend for analysis...');
      
      const result = await analyzeMutation.mutateAsync({
        imageBase64: `data:image/jpeg;base64,${photo.base64}`,
        prompt: 'Përshkruaj këtë skenë në detaje për një person të verbër në shqip. Përfshi objektet, njerëzit, ngjyrat, marrëdhëniet hapësinore, rreziqet e mundshme dhe çdo tekst të dukshëm. Jini specifik dhe i dobishëm.',
      });
      
      console.log('[Vision] Analysis completed successfully');
      
      if (!result?.description) {
        throw new Error('Përgjigje e pavlefshme nga AI');
      }

      setLastDescription(result.description);
      speak(result.description);
      announceAndVibrate('Analiza u krye', 'success');
    } catch (error: any) {
      console.error('[Vision] Error:', error);
      
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
      announceAndVibrate('Analiza dështoi', 'error');
      setLastDescription(errorMessage);
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
                announceAndVibrate('Duke mbyllur kamerën', 'light');
                router.back();
              }}
              accessibilityLabel="Mbyll kamerën"
              accessibilityRole="button"
            >
              <X size={32} color={Colors.white} strokeWidth={3} />
            </Pressable>
            <Text style={styles.title}>Çfarë Sheh?</Text>
          </View>

          {lastDescription !== '' && (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{lastDescription}</Text>
            </View>
          )}

          <View style={styles.bottomBar}>
            <Pressable
              style={[styles.captureButton, analyzeMutation.isPending && styles.captureButtonDisabled]}
              onPress={captureAndAnalyze}
              disabled={analyzeMutation.isPending}
              accessibilityLabel={analyzeMutation.isPending ? 'Duke analizuar skenën' : 'Kapo dhe analizo skenën'}
              accessibilityRole="button"
              accessibilityHint="Merr një fotografi dhe përshkruan atë që shikon kamera"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 size={40} color={Colors.white} />
                  <Text style={styles.captureButtonText}>Duke analizuar...</Text>
                </>
              ) : (
                <>
                  <Camera size={40} color={Colors.white} />
                  <Text style={styles.captureButtonText}>Analizo Skenën</Text>
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
  descriptionBox: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.blue,
  },
  descriptionText: {
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
    backgroundColor: Colors.blue,
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
