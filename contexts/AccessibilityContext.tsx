import createContextHook from '@nkzw/create-context-hook';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Platform } from 'react-native';

type VoiceSettings = {
  rate: number;
  pitch: number;
  volume: number;
};

export const [AccessibilityProvider, useAccessibility] = createContextHook(() => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [isWebSpeechInitialized, setIsWebSpeechInitialized] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 0.8,
    pitch: 1.0,
    volume: 1.0,
  });

  useEffect(() => {
    const checkLanguages = async () => {
      if (Platform.OS !== 'web') {
        try {
          const languages = await Speech.getAvailableVoicesAsync();
          const languageCodes = languages.map(v => v.language);
          setAvailableLanguages(languageCodes);
          console.log('[Voice] Available languages:', languageCodes);
        } catch (error) {
          console.error('[Voice] Error checking languages:', error);
        }
      } else {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log('[Voice] Web voices loaded:', voices.length);
            if (voices.length > 0) {
              setIsWebSpeechInitialized(true);
            }
          };
          
          if (window.speechSynthesis.getVoices().length > 0) {
            loadVoices();
          } else {
            window.speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
          }
        }
      }
    };
    checkLanguages();
  }, []);

  const initializeWebSpeech = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(utterance);
        window.speechSynthesis.cancel();
        console.log('[Voice] Web speech initialized');
        setIsWebSpeechInitialized(true);
      } catch (error) {
        console.error('[Voice] Error initializing web speech:', error);
      }
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text || typeof text !== 'string') {
      console.log('[Voice] Invalid text, skipping speech');
      return;
    }
    
    console.log('[Voice] Speaking:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
    
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsSpeaking(true);
    
    try {
      if (Platform.OS === 'web') {
        console.log('[Voice] Using web speech synthesis');
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            if (!isWebSpeechInitialized) {
              console.warn('[Voice] Web speech not initialized yet. Waiting for user interaction.');
              setIsSpeaking(false);
              return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await new Promise<void>((resolve) => {
              const voices = window.speechSynthesis.getVoices();
              if (voices.length === 0) {
                window.speechSynthesis.addEventListener('voiceschanged', () => {
                  resolve();
                }, { once: true });
                setTimeout(() => resolve(), 500);
              } else {
                resolve();
              }
            });
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = voiceSettings.rate;
            utterance.pitch = voiceSettings.pitch;
            utterance.volume = voiceSettings.volume;
            utterance.lang = 'sq-AL';
            
            const voices = window.speechSynthesis.getVoices();
            console.log('[Voice] Available voices:', voices.map(v => `${v.name} (${v.lang})`));
            
            const albanianVoice = voices.find(voice => 
              voice.lang.toLowerCase().startsWith('sq') || 
              voice.lang.toLowerCase().includes('albanian')
            );
            
            if (albanianVoice) {
              console.log('[Voice] Using Albanian voice:', albanianVoice.name);
              utterance.voice = albanianVoice;
            } else {
              console.log('[Voice] No Albanian voice found, using default');
            }
            
            utterance.onstart = () => {
              console.log('[Voice] Web speech started');
            };
            
            utterance.onend = () => {
              console.log('[Voice] Web speech finished');
              setIsSpeaking(false);
            };
            
            utterance.onerror = (event) => {
              if (event?.error === 'interrupted') {
                console.log('[Voice] Speech interrupted - normal behavior when new speech starts');
                setIsSpeaking(false);
                return;
              }
              
              if (event?.error === 'not-allowed') {
                console.warn('[Voice] Speech not allowed - user interaction may be required first');
              } else {
                console.error('[Voice] Web speech error:', event?.error || event);
              }
              setIsSpeaking(false);
            };
            
            window.speechSynthesis.speak(utterance);
            console.log('[Voice] Utterance queued for speaking');
          } catch (webError: any) {
            console.error('[Voice] Web speech synthesis error:', webError?.message || webError);
            setIsSpeaking(false);
          }
        } else {
          console.warn('[Voice] Speech synthesis not supported on this browser');
          setIsSpeaking(false);
        }
      } else {
        try {
          console.log('[Voice] Using native speech');
          
          const hasAlbanian = availableLanguages.some(lang => lang.toLowerCase().startsWith('sq'));
          const language = hasAlbanian ? 'sq-AL' : undefined;
          
          console.log('[Voice] Language:', language || 'default');
          
          await Speech.speak(text, {
            language,
            rate: voiceSettings.rate,
            pitch: voiceSettings.pitch,
            volume: voiceSettings.volume,
            onDone: () => {
              console.log('[Voice] Native speech finished');
              setIsSpeaking(false);
            },
            onError: (error: any) => {
              console.error('[Voice] Native speech error:', {
                error: error?.toString(),
                message: error?.message || 'Unknown error',
                type: typeof error,
              });
              setIsSpeaking(false);
            },
          });
          console.log('[Voice] Native speech initiated');
        } catch (nativeError: any) {
          console.error('[Voice] Native Speech.speak error:', nativeError?.message || nativeError?.toString() || 'Unknown error');
          setIsSpeaking(false);
        }
      }
    } catch (error: any) {
      console.error('[Voice] Speak catch-all error:', {
        error: error?.toString(),
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
      });
      setIsSpeaking(false);
    }
  }, [voiceSettings, availableLanguages, isWebSpeechInitialized]);

  const stopSpeaking = useCallback(() => {
    console.log('[Voice] Stopping speech');
    try {
      if (Platform.OS === 'web' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      } else {
        Speech.stop();
      }
    } catch (error) {
      console.error('[Voice] Error stopping speech:', error);
    }
    setIsSpeaking(false);
  }, []);

  const hapticFeedback = useCallback(async (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (Platform.OS === 'web') {
      console.log('[Haptics] Not available on web');
      return;
    }

    console.log('[Haptics] Feedback:', type);
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.error('[Haptics] Error:', error);
    }
  }, []);

  const announceAndVibrate = useCallback((text: string, hapticType: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') => {
    hapticFeedback(hapticType);
    speak(text);
  }, [speak, hapticFeedback]);

  return useMemo(() => ({
    speak,
    stopSpeaking,
    isSpeaking,
    hapticFeedback,
    announceAndVibrate,
    voiceSettings,
    setVoiceSettings,
    initializeWebSpeech,
  }), [speak, stopSpeaking, isSpeaking, hapticFeedback, announceAndVibrate, voiceSettings, initializeWebSpeech]);
});
