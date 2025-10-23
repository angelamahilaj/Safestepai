import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { X, MapPin, Navigation, Loader2 } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import Colors from '@/constants/colors';

type LocationInfo = {
  address: string;
  coordinates: string;
  accuracy: string;
};

export default function LocationScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const [permission, setPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);

  const checkPermissions = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermission(status === 'granted');
    } catch (error) {
      console.error('[Location] Permission check error:', error);
      setPermission(false);
    }
  }, []);

  useEffect(() => {
    speak('Where am I? Getting your location information.');
    checkPermissions();
  }, [speak, checkPermissions]);

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status === 'granted');
      if (status === 'granted') {
        announceAndVibrate('Location permission granted', 'success');
        getCurrentLocation();
      } else {
        announceAndVibrate('Location permission denied', 'error');
      }
    } catch (error) {
      console.error('[Location] Permission request error:', error);
      announceAndVibrate('Could not request location permission', 'error');
    }
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    announceAndVibrate('Getting your location', 'medium');

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const accuracy = location.coords.accuracy?.toFixed(0) || 'unknown';

      console.log('[Location] Got coordinates:', latitude, longitude);

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const place = reverseGeocode[0];
      let addressText = 'Address not available';

      if (place) {
        const parts = [
          place.name,
          place.street,
          place.city,
          place.region,
          place.postalCode,
          place.country,
        ].filter(Boolean);
        addressText = parts.join(', ');
      }

      const info: LocationInfo = {
        address: addressText,
        coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        accuracy: `${accuracy} meters`,
      };

      setLocationInfo(info);

      const announcement = `Your location: ${addressText}`;
      speak(announcement);
      announceAndVibrate('Location found', 'success');
    } catch (error) {
      console.error('[Location] Error getting location:', error);
      const errorMessage = 'Sorry, I could not get your location. Please try again.';
      speak(errorMessage);
      announceAndVibrate('Location error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (permission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    );
  }

  if (permission === false) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                announceAndVibrate('Closing location screen', 'light');
                router.back();
              }}
              accessibilityLabel="Close location screen"
              accessibilityRole="button"
            >
              <X size={28} color={Colors.white} strokeWidth={3} />
            </Pressable>
            <Text style={styles.title}>Where Am I?</Text>
          </View>

          <View style={styles.permissionContainer}>
            <MapPin size={80} color={Colors.blue} strokeWidth={2} />
            <Text style={styles.permissionText}>
              Location permission is needed to tell you where you are
            </Text>
            <Pressable style={styles.permissionButton} onPress={requestPermissions}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            style={styles.closeButton}
            onPress={() => {
              announceAndVibrate('Closing location screen', 'light');
              router.back();
            }}
            accessibilityLabel="Close location screen"
            accessibilityRole="button"
          >
            <X size={28} color={Colors.white} strokeWidth={3} />
          </Pressable>
          <Text style={styles.title}>Where Am I?</Text>
        </View>

        <View style={styles.content}>
          {!locationInfo && !isLoading && (
            <View style={styles.emptyState}>
              <Navigation size={80} color={Colors.blue} strokeWidth={2} />
              <Text style={styles.emptyText}>
                Tap the button below to get your current location
              </Text>
            </View>
          )}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <Loader2 size={64} color={Colors.blue} />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          )}

          {locationInfo && !isLoading && (
            <View style={styles.infoContainer}>
              <View style={styles.infoCard}>
                <MapPin size={40} color={Colors.blue} strokeWidth={2.5} />
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{locationInfo.address}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Coordinates</Text>
                <Text style={styles.infoValue}>{locationInfo.coordinates}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Accuracy</Text>
                <Text style={styles.infoValue}>{locationInfo.accuracy}</Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.getLocationButton, isLoading && styles.buttonDisabled]}
              onPress={getCurrentLocation}
              disabled={isLoading}
              accessibilityLabel={isLoading ? 'Getting location' : 'Get current location'}
              accessibilityRole="button"
              accessibilityHint="Gets your current location and address"
            >
              <Navigation size={32} color={Colors.white} />
              <Text style={styles.buttonText}>
                {isLoading ? 'Getting Location...' : 'Get My Location'}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkNavy,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkBlue,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.darkBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 28,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  loadingText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '600' as const,
  },
  infoContainer: {
    flex: 1,
    gap: 16,
  },
  infoCard: {
    padding: 24,
    backgroundColor: Colors.darkBlue,
    borderRadius: 20,
    gap: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.lightGray,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  buttonContainer: {
    paddingTop: 20,
  },
  getLocationButton: {
    flexDirection: 'row',
    paddingVertical: 24,
    paddingHorizontal: 32,
    backgroundColor: Colors.blue,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray,
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    padding: 40,
  },
  permissionText: {
    fontSize: 20,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 28,
  },
  permissionButton: {
    paddingVertical: 24,
    paddingHorizontal: 48,
    backgroundColor: Colors.blue,
    borderRadius: 20,
  },
  permissionButtonText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
