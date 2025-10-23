import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { X, Camera, Loader2 } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { generateText } from '@rork/toolkit-sdk';
import Colors from '@/constants/colors';

export default function CurrencyScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const [permission, requestPermission] = useCameraPermissions();
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [lastResult, setLastResult] = useState('');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    speak('Currency identifier activated. Point camera at money and tap identify button.');
    
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
            Camera access is needed to identify currency
          </Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  const captureAndIdentify = async () => {
    if (!cameraRef.current || isIdentifying) return;

    setIsIdentifying(true);
    announceAndVibrate('Identifying currency. Please wait.', 'medium');

    try {
      console.log('[Currency] Starting image capture...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture image');
      }

      console.log('[Currency] Image captured successfully, size:', photo.base64.length);
      console.log('[Currency] Sending to AI for currency identification...');

      const result = await generateText({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify any currency (banknotes or coins) in this image. Specify the denomination, currency type (USD, EUR, GBP, etc.), and any other relevant details. If there are multiple bills or coins, list them all. If no currency is visible, say "No currency detected in this image."',
              },
              {
                type: 'image',
                image: `data:image/jpeg;base64,${photo.base64}`,
              },
            ],
          },
        ],
      });

      console.log('[Currency] Identification successful');
      setLastResult(result);
      speak(result);
      announceAndVibrate('Identification complete', 'success');
    } catch (error: any) {
      console.error('[Currency] Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        cause: error?.cause,
      });
      
      let errorMessage = 'Sorry, I could not identify the currency.';
      
      if (error?.message?.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
        console.error('[Currency] Network request failed - check internet connection');
      } else if (error?.message?.includes('Failed to capture image')) {
        errorMessage = 'Camera error. Please try again.';
      }
      
      speak(errorMessage);
      announceAndVibrate('Identification failed', 'error');
      setLastResult(errorMessage);
    } finally {
      setIsIdentifying(false);
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
                announceAndVibrate('Closing currency identifier', 'light');
                router.back();
              }}
              accessibilityLabel="Close currency identifier"
              accessibilityRole="button"
            >
              <X size={32} color={Colors.white} strokeWidth={3} />
            </Pressable>
            <Text style={styles.title}>Identify Currency</Text>
          </View>

          {lastResult !== '' && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{lastResult}</Text>
            </View>
          )}

          <View style={styles.bottomBar}>
            <Pressable
              style={[styles.captureButton, isIdentifying && styles.captureButtonDisabled]}
              onPress={captureAndIdentify}
              disabled={isIdentifying}
              accessibilityLabel={isIdentifying ? 'Identifying currency' : 'Capture and identify currency'}
              accessibilityRole="button"
              accessibilityHint="Takes a photo and identifies the currency"
            >
              {isIdentifying ? (
                <>
                  <Loader2 size={40} color={Colors.white} />
                  <Text style={styles.captureButtonText}>Identifying...</Text>
                </>
              ) : (
                <>
                  <Camera size={40} color={Colors.white} />
                  <Text style={styles.captureButtonText}>Identify Currency</Text>
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
