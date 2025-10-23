import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { X, Camera, Loader2 } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { generateText } from '@rork/toolkit-sdk';
import Colors from '@/constants/colors';

export default function VisionScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastDescription, setLastDescription] = useState('');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    speak('Camera activated. Point at something and tap analyze scene button.');
    
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
            Camera access is needed to describe your surroundings
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

  const captureAndAnalyze = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    announceAndVibrate('Analyzing scene. Please wait.', 'medium');

    try {
      console.log('[Vision] Starting image capture...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture image');
      }

      console.log('[Vision] Image captured successfully, size:', photo.base64.length);
      console.log('[Vision] Sending to AI for analysis...');

      const description = await generateText({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Describe this scene in detail for a blind person. Include objects, people, colors, spatial relationships, potential hazards, and any text visible. Be specific and helpful.',
              },
              {
                type: 'image',
                image: `data:image/jpeg;base64,${photo.base64}`,
              },
            ],
          },
        ],
      });

      console.log('[Vision] Description received successfully');
      setLastDescription(description);
      speak(description);
      announceAndVibrate('Analysis complete', 'success');
    } catch (error: any) {
      console.error('[Vision] Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        cause: error?.cause,
      });
      
      let errorMessage = 'Sorry, I could not analyze the scene.';
      
      if (error?.message?.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
        console.error('[Vision] Network request failed - possible causes:');
        console.error('  - No internet connection');
        console.error('  - EXPO_PUBLIC_TOOLKIT_URL not configured');
        console.error('  - API endpoint unreachable');
      } else if (error?.message?.includes('Failed to capture image')) {
        errorMessage = 'Camera error. Please try again.';
      }
      
      speak(errorMessage);
      announceAndVibrate('Analysis failed', 'error');
      setLastDescription(errorMessage);
    } finally {
      setIsAnalyzing(false);
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
                announceAndVibrate('Closing camera', 'light');
                router.back();
              }}
              accessibilityLabel="Close camera"
              accessibilityRole="button"
            >
              <X size={32} color={Colors.white} strokeWidth={3} />
            </Pressable>
            <Text style={styles.title}>What Do You See?</Text>
          </View>

          {lastDescription !== '' && (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{lastDescription}</Text>
            </View>
          )}

          <View style={styles.bottomBar}>
            <Pressable
              style={[styles.captureButton, isAnalyzing && styles.captureButtonDisabled]}
              onPress={captureAndAnalyze}
              disabled={isAnalyzing}
              accessibilityLabel={isAnalyzing ? 'Analyzing scene' : 'Capture and analyze scene'}
              accessibilityRole="button"
              accessibilityHint="Takes a photo and describes what the camera sees"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={40} color={Colors.white} />
                  <Text style={styles.captureButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <Camera size={40} color={Colors.white} />
                  <Text style={styles.captureButtonText}>Analyze Scene</Text>
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
