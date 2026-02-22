import { useState, useEffect } from 'react';
import { firebaseService } from '../lib/firebase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChange((authUser) => {
      if (authUser) {
        setUser({
          uid: authUser.uid,
          email: authUser.email || '',
          displayName: authUser.displayName || 'User',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, name: string) => {
    const authUser = await firebaseService.register(email, password, name);
    setUser({
      uid: authUser.uid,
      email: authUser.email || '',
      displayName: authUser.displayName || name,
    });
  };

  const login = async (email: string, password: string) => {
    const authUser = await firebaseService.login(email, password);
    setUser({
      uid: authUser.uid,
      email: authUser.email || '',
      displayName: authUser.displayName || 'User',
    });
  };

  const logout = async () => {
    await firebaseService.logout();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await firebaseService.resetPassword(email);
  };

  return { user, loading, register, login, logout, resetPassword };
};
