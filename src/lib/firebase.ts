import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  arrayUnion,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDDe7XsQAOvroglNVefSmrVmL_bw_DAC7s',
  authDomain: 'minicar-drive.firebaseapp.com',
  projectId: 'minicar-drive',
  storageBucket: 'minicar-drive.firebasestorage.app',
  messagingSenderId: '573798787590',
  appId: '1:573798787590:web:9ded356510397145ad3187',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const APP_ID = 'M-Drive';

export const firebaseService = {
  auth,
  db,
  APP_ID,

  onAuthStateChange(callback: (user: any) => void) {
    return onAuthStateChanged(auth, callback);
  },

  async register(email: string, password: string, displayName: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  },

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async logout() {
    return signOut(auth);
  },

  async resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  },

  getCarCollection(userEmail: string) {
    // Path: M-Drive (collection) -> email (document) -> cars (collection)
    // This creates 3 segments which is ODD and valid for Firestore
    // Format: collection → document → collection
    return collection(db, APP_ID, userEmail, 'cars');
  },

  // Old path for backwards compatibility during migration
  getOldCarCollection(userId: string) {
    return collection(db, 'artifacts', 'minicar-react-app', 'users', userId, 'cars');
  },

  subscribeToCars(userEmail: string, userId: string, callback: (cars: any[]) => void) {
    const newCarCollection = this.getCarCollection(userEmail);
    const oldCarCollection = this.getOldCarCollection(userId);
    
    console.log('📍 Firestore Path (New):', APP_ID, '/', userEmail, '/cars');
    console.log('📍 Firestore Path (Old - One-time migration check):', 'artifacts/minicar-react-app/users', userId, 'cars');
    
    let migrationChecked = false;
    
    try {
      // ONLY listen to the new path - it's the single source of truth
      const unsubscribeNew = onSnapshot(
        query(newCarCollection, orderBy('plaka')),
        (snapshot) => {
          const newCars = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          console.log('✅ New path cars:', newCars.length);
          
          // Filter out cars without proper IDs
          const validCars = newCars.filter(car => car.id && car.id.trim() !== '');
          
          // Always use new path data
          callback(validCars);
          
          // If new path is empty and we haven't checked migration yet, check old path ONCE
          if (validCars.length === 0 && !migrationChecked) {
            migrationChecked = true;
            console.log('🔍 New path empty, checking old path for migration data...');
            
            // One-time read from old collection
            getDocs(query(oldCarCollection))
              .then((oldSnapshot) => {
                const oldCars = oldSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));
                
                console.log('✅ Old path cars found:', oldCars.length);
                
                if (oldCars.length > 0) {
                  // Found data in old path - migrate to new path
                  console.log('🔄 Starting migration from old path to new path...');
                  oldCars.forEach(async (car: any) => {
                    const plaka = car.plaka;
                    if (plaka) {
                      try {
                        await setDoc(doc(newCarCollection, plaka), car);
                        console.log(`✅ Migrated car ${plaka}`);
                      } catch (err) {
                        console.error(`❌ Failed to migrate car ${plaka}:`, err);
                      }
                    }
                  });
                  
                  // Use old data temporarily while migration happens
                  const validOldCars = oldCars.filter((car: any) => car.id && car.id.trim() !== '');
                  if (validOldCars.length > 0) {
                    callback(validOldCars);
                  }
                }
              })
              .catch((error) => {
                console.error('❌ Old path error:', error.message);
              });
          }
        },
        (error) => {
          console.error('❌ New path listener error:', error.message, error.code);
          callback([]);
        }
      );
      
      return unsubscribeNew;
    } catch (error) {
      console.error('❌ Connection error:', error);
      callback([]);
      return () => {};
    }
  },

  async addCar(userEmail: string, carData: any) {
    // Use plaka (plate) as the document ID
    const plaka = carData.plaka;
    if (!plaka) throw new Error('Plaka (plate) is required');
    
    return setDoc(doc(this.getCarCollection(userEmail), plaka), {
      ...carData,
      durum: 'green',
      bakimlar: [],
      alerts: [],
      createdAt: new Date(),
    });
  },

  async updateCar(userEmail: string, carId: string, updates: any) {
    try {
      console.log('📝 Updating car:', carId, 'with:', Object.keys(updates));
      const result = await updateDoc(doc(this.getCarCollection(userEmail), carId), updates);
      console.log('✅ Car updated successfully');
      return result;
    } catch (error: any) {
      console.error('❌ Update hata:', error.message, error.code);
      throw error;
    }
  },

  async deleteCar(userEmail: string, carId: string) {
    return deleteDoc(doc(this.getCarCollection(userEmail), carId));
  },

  async addMaintenance(userEmail: string, carId: string, maintenance: any) {
    try {
      return await updateDoc(doc(this.getCarCollection(userEmail), carId), {
        bakimlar: arrayUnion(maintenance),
      });
    } catch (error: any) {
      if (error.code === 'not-found') {
        // Document doesn't exist, create it with the maintenance
        return await setDoc(doc(this.getCarCollection(userEmail), carId), {
          bakimlar: [maintenance],
        }, { merge: true });
      }
      throw error;
    }
  },

  async updateMaintenance(userEmail: string, carId: string, maintenanceIndex: number, maintenance: any) {
    const carDoc = await getDocs(query(this.getCarCollection(userEmail)));
    const car = carDoc.docs.find((doc) => doc.id === carId)?.data();
    if (car && car.bakimlar) {
      const updatedBakimlar = [...car.bakimlar];
      updatedBakimlar[maintenanceIndex] = maintenance;
      return updateDoc(doc(this.getCarCollection(userEmail), carId), {
        bakimlar: updatedBakimlar,
      });
    }
  },

  async deleteMaintenance(userEmail: string, carId: string, maintenanceIndex: number) {
    const carDoc = await getDocs(query(this.getCarCollection(userEmail)));
    const car = carDoc.docs.find((doc) => doc.id === carId)?.data();
    if (car && car.bakimlar) {
      const updatedBakimlar = car.bakimlar.filter((_: any, index: number) => index !== maintenanceIndex);
      return updateDoc(doc(this.getCarCollection(userEmail), carId), {
        bakimlar: updatedBakimlar,
      });
    }
  },
};
