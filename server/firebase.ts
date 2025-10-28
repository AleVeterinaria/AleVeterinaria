// Firebase configuration for server-side use
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firebase functions for server-side use based on HTML structure
export const getAllPatients = async () => {
  try {
    const q = query(collection(db, 'patients'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting patients from Firebase:', error);
    return [];
  }
};

export const getPatientById = async (patientId: string) => {
  try {
    const docRef = doc(db, 'patients', patientId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting patient from Firebase:', error);
    return null;
  }
};

export const searchPatients = async (searchTerm: string) => {
  try {
    // Get all patients and filter them (in production, implement proper search)
    const patients = await getAllPatients();
    const filtered = patients.filter((patient: any) => {
      const term = searchTerm.toLowerCase();
      return patient.name?.toLowerCase().includes(term) ||
             patient.id?.toString().includes(term) ||
             patient.tutorName?.toLowerCase().includes(term) ||
             patient.tutorRut?.includes(searchTerm.replace(/[.-]/g, ''));
    });
    return filtered;
  } catch (error) {
    console.error('Error searching patients:', error);
    return [];
  }
};

export const searchPatientsByRecord = async (recordNumber: string) => {
  try {
    // Get all patients and filter by record number
    const patients = await getAllPatients();
    const filtered = patients.filter((patient: any) => 
      patient.recordNumber?.toString() === recordNumber ||
      patient.id?.toString() === recordNumber
    );
    return filtered;
  } catch (error) {
    console.error('Error searching patients by record number:', error);
    return [];
  }
};

export const getPetsByOwner = async (ownerId: string) => {
  try {
    // For compatibility with existing code, return patients collection
    return await getAllPatients();
  } catch (error) {
    console.error('Error getting pets from Firebase:', error);
    return [];
  }
};

export const getVaccinationsByPet = async (petId: string) => {
  try {
    console.log('Getting Firebase vaccinations for pet:', petId);
    
    // Get all vaccines from subcollection without initial ordering to avoid field errors
    const vaccinesRef = collection(db, 'patients', petId, 'vaccines');
    const querySnapshot = await getDocs(vaccinesRef);
    
    const vaccinations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by applicationDate (new format) or date (old format) if available
    vaccinations.sort((a: any, b: any) => {
      const dateA = new Date(a.applicationDate || a.date || a.createdAt || 0);
      const dateB = new Date(b.applicationDate || b.date || b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log('Firebase vaccinations found:', vaccinations.length);
    if (vaccinations.length > 0) {
      console.log('Sample vaccination record:', vaccinations[0]);
    }
    
    return vaccinations;
  } catch (error) {
    console.error('Error getting vaccinations from Firebase:', error);
    return [];
  }
};

export const getDewormingsByPet = async (petId: string) => {
  try {
    console.log('Getting Firebase dewormings for pet:', petId);
    console.log('Collection path:', `patients/${petId}/dewormings`);
    
    const dewormingsRef = collection(db, 'patients', petId, 'dewormings');
    
    // Try without ordering first to see if we can get any records
    const querySnapshot = await getDocs(dewormingsRef);
    
    console.log('Query snapshot size:', querySnapshot.size);
    console.log('Query snapshot empty:', querySnapshot.empty);
    
    const dewormings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by applicationDate or createdAt if available
    dewormings.sort((a: any, b: any) => {
      const dateA = new Date(a.applicationDate || a.createdAt || 0);
      const dateB = new Date(b.applicationDate || b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log('Firebase dewormings found:', dewormings.length);
    if (dewormings.length > 0) {
      console.log('Sample deworming record:', dewormings[0]);
    }
    return dewormings;
  } catch (error) {
    console.error('Error getting dewormings from Firebase:', error);
    return [];
  }
};

export const getMedicalRecordsByPet = async (petId: string) => {
  try {
    // Get consultations from subcollection like in HTML structure
    const q = query(collection(db, 'patients', petId, 'consultations'), orderBy('savedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting medical records from Firebase:', error);
    return [];
  }
};

export const createPatient = async (patientData: any) => {
  try {
    // Create patient with auto-incrementing ID like in HTML structure
    const counterRef = doc(db, 'counters', 'patientCounter');
    const counterSnap = await getDoc(counterRef);
    const lastNumber = counterSnap.exists() ? counterSnap.data()?.lastNumber || 0 : 0;
    const newNumber = lastNumber + 1;
    const patientId = String(newNumber);
    
    // Add creation timestamp and format data like HTML structure
    const formattedData = {
      ...patientData,
      name: patientData.petName?.toLowerCase() || patientData.name?.toLowerCase() || '',
      tutorRut: patientData.tutorRut?.replace(/[.-]/g, ''),
      sex: patientData.sex?.toLowerCase() || 'unknown',
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };
    
    // Set document with specific ID and update counter
    await setDoc(doc(db, 'patients', patientId), formattedData);
    await setDoc(counterRef, { lastNumber: newNumber });
    
    return patientId;
  } catch (error) {
    console.error('Error creating patient in Firebase:', error);
    throw error;
  }
};

export const createPet = async (petData: any) => {
  // Alias for compatibility
  return await createPatient(petData);
};

export const createVaccination = async (vaccinationData: any) => {
  try {
    // Create in subcollection like HTML structure
    const { petId, ...data } = vaccinationData;
    const docRef = await addDoc(collection(db, 'patients', petId, 'vaccines'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating vaccination in Firebase:', error);
    throw error;
  }
};

export const createDeworming = async (dewormingData: any) => {
  try {
    // Create in subcollection like HTML structure
    const { petId, ...data } = dewormingData;
    const docRef = await addDoc(collection(db, 'patients', petId, 'dewormings'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating deworming in Firebase:', error);
    throw error;
  }
};

export const createMedicalRecord = async (recordData: any) => {
  try {
    // Create in subcollection like HTML structure
    const { petId, ...data } = recordData;
    const docRef = await addDoc(collection(db, 'patients', petId, 'consultations'), {
      ...data,
      savedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating medical record in Firebase:', error);
    throw error;
  }
};

export const createPrescription = async (prescriptionData: any) => {
  try {
    // Create prescription in subcollection
    const { petId, ...data } = prescriptionData;
    const docRef = await addDoc(collection(db, 'patients', petId, 'prescriptions'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating prescription in Firebase:', error);
    throw error;
  }
};

export const createCertificate = async (certificateData: any) => {
  try {
    // Create certificate in subcollection
    const { petId, ...data } = certificateData;
    const docRef = await addDoc(collection(db, 'patients', petId, 'certificates'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating certificate in Firebase:', error);
    throw error;
  }
};

export const getPrescriptionsByPet = async (petId: string) => {
  try {
    console.log('Getting Firebase prescriptions for pet:', petId);
    const prescriptionsRef = collection(db, 'patients', petId, 'prescriptions');
    const q = query(prescriptionsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const prescriptions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Firebase prescriptions found:', prescriptions.length);
    return prescriptions;
  } catch (error) {
    console.error('Error getting prescriptions from Firebase:', error);
    return [];
  }
};

export const getCertificatesByPet = async (petId: string) => {
  try {
    console.log('Getting Firebase certificates for pet:', petId);
    const certificatesRef = collection(db, 'patients', petId, 'certificates');
    const q = query(certificatesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const certificates = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Firebase certificates found:', certificates.length);
    return certificates;
  } catch (error) {
    console.error('Error getting certificates from Firebase:', error);
    return [];
  }
};



export const updatePatient = async (patientId: string, updateData: any) => {
  try {
    console.log('Updating Firebase patient:', patientId, updateData);
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, {
      ...updateData,
      lastUpdated: serverTimestamp()
    });
    console.log('Patient updated successfully');
  } catch (error) {
    console.error('Error updating patient in Firebase:', error);
    throw error;
  }
};

// Delete functions for all record types
export async function deletePrescription(prescriptionId: string): Promise<boolean> {
  try {
    const patientsRef = collection(db, 'patients');
    const patientsSnapshot = await getDocs(patientsRef);
    
    for (const patientDoc of patientsSnapshot.docs) {
      const prescriptionRef = doc(db, `patients/${patientDoc.id}/prescriptions/${prescriptionId}`);
      const prescriptionDoc = await getDoc(prescriptionRef);
      
      if (prescriptionDoc.exists()) {
        await deleteDoc(prescriptionRef);
        console.log('Prescription deleted successfully:', prescriptionId);
        return true;
      }
    }
    
    console.log('Prescription not found:', prescriptionId);
    return false;
  } catch (error) {
    console.error('Error deleting prescription:', error);
    throw error;
  }
}

export async function deleteVaccination(vaccinationId: string): Promise<boolean> {
  try {
    console.log('Starting vaccination deletion for ID:', vaccinationId);
    const patientsRef = collection(db, 'patients');
    const patientsSnapshot = await getDocs(patientsRef);
    
    console.log(`Searching through ${patientsSnapshot.docs.length} patients for vaccination ${vaccinationId}`);
    
    for (const patientDoc of patientsSnapshot.docs) {
      console.log(`Checking patient: ${patientDoc.id}`);
      
      // Try both 'vaccines' (from createVaccination) and 'vaccinations' (legacy)
      const vaccinationsSubcollections = ['vaccines', 'vaccinations'];
      
      for (const subcollectionName of vaccinationsSubcollections) {
        const vaccinationsRef = collection(db, `patients/${patientDoc.id}/${subcollectionName}`);
        const vaccinationsSnapshot = await getDocs(vaccinationsRef);
        
        console.log(`Patient ${patientDoc.id} has ${vaccinationsSnapshot.docs.length} items in ${subcollectionName}`);
        
        for (const vaccinationDoc of vaccinationsSnapshot.docs) {
          console.log(`Found vaccination with ID: ${vaccinationDoc.id} in ${subcollectionName}`);
          if (vaccinationDoc.id === vaccinationId) {
            console.log(`Match found! Deleting vaccination ${vaccinationId} from patient ${patientDoc.id}/${subcollectionName}`);
            await deleteDoc(vaccinationDoc.ref);
            console.log('Vaccination deleted successfully:', vaccinationId);
            return true;
          }
        }
      }
    }
    
    console.log('Vaccination not found after searching all patients and subcollections:', vaccinationId);
    return false;
  } catch (error) {
    console.error('Error deleting vaccination:', error);
    throw error;
  }
}

export async function deleteDeworming(dewormingId: string): Promise<boolean> {
  try {
    const patientsRef = collection(db, 'patients');
    const patientsSnapshot = await getDocs(patientsRef);
    
    for (const patientDoc of patientsSnapshot.docs) {
      const dewormingRef = doc(db, `patients/${patientDoc.id}/dewormings/${dewormingId}`);
      const dewormingDoc = await getDoc(dewormingRef);
      
      if (dewormingDoc.exists()) {
        await deleteDoc(dewormingRef);
        console.log('Deworming deleted successfully:', dewormingId);
        return true;
      }
    }
    
    console.log('Deworming not found:', dewormingId);
    return false;
  } catch (error) {
    console.error('Error deleting deworming:', error);
    throw error;
  }
}

export async function deleteCertificate(certificateId: string): Promise<boolean> {
  try {
    console.log('=== DEBUGGING CERTIFICATE DELETION ===');
    console.log('Attempting to delete certificate:', certificateId);
    
    // Certificates are stored in patients/{petId}/certificates/ according to createCertificate function
    const patientsRef = collection(db, 'patients');
    const patientsSnapshot = await getDocs(patientsRef);
    
    console.log(`Found ${patientsSnapshot.size} patient documents`);
    for (const patientDoc of patientsSnapshot.docs) {
      console.log(`Checking patient ${patientDoc.id} for certificate ${certificateId}`);
      
      // List all certificates for this patient to debug
      try {
        const certificatesCollRef = collection(db, `patients/${patientDoc.id}/certificates`);
        const certificatesSnapshot = await getDocs(certificatesCollRef);
        console.log(`Patient ${patientDoc.id} has ${certificatesSnapshot.size} certificates`);
        
        certificatesSnapshot.forEach(cert => {
          console.log(`- Certificate ID: ${cert.id}, data:`, cert.data());
        });
      } catch (err) {
        console.log(`Error listing certificates for patient ${patientDoc.id}:`, err);
      }
      
      // Try to delete the specific certificate
      const certificateRef = doc(db, `patients/${patientDoc.id}/certificates/${certificateId}`);
      const certificateDoc = await getDoc(certificateRef);
      
      if (certificateDoc.exists()) {
        console.log('Found certificate in patient subcollection!');
        await deleteDoc(certificateRef);
        console.log('Certificate deleted successfully:', certificateId);
        return true;
      }
    }
    
    console.log('=== CERTIFICATE NOT FOUND ANYWHERE ===');
    console.log('Certificate ID:', certificateId);
    return false;
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
}

export async function deleteQuestionnaire(questionnaireId: string): Promise<boolean> {
  try {
    console.log('=== DEBUGGING QUESTIONNAIRE DELETION ===');
    console.log('Attempting to delete questionnaire:', questionnaireId);
    
    // Let's debug where questionnaires are actually stored
    console.log('Checking all possible locations for questionnaire...');
    
    // First, try to find questionnaire in the main questionnaires collection
    console.log('Checking main questionnaires collection...');
    const questionnaireRef = doc(db, `questionnaires/${questionnaireId}`);
    const questionnaireDoc = await getDoc(questionnaireRef);
    
    if (questionnaireDoc.exists()) {
      console.log('Found in main questionnaires collection!');
      await deleteDoc(questionnaireRef);
      console.log('Questionnaire deleted successfully from main collection:', questionnaireId);
      return true;
    } else {
      console.log('Not found in main questionnaires collection');
    }
    
    // Search in patient subcollections
    console.log('Checking patient subcollections...');
    const patientsRef = collection(db, 'patients');
    const patientsSnapshot = await getDocs(patientsRef);
    
    console.log(`Found ${patientsSnapshot.size} patient documents`);
    for (const patientDoc of patientsSnapshot.docs) {
      console.log(`Checking patient ${patientDoc.id} for questionnaire ${questionnaireId}`);
      
      // Check subcollection path
      const patientQuestionnaireRef = doc(db, `patients/${patientDoc.id}/questionnaires/${questionnaireId}`);
      const patientQuestionnaireDoc = await getDoc(patientQuestionnaireRef);
      
      if (patientQuestionnaireDoc.exists()) {
        console.log('Found in patient subcollection!');
        await deleteDoc(patientQuestionnaireRef);
        console.log('Questionnaire deleted successfully from patient subcollection:', questionnaireId);
        return true;
      }
      
      // Also check if questionnaires are stored differently
      try {
        const questionnaireCollRef = collection(db, `patients/${patientDoc.id}/questionnaires`);
        const questionnaireSnapshot = await getDocs(questionnaireCollRef);
        console.log(`Patient ${patientDoc.id} has ${questionnaireSnapshot.size} questionnaires`);
        
        questionnaireSnapshot.forEach(q => {
          console.log(`- Questionnaire ID: ${q.id}, data:`, q.data());
        });
      } catch (err) {
        console.log(`Error listing questionnaires for patient ${patientDoc.id}:`, err);
      }
    }
    
    // Also try searching in pre-visit questionnaires collection
    console.log('Checking pre-visit questionnaires collection...');
    try {
      const preVisitRef = doc(db, `preVisitQuestionnaires/${questionnaireId}`);
      const preVisitDoc = await getDoc(preVisitRef);
      
      if (preVisitDoc.exists()) {
        console.log('Found in pre-visit collection!');
        await deleteDoc(preVisitRef);
        console.log('Questionnaire deleted successfully from pre-visit collection:', questionnaireId);
        return true;
      } else {
        console.log('Not found in pre-visit collection');
      }
    } catch (preVisitError) {
      console.log('Error checking pre-visit questionnaires:', preVisitError);
    }
    
    console.log('=== QUESTIONNAIRE NOT FOUND ANYWHERE ===');
    console.log('Questionnaire ID:', questionnaireId);
    return false;
  } catch (error) {
    console.error('Error deleting questionnaire:', error);
    throw error;
  }
}

export async function deleteMedicalRecord(recordId: string): Promise<boolean> {
  try {
    console.log('=== DEBUGGING MEDICAL RECORD DELETION ===');
    console.log('Attempting to delete medical record:', recordId);
    
    // Medical records are stored in patients/{petId}/consultations/ according to the code
    const patientsRef = collection(db, 'patients');
    const patientsSnapshot = await getDocs(patientsRef);
    
    console.log(`Found ${patientsSnapshot.size} patient documents`);
    for (const patientDoc of patientsSnapshot.docs) {
      console.log(`Checking patient ${patientDoc.id} for medical record ${recordId}`);
      
      // Check in consultations subcollection (where they're actually stored)
      const consultationRef = doc(db, `patients/${patientDoc.id}/consultations/${recordId}`);
      const consultationDoc = await getDoc(consultationRef);
      
      if (consultationDoc.exists()) {
        console.log('Found medical record in consultations subcollection!');
        await deleteDoc(consultationRef);
        console.log('Medical record deleted successfully from consultations:', recordId);
        return true;
      }
      
      // Also try medicalRecords subcollection as backup
      const medicalRecordRef = doc(db, `patients/${patientDoc.id}/medicalRecords/${recordId}`);
      const medicalRecordDoc = await getDoc(medicalRecordRef);
      
      if (medicalRecordDoc.exists()) {
        console.log('Found medical record in medicalRecords subcollection!');
        await deleteDoc(medicalRecordRef);
        console.log('Medical record deleted successfully from medicalRecords:', recordId);
        return true;
      }
    }
    
    console.log('=== MEDICAL RECORD NOT FOUND ANYWHERE ===');
    console.log('Medical record ID:', recordId);
    return false;
  } catch (error) {
    console.error('Error deleting medical record:', error);
    throw error;
  }
}

export async function deleteExamOrder(examOrderId: string): Promise<boolean> {
  try {
    const patientsRef = collection(db, 'patients');
    const patientsSnapshot = await getDocs(patientsRef);
    
    for (const patientDoc of patientsSnapshot.docs) {
      const examOrderRef = doc(db, `patients/${patientDoc.id}/examOrders/${examOrderId}`);
      const examOrderDoc = await getDoc(examOrderRef);
      
      if (examOrderDoc.exists()) {
        await deleteDoc(examOrderRef);
        console.log('Exam order deleted successfully:', examOrderId);
        return true;
      }
    }
    
    console.log('Exam order not found:', examOrderId);
    return false;
  } catch (error) {
    console.error('Error deleting exam order:', error);
    throw error;
  }
}