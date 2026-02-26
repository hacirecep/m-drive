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
    return collection(db, APP_ID, userEmail, 'cars');
  },

  subscribeToCars(userEmail: string, userId: string, callback: (cars: any[]) => void) {
    const carCollection = this.getCarCollection(userEmail);
    
    try {
      const unsubscribe = onSnapshot(
        query(carCollection, orderBy('plaka')),
        (snapshot) => {
          const cars = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          const validCars = cars.filter(car => car.id && car.id.trim() !== '');
          callback(validCars);
        },
        (error) => {
          callback([]);
        }
      );
      
      return unsubscribe;
    } catch (error) {
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
    return updateDoc(doc(this.getCarCollection(userEmail), carId), updates);
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
};
