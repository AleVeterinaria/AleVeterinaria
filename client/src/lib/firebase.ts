import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Verificar que todas las credenciales estén configuradas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  console.error('Firebase credentials missing:', {
    apiKey: firebaseConfig.apiKey ? 'present' : 'missing',
    projectId: firebaseConfig.projectId ? 'present' : 'missing',
    appId: firebaseConfig.appId ? 'present' : 'missing'
  });
  throw new Error('Firebase credentials are not properly configured. Please check your environment variables.');
}

console.log('Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
});

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Test Firebase connection
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('Firebase Auth: Usuario autenticado', user.uid);
  } else {
    console.log('Firebase Auth: No hay usuario autenticado');
  }
});

// Test function to verify Firebase is working
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    console.log('Auth object:', auth);
    console.log('Current user:', auth.currentUser);
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};

// Auth functions
export const signInUser = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in user:', email);
    
    // Add a small delay to ensure auth state is properly handled
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Sign in successful:', result.user?.uid);
    
    // Wait for auth state to settle before returning
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return result;
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      throw new Error('No existe una cuenta con este email. Verifica que el usuario esté registrado.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Contraseña incorrecta. Verifica tus credenciales.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Email inválido. Verifica el formato del email.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Error de red. Verifica tu conexión a internet.');
    }
    
    throw error;
  }
};

export const createUser = async (email: string, password: string) => {
  try {
    console.log('Creating new user:', email);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User creation successful:', result.user?.uid);
    return result;
  } catch (error: any) {
    console.error('User creation error:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Ya existe una cuenta con este email.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }
    
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('Sign out successful');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user ? user.uid : 'No user');
    callback(user);
  });
};



// Firestore database functions for pets, medical records, etc.
export const createPet = async (petData: any) => {
  const docRef = await addDoc(collection(db, 'pets'), petData);
  return docRef.id;
};

export const getPetsByOwner = async (ownerId: string) => {
  const q = query(collection(db, 'pets'), where('ownerId', '==', ownerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createMedicalRecord = async (recordData: any) => {
  const docRef = await addDoc(collection(db, 'medicalRecords'), recordData);
  return docRef.id;
};

export const getMedicalRecordsByPet = async (petId: string) => {
  const q = query(collection(db, 'medicalRecords'), where('petId', '==', petId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createVaccination = async (vaccinationData: any) => {
  const docRef = await addDoc(collection(db, 'vaccinations'), vaccinationData);
  return docRef.id;
};

export const getVaccinationsByPet = async (petId: string) => {
  const q = query(collection(db, 'vaccinations'), where('petId', '==', petId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createDeworming = async (dewormingData: any) => {
  const docRef = await addDoc(collection(db, 'dewormings'), dewormingData);
  return docRef.id;
};

export const getDewormingsByPet = async (petId: string) => {
  const q = query(collection(db, 'dewormings'), where('petId', '==', petId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// User profile functions
export const createUserProfile = async (userId: string, profileData: any) => {
  try {
    await setDoc(doc(db, 'users', userId), profileData);
    console.log('User profile created successfully');
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, profileData);
};

// Firestore functions
export const createDocument = async (collectionName: string, data: any, docId?: string) => {
  if (docId) {
    await setDoc(doc(db, collectionName, docId), data, { merge: true });
    return docId;
  } else {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  }
};

export const getDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getDocuments = async (collectionName: string, whereField?: string, whereOperator?: any, whereValue?: any) => {
  let q;
  if (whereField && whereOperator && whereValue) {
    q = query(collection(db, collectionName), where(whereField, whereOperator, whereValue));
  } else {
    q = query(collection(db, collectionName));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const deleteFile = async (path: string) => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};
