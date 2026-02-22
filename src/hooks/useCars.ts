import { useState, useEffect } from 'react';
import { firebaseService } from '../lib/firebase';
import { Car } from '../types';

export const useCars = (userEmail: string | null, userId: string | null) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail || !userId) {
      setCars([]);
      setLoading(false);
      return;
    }

    const unsubscribe = firebaseService.subscribeToCars(userEmail, userId, (fetchedCars) => {
      setCars(fetchedCars);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userEmail, userId]);

  const addCar = async (carData: Omit<Car, 'id' | 'durum' | 'bakimlar'>) => {
    if (!userEmail) throw new Error('User not authenticated');
    return firebaseService.addCar(userEmail, carData);
  };

  const updateCar = async (carId: string, updates: Partial<Car>) => {
    if (!userEmail) throw new Error('User not authenticated');
    return firebaseService.updateCar(userEmail, carId, updates);
  };

  const deleteCar = async (carId: string) => {
    if (!userEmail) throw new Error('User not authenticated');
    return firebaseService.deleteCar(userEmail, carId);
  };

  return { cars, loading, addCar, updateCar, deleteCar };
};
