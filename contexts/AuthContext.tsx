import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';

export type MedicalInfo = {
  bloodType?: string;
  allergies?: string[];
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    timeOfDay: string[];
  }[];

  conditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  doctorContact?: {
    name: string;
    phone: string;
    specialty: string;
  };
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  medicalInfo?: MedicalInfo;
  createdAt: string;
};

const STORAGE_KEY = '@safestep_user';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    console.log('[Auth] Loading user from storage');
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);
        console.log('[Auth] User loaded:', userData.email);
      } else {
        console.log('[Auth] No user found in storage');
      }
    } catch (error) {
      console.error('[Auth] Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signUp = useCallback(async (name: string, email: string, phone?: string) => {
    console.log('[Auth] Signing up:', email);
    try {
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      console.log('[Auth] User signed up successfully');
      return { success: true, user: newUser };
    } catch (error) {
      console.error('[Auth] Sign up error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  }, []);

  const signIn = useCallback(async (email: string) => {
    console.log('[Auth] Signing in:', email);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userData: User = JSON.parse(stored);
        if (userData.email.toLowerCase() === email.toLowerCase()) {
          setUser(userData);
          console.log('[Auth] User signed in successfully');
          return { success: true, user: userData };
        }
      }
      return { success: false, error: 'Account not found. Please sign up first.' };
    } catch (error) {
      console.error('[Auth] Sign in error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('[Auth] Signing out');
    try {
      setUser(null);
      console.log('[Auth] User signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
      return { success: false, error: 'Failed to sign out' };
    }
  }, []);

  const updateMedicalInfo = useCallback(async (medicalInfo: MedicalInfo) => {
    console.log('[Auth] Updating medical info');
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const updatedUser: User = {
        ...user,
        medicalInfo,
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('[Auth] Medical info updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('[Auth] Update medical info error:', error);
      return { success: false, error: 'Failed to update medical information' };
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    console.log('[Auth] Updating profile');
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const updatedUser: User = {
        ...user,
        ...updates,
        id: user.id,
        createdAt: user.createdAt,
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('[Auth] Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('[Auth] Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }, [user]);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    updateMedicalInfo,
    updateProfile,
  }), [user, isLoading, signUp, signIn, signOut, updateMedicalInfo, updateProfile]);
});
