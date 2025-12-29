import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { Platform, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

type DeviceType = 'glasses' | 'stick' | null;

type ConnectedDevice = {
  type: DeviceType;
  name: string;
  id: string;
  connected: boolean;
};

export const [DeviceProvider, useDevice] = createContextHook(() => {
  const [connectedGlasses, setConnectedGlasses] = useState<ConnectedDevice | null>(null);
  const [connectedStick, setConnectedStick] = useState<ConnectedDevice | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const speak = useCallback((text: string) => {
    if (Platform.OS !== 'web') {
      Speech.speak(text, { language: 'sq-AL' });
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sq-AL';
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const announceAndVibrate = useCallback((text: string, type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (Platform.OS !== 'web') {
      try {
        switch (type) {
          case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'success':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        }
      } catch (error) {
        console.error('[Haptics] Error:', error);
      }
    }
    speak(text);
  }, [speak]);

  const connectDevice = useCallback(async (deviceType: 'glasses' | 'stick') => {
    console.log(`[Device] Attempting to connect ${deviceType}`);
    
    try {
      announceAndVibrate(
        deviceType === 'glasses' 
          ? 'Duke u lidhur me syzet inteligjente...' 
          : 'Duke u lidhur me shkopun inteligjent...',
        'medium'
      );

      setIsScanning(true);

      if (Platform.OS === 'web') {
        if (!('bluetooth' in navigator)) {
          Alert.alert(
            'Bluetooth jo i disponueshëm',
            'Shfletuesi juaj nuk e mbështet Bluetooth Web API. Ju lutem përdorni një pajisje mobile ose një shfletues që e mbështet Bluetooth.',
            [{ text: 'OK' }]
          );
          speak('Bluetooth nuk është i disponueshëm në këtë shfletues');
          setIsScanning(false);
          return;
        }

        const device = await (navigator.bluetooth as any).requestDevice({
          filters: [
            { services: ['battery_service'] },
            { name: deviceType === 'glasses' ? 'Smart Glasses' : 'Smart Stick' }
          ],
          optionalServices: ['device_information']
        });

        console.log('[Device] Web Bluetooth device selected:', device.name);

        await device.gatt.connect();
        console.log('[Device] Connected to GATT server');

        const connectedDevice: ConnectedDevice = {
          type: deviceType,
          name: device.name || (deviceType === 'glasses' ? 'Syzet Inteligjente' : 'Shkopi Inteligjent'),
          id: device.id,
          connected: true,
        };

        if (deviceType === 'glasses') {
          setConnectedGlasses(connectedDevice);
          announceAndVibrate('Syzet inteligjente u lidhën me sukses', 'success');
        } else {
          setConnectedStick(connectedDevice);
          announceAndVibrate('Shkopi inteligjent u lidh me sukses', 'success');
        }

        device.addEventListener('gattserverdisconnected', () => {
          console.log('[Device] Device disconnected');
          if (deviceType === 'glasses') {
            setConnectedGlasses(null);
            speak('Syzet inteligjente u shkëputën');
          } else {
            setConnectedStick(null);
            speak('Shkopi inteligjent u shkëput');
          }
        });

      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockDevice: ConnectedDevice = {
          type: deviceType,
          name: deviceType === 'glasses' ? 'Syzet Inteligjente' : 'Shkopi Inteligjent',
          id: `mock-${deviceType}-${Date.now()}`,
          connected: true,
        };

        if (deviceType === 'glasses') {
          setConnectedGlasses(mockDevice);
          announceAndVibrate('Syzet inteligjente u lidhën me sukses', 'success');
        } else {
          setConnectedStick(mockDevice);
          announceAndVibrate('Shkopi inteligjent u lidh me sukses', 'success');
        }

        console.log(`[Device] ${deviceType} connected (mock mode)`);
      }

      setIsScanning(false);
    } catch (error: any) {
      console.error('[Device] Connection error:', error);
      setIsScanning(false);
      
      if (error?.name === 'NotFoundError' || error?.message?.includes('User cancelled')) {
        speak('Lidhja u anulua');
      } else {
        announceAndVibrate(
          'Dështoi lidhja. Ju lutem sigurohuni që pajisja është e ndezur dhe afër jush.',
          'error'
        );
        
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Gabim në lidhje',
            'Nuk u arrit të lidhet me pajisjen. Ju lutem sigurohuni që Bluetooth është i aktivizuar dhe pajisja është afër.',
            [{ text: 'OK' }]
          );
        }
      }
    }
  }, [announceAndVibrate, speak]);

  const disconnectDevice = useCallback((deviceType: 'glasses' | 'stick') => {
    console.log(`[Device] Disconnecting ${deviceType}`);
    
    if (deviceType === 'glasses' && connectedGlasses) {
      setConnectedGlasses(null);
      announceAndVibrate('Syzet inteligjente u shkëputën', 'light');
    } else if (deviceType === 'stick' && connectedStick) {
      setConnectedStick(null);
      announceAndVibrate('Shkopi inteligjent u shkëput', 'light');
    }
  }, [connectedGlasses, connectedStick, announceAndVibrate]);

  const sendToDevice = useCallback((deviceType: 'glasses' | 'stick', data: any) => {
    console.log(`[Device] Sending data to ${deviceType}:`, data);
    
    const device = deviceType === 'glasses' ? connectedGlasses : connectedStick;
    
    if (!device?.connected) {
      console.warn(`[Device] ${deviceType} not connected`);
      return false;
    }

    return true;
  }, [connectedGlasses, connectedStick]);

  return useMemo(() => ({
    connectedGlasses,
    connectedStick,
    isScanning,
    connectDevice,
    disconnectDevice,
    sendToDevice,
    isAnyDeviceConnected: !!(connectedGlasses?.connected || connectedStick?.connected),
  }), [
    connectedGlasses,
    connectedStick,
    isScanning,
    connectDevice,
    disconnectDevice,
    sendToDevice,
  ]);
});
