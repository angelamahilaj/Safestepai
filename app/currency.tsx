import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { X, Camera, Loader2 } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { trpc } from '@/lib/trpc';
import Colors from '@/constants/colors';

export default function CurrencyScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const [permission, requestPermission] = useCameraPermissions();
  const identifyMutation = trpc.currency.identify.useMutation();
  const [lastResult, setLastResult] = useState('');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    speak('Identifikuesi i valutës u aktivizua. Drejtoni kamerën drejt parasë dhe prekni butonin identifiko.');
    
    return () => {
      console.log('[Currency] Cleaning up camera');
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
            Qasja në kamerë është e nevojshme për të identifikuar valutën
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

  const captureAndIdentify = async () => {
    if (!cameraRef.current || identifyMutation.isPending) return;
    announceAndVibrate('Duke identifikuar valutën. Ju lutem prisni.', 'medium');

    try {
      console.log('[Currency] Starting image capture...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture image');
      }

      console.log('[Currency] Image captured successfully');
      console.log('[Currency] Sending to backend for identification...');

      const result = await identifyMutation.mutateAsync({
        imageBase64: `data:image/jpeg;base64,${photo.base64}`,
      });

      console.log('[Currency] Identification completed successfully');
      
      if (!result?.result) {
        throw new Error('Përgjigje e pavlefshme nga AI');
      }

      setLastResult(result.result);
      speak(result.result);
      announceAndVibrate('Identifikimi u krye', 'success');
    } catch (error: any) {
      console.error('[Currency] Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        cause: error?.cause,
      });
      
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
      announceAndVibrate('Identifikimi dështoi', 'error');
      setLastResult(errorMessage);
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
                announceAndVibrate('Duke mbyllur identifikuesin e valutës', 'light');
                router.back();
              }}
              accessibilityLabel="Mbyll identifikuesin e valutës"
              accessibilityRole="button"
            >
              <X size={32} color={Colors.white} strokeWidth={3} />
            </Pressable>
            <Text style={styles.title}>Identifiko Valutë</Text>
          </View>

          {lastResult !== '' && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{lastResult}</Text>
            </View>
          )}

          <View style={styles.bottomBar}>
            <Pressable
              style={[styles.captureButton, identifyMutation.isPending && styles.captureButtonDisabled]}
              onPress={captureAndIdentify}
              disabled={identifyMutation.isPending}
              accessibilityLabel={identifyMutation.isPending ? 'Duke identifikuar valutën' : 'Kapo dhe identifiko valutën'}
              accessibilityRole="button"
              accessibilityHint="Merr një fotografi dhe identifikon valutën"
            >
              {identifyMutation.isPending ? (
                <>
                  <Loader2 size={40} color={Colors.white} />
                  <Text style={styles.captureButtonText}>Duke identifikuar...</Text>
                </>
              ) : (
                <>
                  <Camera size={40} color={Colors.white} />
                  <Text style={styles.captureButtonText}>Identifiko Valutë</Text>
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
  resultBox: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.green,
  },
  resultText: {
    fontSize: 20,
    color: Colors.white,
    lineHeight: 28,
    fontWeight: '600' as const,
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
