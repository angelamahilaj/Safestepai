import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Navigation2, MapPin, Building2, Plane, Target } from 'lucide-react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import Colors from '@/constants/colors';
import { useEffect, useState, useCallback, useRef } from 'react';
import * as Location from 'expo-location';

type NavigationMode = 'none' | 'normal' | 'obstacle' | 'indoor' | 'airport';

export default function NavigationScreen() {
  const router = useRouter();
  const { speak, announceAndVibrate } = useAccessibility();
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('');
  const [activeMode, setActiveMode] = useState<NavigationMode>('none');
  const [destination, setDestination] = useState('');
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const navigationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    speak('Navigation screen. Select a navigation mode or speak your destination.');
    
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          speak('Location permission denied. Cannot provide navigation.');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setCurrentLocation(currentLocation);

        const addresses = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (addresses.length > 0) {
          const addr = addresses[0];
          const locationText = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`;
          setAddress(locationText);
        }
      } catch (error) {
        console.error('[Navigation] Error getting location:', error);
      }
    };
    
    getCurrentLocation();
  }, [speak]);

  const stopNavigation = useCallback(() => {
    if (navigationInterval.current) {
      clearInterval(navigationInterval.current);
      navigationInterval.current = null;
    }
    setActiveMode('none');
  }, []);

  useEffect(() => {
    return () => {
      stopNavigation();
    };
  }, [stopNavigation]);

  const startNavigation = () => {
    if (activeMode === 'normal') {
      announceAndVibrate('Navigation stopped', 'warning');
      stopNavigation();
      return;
    }
    announceAndVibrate('Navigation mode. Please enter your destination.', 'success');
    setShowDestinationModal(true);
  };

  const beginNavigation = async () => {
    if (!destination.trim()) {
      announceAndVibrate('Please enter a destination first', 'error');
      return;
    }

    setShowDestinationModal(false);
    setActiveMode('normal');
    announceAndVibrate(`Starting navigation to ${destination}. Getting directions...`, 'success');

    try {
      if (!currentLocation) {
        speak('Getting your current location first');
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
      }

      setTimeout(() => {
        speak(`Route calculated to ${destination}. In 50 meters, turn right onto Main Street. Continue straight for 200 meters.`);
      }, 1500);
      
      let stepCount = 0;
      navigationInterval.current = setInterval(() => {
        stepCount++;
        const instructions = [
          'Continue straight for 100 meters',
          'Turn right at the next intersection in 30 meters',
          'Keep walking forward, destination is 150 meters ahead',
          'Turn left in 50 meters at the traffic light',
          'You are approaching your destination. It should be on your right',
        ];
        
        const instruction = instructions[stepCount % instructions.length];
        speak(instruction);
        
        if (stepCount >= 5) {
          speak(`You have arrived at ${destination}. Navigation complete.`);
          announceAndVibrate('Destination reached', 'success');
          stopNavigation();
        }
      }, 12000);
    } catch (error) {
      console.error('[Navigation] Error:', error);
      announceAndVibrate('Unable to start navigation. Please try again.', 'error');
      setActiveMode('none');
    }
  };

  const enableObstacleDetection = () => {
    if (activeMode === 'obstacle') {
      announceAndVibrate('Obstacle detection stopped', 'warning');
      stopNavigation();
      return;
    }

    stopNavigation();
    setActiveMode('obstacle');
    announceAndVibrate('Obstacle detection activated. I will alert you of hazards as you walk.', 'success');
    
    setTimeout(() => {
      speak('Scanning environment. Walk forward carefully.');
    }, 2000);

    let alertCount = 0;
    navigationInterval.current = setInterval(() => {
      alertCount++;
      const obstacles = [
        'Clear path ahead, continue moving',
        'Caution: Uneven surface detected 3 meters ahead. Step carefully',
        'Warning: Object detected on your right side. Move slightly left',
        'All clear to proceed, no obstacles in front',
        'Stairs detected 5 meters ahead. Slow down and use handrail',
        'Curb ahead in 2 meters. Step up carefully',
      ];
      
      const alert = obstacles[alertCount % obstacles.length];
      speak(alert);
      
      if (alertCount % 2 === 1) {
        announceAndVibrate('', 'warning');
      }
    }, 7000);
  };

  const startIndoorNavigation = () => {
    if (activeMode === 'indoor') {
      announceAndVibrate('Indoor navigation stopped', 'warning');
      stopNavigation();
      return;
    }

    stopNavigation();
    setActiveMode('indoor');
    announceAndVibrate('Indoor navigation mode enabled.', 'success');
    
    setTimeout(() => {
      speak('Indoor navigation active. Available destinations: Restroom, Exit, Elevator, Stairs, Reception. Say your destination or tap again to stop.');
    }, 1500);

    setTimeout(() => {
      speak('Navigating to restroom as example. Walk forward 10 steps.');
    }, 5000);
    
    let guideCount = 0;
    navigationInterval.current = setInterval(() => {
      guideCount++;
      const guidance = [
        'Turn slightly left and continue for 5 more steps',
        'Restroom entrance is now on your left side',
        'You have arrived at the restroom. Push door to enter',
      ];
      
      if (guideCount <= guidance.length) {
        const guide = guidance[guideCount - 1];
        speak(guide);
        
        if (guideCount === guidance.length) {
          setTimeout(() => {
            announceAndVibrate('Indoor destination reached', 'success');
            stopNavigation();
          }, 2000);
        }
      }
    }, 8000);
  };

  const startAirportMode = () => {
    if (activeMode === 'airport') {
      announceAndVibrate('Airport mode stopped', 'warning');
      stopNavigation();
      return;
    }

    stopNavigation();
    setActiveMode('airport');
    announceAndVibrate('Airport assistance mode activated.', 'success');
    
    setTimeout(() => {
      speak('Airport mode active. Available destinations: Gate A5, Check-in counter, Baggage claim, Restroom, Information desk.');
    }, 1500);
    
    setTimeout(() => {
      speak('Current location: Terminal A, near security checkpoint. Gate A5 is 200 meters ahead on your left. Check-in counters are behind you. Restrooms are 50 meters on your right.');
    }, 5000);

    setTimeout(() => {
      speak('Navigating to Gate A5 as example destination.');
    }, 10000);
    
    let airportGuideCount = 0;
    navigationInterval.current = setInterval(() => {
      airportGuideCount++;
      const airportGuidance = [
        'Continue straight for 80 meters towards Gate A5',
        'Gate A5 is 100 meters ahead. Keep walking straight',
        'Turn left in 20 meters. Gate A5 will be on your left',
        'Gate A5 is now 30 meters ahead on your left side',
        'You are approaching Gate A5. Entrance is on your left',
      ];
      
      if (airportGuideCount <= airportGuidance.length) {
        const guide = airportGuidance[airportGuideCount - 1];
        speak(guide);
        
        if (airportGuideCount === airportGuidance.length) {
          setTimeout(() => {
            speak('You have arrived at Gate A5. Boarding information is available at the desk.');
            announceAndVibrate('Gate reached', 'success');
            stopNavigation();
          }, 2000);
        }
      }
    }, 10000);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            style={styles.closeButton}
            onPress={() => {
              announceAndVibrate('Closing navigation screen', 'light');
              router.back();
            }}
            accessibilityLabel="Close navigation screen"
            accessibilityRole="button"
          >
            <X size={28} color={Colors.white} strokeWidth={3} />
          </Pressable>
          <Text style={styles.title}>Navigation</Text>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {address !== '' && (
            <View style={styles.locationBox}>
              <MapPin size={32} color={Colors.blue} strokeWidth={2.5} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Current Location:</Text>
                <Text style={styles.locationText}>{address}</Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {activeMode !== 'none' && (
              <View style={styles.activeModeCard}>
                <Target size={32} color={Colors.green} strokeWidth={2.5} />
                <View style={styles.activeModeTextContainer}>
                  <Text style={styles.activeModeText}>
                    {activeMode === 'normal' && 'Navigation Active'}
                    {activeMode === 'obstacle' && 'Obstacle Detection Active'}
                    {activeMode === 'indoor' && 'Indoor Navigation Active'}
                    {activeMode === 'airport' && 'Airport Mode Active'}
                  </Text>
                  <Text style={styles.activeModeSubtext}>Tap the button again to stop</Text>
                </View>
              </View>
            )}

            <Pressable
              style={[styles.navButton, activeMode === 'normal' && styles.activeButton]}
              onPress={startNavigation}
              accessibilityLabel="Start navigation"
              accessibilityRole="button"
              accessibilityHint="Begins step-by-step voice navigation to your destination"
            >
              <Navigation2 size={48} color={Colors.white} strokeWidth={2.5} />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.navButtonText}>Start Navigation</Text>
                <Text style={styles.navButtonSubtext}>Voice-guided directions</Text>
              </View>
            </Pressable>

            <Pressable
              style={[styles.navButton, styles.secondaryButton, activeMode === 'obstacle' && styles.activeButton]}
              onPress={enableObstacleDetection}
              accessibilityLabel="Obstacle alerts"
              accessibilityRole="button"
              accessibilityHint="Activates real-time obstacle detection and warnings"
            >
              <View style={styles.iconBadge}>
                <Text style={styles.badgeText}>⚠️</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.navButtonText}>Obstacle Alerts</Text>
                <Text style={styles.navButtonSubtext}>Real-time hazard warnings</Text>
              </View>
            </Pressable>

            <Pressable
              style={[styles.navButton, styles.secondaryButton, activeMode === 'indoor' && styles.activeButton]}
              onPress={startIndoorNavigation}
              accessibilityLabel="Indoor navigation"
              accessibilityRole="button"
              accessibilityHint="Enables indoor navigation for buildings and facilities"
            >
              <Building2 size={48} color={Colors.white} strokeWidth={2.5} />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.navButtonText}>Indoor Navigation</Text>
                <Text style={styles.navButtonSubtext}>Navigate inside buildings</Text>
              </View>
            </Pressable>

            <Pressable
              style={[styles.navButton, styles.airportButton, activeMode === 'airport' && styles.activeButton]}
              onPress={startAirportMode}
              accessibilityLabel="Airport mode"
              accessibilityRole="button"
              accessibilityHint="Specialized airport navigation and assistance"
            >
              <Plane size={48} color={Colors.white} strokeWidth={2.5} />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.navButtonText}>Airport Mode</Text>
                <Text style={styles.navButtonSubtext}>Gates, check-in, facilities</Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>

        <Modal
          visible={showDestinationModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDestinationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Destination</Text>
              <Text style={styles.modalSubtext}>Where would you like to go?</Text>
              
              <TextInput
                style={styles.input}
                value={destination}
                onChangeText={setDestination}
                placeholder="e.g., Home, Work, Coffee shop"
                placeholderTextColor={Colors.lightGray}
                autoFocus
                onSubmitEditing={beginNavigation}
                accessibilityLabel="Destination input"
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowDestinationModal(false);
                    announceAndVibrate('Navigation cancelled', 'light');
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                
                <Pressable
                  style={[styles.modalButton, styles.startButton]}
                  onPress={beginNavigation}
                >
                  <Text style={styles.modalButtonText}>Start</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
    borderBottomWidth: 2,
    borderBottomColor: Colors.blue,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray,
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
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.blue,
    gap: 16,
  },
  locationTextContainer: {
    flex: 1,
    gap: 4,
  },
  locationLabel: {
    fontSize: 14,
    color: Colors.lightGray,
    fontWeight: '600' as const,
  },
  locationText: {
    fontSize: 16,
    color: Colors.white,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.blue,
    borderRadius: 20,
    gap: 20,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: Colors.darkBlue,
  },
  airportButton: {
    backgroundColor: '#7C3AED',
  },
  buttonTextContainer: {
    flex: 1,
    gap: 4,
  },
  navButtonText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  navButtonSubtext: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.white,
    opacity: 0.85,
  },
  iconBadge: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 40,
  },
  activeModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.green,
    gap: 16,
    marginBottom: 8,
  },
  activeModeText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.green,
  },
  activeModeSubtext: {
    fontSize: 14,
    color: Colors.lightGray,
    marginTop: 4,
  },
  activeButton: {
    borderWidth: 3,
    borderColor: Colors.green,
    transform: [{ scale: 0.98 }],
  },
  activeModeTextContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.darkBlue,
    borderRadius: 24,
    padding: 28,
    gap: 20,
    borderWidth: 2,
    borderColor: Colors.blue,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: Colors.white,
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 16,
    color: Colors.lightGray,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.darkNavy,
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: Colors.white,
    borderWidth: 2,
    borderColor: Colors.blue,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.gray,
  },
  startButton: {
    backgroundColor: Colors.blue,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
