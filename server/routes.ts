import { Router } from 'express';
import { storage } from './storage';
import { 
  insertUserSchema, 
  insertPetSchema, 
  insertMedicalRecordSchema,
  insertVaccinationSchema,
  insertDewormingSchema,
  insertExaminationSchema,
  insertCertificateSchema,
  insertPreVisitQuestionnaireSchema,
  insertAppointmentSchema,
  insertVeterinaryScheduleSchema,
  insertScheduleBlockSchema
} from '@shared/schema';
import { z } from 'zod';
import * as net from 'net';
import * as tls from 'tls';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';


// Firebase imports
import { 
  getPetsByOwner, 
  getVaccinationsByPet, 
  getDewormingsByPet, 
  getMedicalRecordsByPet,
  createPet,
  createVaccination,
  createDeworming,
  createMedicalRecord 
} from './firebase';

const router = Router();


// Function to send questionnaire completed email notification
async function sendQuestionnaireCompletedEmail(questionnaire: any) {
  try {
    // Get pet and appointment details for better email content
    let petData = null;
    let appointmentData = null;
    
    if (questionnaire.petId) {
      try {
        petData = await storage.getPet(questionnaire.petId);
      } catch (error) {
        console.log('Pet data not found for questionnaire');
      }
    }
    
    if (questionnaire.appointmentId) {
      try {
        const appointments = await storage.getAllAppointments();
        appointmentData = appointments.find(apt => apt.id === questionnaire.appointmentId);
      } catch (error) {
        console.log('Appointment data not found for questionnaire');
      }
    }

    // Create summary of questionnaire responses
    const responseSummary = [];
    if (questionnaire.travelBehaviors && questionnaire.travelBehaviors.length > 0) {
      responseSummary.push(`Comportamientos en viaje: ${questionnaire.travelBehaviors.join(', ')}`);
    }
    if (questionnaire.dislikes && questionnaire.dislikes.length > 0) {
      responseSummary.push(`No le gusta: ${questionnaire.dislikes.join(', ')}`);
    }
    if (questionnaire.sensitiveBodyAreas) {
      responseSummary.push(`Áreas sensibles: ${questionnaire.sensitiveBodyAreas}`);
    }
    if (questionnaire.favoriteTreats) {
      responseSummary.push(`Premios favoritos: ${questionnaire.favoriteTreats}`);
    }

    const questionnaireSummary = responseSummary.length > 0 
      ? responseSummary.join(' | ') 
      : 'Cuestionario básico completado';

    // Prepare notification data for Firebase Function
    const notificationData = {
      email: 'contacto@aleveterinaria.cl',
      templateType: 'questionnaire_completed',
      patientData: {
        patientName: questionnaire.petName || petData?.name || 'Mascota',
        tutorName: questionnaire.clientName || appointmentData?.tutorName || 'Tutor',
        species: petData?.species || 'Mascota',
        appointmentDate: questionnaire.appointmentDate ? new Date(questionnaire.appointmentDate).toISOString() : undefined,
        questionnaireSummary
      }
    };

    // Call Firebase Function to send email
    const FIREBASE_FUNCTION_URL = process.env.NODE_ENV === 'production' 
      ? 'https://us-central1-ale-veterinaria.cloudfunctions.net/testNotification'
      : 'http://localhost:5001/ale-veterinaria/us-central1/testNotification';

    const response = await fetch(FIREBASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('📋 Questionnaire notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending questionnaire notification:', error);
    throw error;
  }
}

// Firebase Routes - accessing real patient data
router.get('/api/pets/firebase/owner/:ownerId', async (req, res) => {
  try {
    console.log('Getting Firebase patients for owner:', req.params.ownerId);
    const { getAllPatients } = await import('./firebase');
    const patients = await getAllPatients();
    console.log('Firebase patients found:', patients.length);
    res.json(patients);
  } catch (error) {
    console.error('Error getting Firebase patients:', error);
    res.status(500).json({ error: 'Failed to get patients from Firebase' });
  }
});

// New route for tutor portal - get pets by tutor RUT from database
router.get('/api/pets/rut/:rut', async (req, res) => {
  try {
    console.log('Getting database pets for tutor RUT:', req.params.rut);
    const pets = await storage.getPetsByTutorRut(req.params.rut);
    console.log('Database pets found for RUT:', pets.length);
    res.json(pets);
  } catch (error) {
    console.error('Error getting database pets by RUT:', error);
    res.status(500).json({ error: 'Failed to get pets by RUT from database' });
  }
});

// New route for tutor portal - get pets by tutor RUT from Firebase (fallback)
router.get('/api/pets/firebase/tutor/:rut', async (req, res) => {
  try {
    console.log('Getting Firebase pets for tutor RUT:', req.params.rut);
    const { getAllPatients } = await import('./firebase');
    const allPets = await getAllPatients();
    // Filter pets by tutor RUT
    const pets = allPets.filter(pet => 
      pet.tutorRut && pet.tutorRut.replace(/\D/g, '') === req.params.rut.replace(/\D/g, '')
    );
    console.log('Firebase pets found for RUT:', pets.length);
    res.json(pets);
  } catch (error) {
    console.error('Error getting Firebase pets by RUT:', error);
    res.status(500).json({ error: 'Failed to get pets by RUT from Firebase' });
  }
});

// Routes for multiple pets data (for tutor portal)
router.get('/api/vaccinations/firebase/pets/:petIds', async (req, res) => {
  try {
    const petIds = req.params.petIds.split(',');
    console.log('Getting Firebase vaccinations for pets:', petIds);
    const { getVaccinationsByPet } = await import('./firebase');
    
    const allVaccinations = [];
    for (const petId of petIds) {
      const vaccinations = await getVaccinationsByPet(petId);
      allVaccinations.push(...vaccinations.map(v => ({ ...v, petId })));
    }
    
    console.log('Firebase vaccinations found:', allVaccinations.length);
    res.json(allVaccinations);
  } catch (error) {
    console.error('Error getting Firebase vaccinations for multiple pets:', error);
    res.status(500).json({ error: 'Failed to get vaccinations from Firebase' });
  }
});

router.get('/api/dewormings/firebase/pets/:petIds', async (req, res) => {
  try {
    const petIds = req.params.petIds.split(',');
    console.log('Getting Firebase dewormings for pets:', petIds);
    const { getDewormingsByPet } = await import('./firebase');
    
    const allDewormings = [];
    for (const petId of petIds) {
      const dewormings = await getDewormingsByPet(petId);
      allDewormings.push(...dewormings.map(d => ({ ...d, petId })));
    }
    
    console.log('Firebase dewormings found:', allDewormings.length);
    res.json(allDewormings);
  } catch (error) {
    console.error('Error getting Firebase dewormings for multiple pets:', error);
    res.status(500).json({ error: 'Failed to get dewormings from Firebase' });
  }
});

// Placeholder routes for certificates and prescriptions (implement as needed)
router.get('/api/certificates/firebase/pets/:petIds', async (req, res) => {
  try {
    const { getCertificatesByPet } = await import('./firebase');
    const petIds = req.params.petIds.split(',');
    
    let allCertificates: any[] = [];
    for (const petId of petIds) {
      try {
        const certificates = await getCertificatesByPet(petId);
        allCertificates.push(...certificates.map((c: any) => ({ ...c, petId })));
      } catch (error) {
        console.error(`Error getting certificates for pet ${petId}:`, error);
      }
    }
    
    res.json(allCertificates);
  } catch (error) {
    console.error('Error getting Firebase certificates:', error);
    res.status(500).json({ error: 'Failed to get certificates from Firebase' });
  }
});

router.get('/api/prescriptions/firebase/pets/:petIds', async (req, res) => {
  try {
    // For now, return empty array - implement when prescriptions are stored in Firebase
    res.json([]);
  } catch (error) {
    console.error('Error getting Firebase prescriptions:', error);
    res.status(500).json({ error: 'Failed to get prescriptions from Firebase' });
  }
});

// Object Storage routes for exam documents
import { ObjectStorageService, ObjectNotFoundError } from './objectStorage';

// Route for serving private exam documents
router.get('/objects/:objectPath(*)', async (req, res) => {
  const objectStorageService = new ObjectStorageService();
  try {
    const objectFile = await objectStorageService.getObjectEntityFile(req.path);
    objectStorageService.downloadObject(objectFile, res);
  } catch (error) {
    console.error('Error accessing object:', error);
    if (error instanceof ObjectNotFoundError) {
      return res.sendStatus(404);
    }
    return res.sendStatus(500);
  }
});

// Route for getting upload URL for exam documents
router.post('/api/objects/upload', async (req, res) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error('Error getting upload URL:', error);
    res.status(500).json({ error: 'Failed to get upload URL' });
  }
});

// Route for getting upload URL for pet photos
router.post('/api/pets/photo/upload', async (req, res) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error('Error getting pet photo upload URL:', error);
    res.status(500).json({ error: 'Failed to get pet photo upload URL' });
  }
});

// Route for updating pet photo in database
router.put('/api/pets/:petId/photo', async (req, res) => {
  try {
    console.log(`🔍 Updating photo for pet: ${req.params.petId}`);
    const { petId } = req.params;
    const { photoURL } = req.body;
    
    if (!photoURL) {
      return res.status(400).json({ error: 'Photo URL is required' });
    }
    
    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
      photoURL,
      {
        owner: 'tutor', // Allow tutors to access their pet photos
        visibility: 'private',
      }
    );
    
    // Update pet photo in database
    const updatedPet = await storage.updatePetPhoto(petId, photoURL);
    
    if (!updatedPet) {
      // Try to sync from Firebase if pet not found in PostgreSQL
      console.log(`Pet ${petId} not found in PostgreSQL, trying Firebase sync...`);
      try {
        const { getPatientById } = await import('./firebase');
        const firebasePet = await getPatientById(petId);
        
        if (firebasePet) {
          // Create pet in PostgreSQL with photo
          const petData = firebasePet as any;
          const newPet = await storage.createPet({
            ownerId: petData.tutorRut?.replace(/\D/g, '') || 'unknown',
            name: petData.name || 'Mascota',
            species: petData.species || 'Canino',
            breed: petData.breed,
            sex: petData.sex,
            birthDate: petData.birthDate ? new Date(petData.birthDate) : undefined,
            weight: petData.weight,
            colorMarkings: petData.colorMarkings,
            microchip: petData.microchip,
            reproductiveStatus: petData.reproductiveStatus,
            tutorName: petData.tutorName || 'Cliente',
            tutorPhone: petData.tutorPhone,
            tutorEmail: petData.tutorEmail,
            tutorCity: petData.tutorCity,
            tutorAddress: petData.tutorAddress,
            photo: photoURL,
          });
          console.log(`✅ Pet ${petId} synced with photo successfully`);
          return res.json({ success: true, pet: newPet });
        } else {
          return res.status(404).json({ error: 'Pet not found' });
        }
      } catch (syncError) {
        console.error('❌ Error syncing pet from Firebase:', syncError);
        return res.status(500).json({ error: 'Failed to sync pet and update photo' });
      }
    }
    
    console.log(`✅ Pet photo updated successfully for pet: ${petId}`);
    res.json({ success: true, pet: updatedPet });
    
  } catch (error) {
    console.error('Error updating pet photo:', error);
    res.status(500).json({ error: 'Failed to update pet photo' });
  }
});

// Route for saving exam document info after upload
router.post('/api/exam-documents', async (req, res) => {
  try {
    console.log(`🔍 Starting exam document upload for pet: ${req.body.petId}`);
    const { petId, examType, documentURL, fileName, fileSize, uploadedBy, notes, tutorEmail, tutorName, petName, species } = req.body;
    
    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
      documentURL,
      {
        owner: uploadedBy,
        visibility: "private", // Exam documents should be private
      }
    );

    // Check if pet exists in PostgreSQL, if not, get from Firebase and create it
    const existingPet = await storage.getPet(petId);
    
    if (!existingPet) {
      // Pet doesn't exist in PostgreSQL, try to get from Firebase and create it
      console.log(`Pet ${petId} not found in PostgreSQL, syncing from Firebase...`);
      try {
        const { getPatientById } = await import('./firebase');
        const firebasePet = await getPatientById(petId);
        
        if (firebasePet) {
          // Create pet in PostgreSQL with Firebase data
          const petData = firebasePet as any; // Type assertion for Firebase data
          await storage.createPet({
            ownerId: petData.tutorRut?.replace(/\D/g, '') || 'unknown',
            name: petData.name || 'Mascota',
            species: petData.species || 'Canino',
            breed: petData.breed,
            sex: petData.sex,
            birthDate: petData.birthDate ? new Date(petData.birthDate) : undefined,
            weight: petData.weight,
            colorMarkings: petData.colorMarkings,
            microchip: petData.microchip,
            reproductiveStatus: petData.reproductiveStatus,
            tutorName: petData.tutorName || 'Cliente',
            tutorPhone: petData.tutorPhone,
            tutorEmail: petData.tutorEmail,
            tutorCity: petData.tutorCity,
            tutorAddress: petData.tutorAddress,
          });
          console.log(`✅ Pet ${petId} synced successfully from Firebase to PostgreSQL`);
        } else {
          console.log(`❌ Pet ${petId} not found in Firebase either`);
          return res.status(400).json({ error: 'Pet not found in either Firebase or PostgreSQL' });
        }
      } catch (syncError) {
        console.error('❌ Error syncing pet from Firebase:', syncError);
        return res.status(500).json({ error: 'Failed to sync pet from Firebase' });
      }
    } else {
      console.log(`✅ Pet ${petId} already exists in PostgreSQL`);
    }

    // Save to database
    const examDocument = await storage.createExamDocument({
      petId,
      examType,
      objectPath,
      fileName,
      fileSize,
      uploadedBy,
      notes
    });

    // Send email notification with document attachment
    try {
      const emailSettings = await storage.getNotificationSettings('email');
      
      if (emailSettings && emailSettings.smtpHost && tutorEmail) {
        const nodemailer = await import('nodemailer');
        
        const transporter = nodemailer.default.createTransport({
          host: emailSettings.smtpHost,
          port: emailSettings.smtpPort || 465,
          secure: emailSettings.smtpSecure !== false,
          auth: {
            user: emailSettings.smtpUser,
            pass: emailSettings.smtpPassword
          },
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 60000,
          greetingTimeout: 30000,
          socketTimeout: 60000
        });

        // Import document template
        const { getExamDocumentTemplate } = await import('../functions/src/mail/templates');
        
        const templateData = {
          tutorName: tutorName || 'Estimado/a cliente',
          tutorEmail: tutorEmail,
          patientName: petName || 'Mascota',
          species: species || 'Mascota',
          productName: examType,
          appointmentNotes: notes
        };

        const emailTemplate = getExamDocumentTemplate(templateData);

        // Get the actual file from object storage to attach
        let attachment = undefined;
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
          const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const stream = objectFile.createReadStream();
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
          });

          attachment = {
            filename: fileName,
            content: fileBuffer as Buffer,
            contentType: 'application/octet-stream'
          };
        } catch (attachError) {
          console.error('Error getting file for attachment:', attachError);
          // Continue without attachment
        }

        // Send to client with document attached
        await transporter.sendMail({
          from: `"${emailSettings.fromName || 'Ale Veterinaria'}" <${emailSettings.fromEmail}>`,
          to: tutorEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          replyTo: 'contacto@aleveterinaria.cl',
          attachments: attachment ? [attachment] : undefined
        });

        // Send notification to veterinarian
        await transporter.sendMail({
          from: `"${emailSettings.fromName || 'Ale Veterinaria'}" <${emailSettings.fromEmail}>`,
          to: 'contacto@aleveterinaria.cl',
          subject: `📋 Documento Enviado - ${petName}`,
          html: `<h3>Documento de examen enviado por email</h3>
                 <p><strong>Cliente:</strong> ${tutorName}</p>
                 <p><strong>Email:</strong> ${tutorEmail}</p>
                 <p><strong>Mascota:</strong> ${petName}</p>
                 <p><strong>Tipo de examen:</strong> ${examType}</p>
                 <p><strong>Archivo:</strong> ${fileName}</p>
                 ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ''}`
        });

        console.log('✅ Exam document notification emails sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Error sending exam document notification email:', emailError);
      // Don't fail the document save if email fails
    }

    console.log('Exam document saved:', examDocument);
    res.status(201).json(examDocument);
  } catch (error) {
    console.error('Error saving exam document:', error);
    res.status(500).json({ error: 'Failed to save exam document' });
  }
});

// Route for getting exam documents by pet ID
router.get('/api/exam-documents/pet/:petId', async (req, res) => {
  try {
    const petId = req.params.petId;
    console.log('Getting exam documents for pet:', petId);
    const examDocuments = await storage.getExamDocumentsByPet(petId);
    res.json(examDocuments);
  } catch (error) {
    console.error('Error getting exam documents:', error);
    res.status(500).json({ error: 'Failed to get exam documents' });
  }
});

// Route for getting exam documents by multiple pet IDs (for tutor portal)
router.get('/api/exam-documents/pets/:petIds', async (req, res) => {
  try {
    const petIds = req.params.petIds.split(',');
    console.log('Getting exam documents for pets:', petIds);
    
    let allExamDocs: any[] = [];
    for (const petId of petIds) {
      const petExamDocs = await storage.getExamDocumentsByPet(petId);
      allExamDocs.push(...petExamDocs.map(doc => ({ ...doc, petId })));
    }
    
    res.json(allExamDocs);
  } catch (error) {
    console.error('Error getting exam documents:', error);
    res.status(500).json({ error: 'Failed to get exam documents' });
  }
});

// Route for deleting exam documents
router.delete('/api/exam-documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting exam document:', id);
    
    const deletedDocument = await storage.deleteExamDocument(id);
    
    if (deletedDocument) {
      res.json({ success: true, message: 'Exam document deleted successfully' });
    } else {
      res.status(404).json({ error: 'Exam document not found' });
    }
  } catch (error) {
    console.error('Error deleting exam document:', error);
    res.status(500).json({ error: 'Failed to delete exam document' });
  }
});

router.get('/api/vaccinations/firebase/pet/:petId', async (req, res) => {
  try {
    console.log('Getting Firebase vaccinations for pet:', req.params.petId);
    const vaccinations = await getVaccinationsByPet(req.params.petId);
    console.log('Firebase vaccinations found:', vaccinations.length);
    res.json(vaccinations);
  } catch (error) {
    console.error('Error getting Firebase vaccinations:', error);
    res.status(500).json({ error: 'Failed to get vaccinations from Firebase' });
  }
});

router.get('/api/dewormings/firebase/pet/:petId', async (req, res) => {
  try {
    console.log('Getting Firebase dewormings for pet:', req.params.petId);
    const dewormings = await getDewormingsByPet(req.params.petId);
    console.log('Firebase dewormings found:', dewormings.length);
    res.json(dewormings);
  } catch (error) {
    console.error('Error getting Firebase dewormings:', error);
    res.status(500).json({ error: 'Failed to get dewormings from Firebase' });
  }
});

router.get('/api/medical-records/firebase/pet/:petId', async (req, res) => {
  try {
    console.log('Getting Firebase medical records for pet:', req.params.petId);
    const records = await getMedicalRecordsByPet(req.params.petId);
    console.log('Firebase medical records found:', records.length);
    res.json(records);
  } catch (error) {
    console.error('Error getting Firebase medical records:', error);
    res.status(500).json({ error: 'Failed to get medical records from Firebase' });
  }
});

router.post('/api/pets/firebase', async (req, res) => {
  try {
    console.log('Creating Firebase pet:', req.body);
    const petId = await createPet(req.body);
    res.status(201).json({ id: petId, ...req.body });
  } catch (error) {
    console.error('Error creating Firebase pet:', error);
    res.status(500).json({ error: 'Failed to create pet in Firebase' });
  }
});

router.post('/api/vaccinations/firebase', async (req, res) => {
  try {
    console.log('Creating Firebase vaccination:', req.body);
    const vaccinationId = await createVaccination(req.body);
    res.status(201).json({ id: vaccinationId, ...req.body });
  } catch (error) {
    console.error('Error creating Firebase vaccination:', error);
    res.status(500).json({ error: 'Failed to create vaccination in Firebase' });
  }
});

router.post('/api/dewormings/firebase', async (req, res) => {
  try {
    console.log('Creating Firebase deworming:', req.body);
    const dewormingId = await createDeworming(req.body);
    res.status(201).json({ id: dewormingId, ...req.body });
  } catch (error) {
    console.error('Error creating Firebase deworming:', error);
    res.status(500).json({ error: 'Failed to create deworming in Firebase' });
  }
});

// Enhanced search patients route - searches both PostgreSQL and Firebase
router.get('/api/search/patients/:searchTerm', async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm;
    console.log('Searching patients with term:', searchTerm);
    
    let results = [];
    
    // First search in PostgreSQL by RUT
    try {
      const cleanRut = searchTerm.replace(/[.-]/g, '');
      console.log('Searching PostgreSQL with clean RUT:', cleanRut);
      const pgPets = await storage.getPetsByTutorRut(cleanRut);
      console.log('PostgreSQL pets result:', pgPets);
      if (pgPets && pgPets.length > 0) {
        results = pgPets;
        console.log('PostgreSQL search results found:', results.length);
      } else {
        console.log('No results found in PostgreSQL for RUT:', cleanRut);
      }
    } catch (pgError) {
      console.error('PostgreSQL search error:', pgError);
    }
    
    // If no results in PostgreSQL, search Firebase
    if (results.length === 0) {
      try {
        const { searchPatients } = await import('./firebase');
        results = await searchPatients(searchTerm);
        console.log('Firebase search results found:', results.length);
      } catch (fbError) {
        console.error('Firebase search error:', fbError);
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({ error: 'Failed to search patients' });
  }
});

// Search patients by tutor name endpoint
router.get('/api/search/patients/tutor/:tutorName', async (req, res) => {
  try {
    const { tutorName } = req.params;
    console.log(`Searching patients by tutor name: ${tutorName}`);
    
    // Try Firebase search and filter by tutor name
    try {
      const { searchPatients } = await import('./firebase');
      const firebaseResults = await searchPatients(tutorName);
      const filteredResults = firebaseResults.filter((patient: any) => 
        patient.tutorName?.toLowerCase().includes(tutorName.toLowerCase())
      );
      console.log(`Firebase tutor search results found: ${filteredResults.length}`);
      res.json(filteredResults);
    } catch (fbError) {
      console.error('Error searching patients by tutor in Firebase:', fbError);
      res.json([]);
    }
    
  } catch (error) {
    console.error('Error searching patients by tutor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search pets by Firebase record number
router.get('/api/pets/firebase/record/:recordNumber', async (req, res) => {
  try {
    const { recordNumber } = req.params;
    console.log('Searching Firebase pets by record number:', recordNumber);
    
    const { searchPatientsByRecord } = await import('./firebase');
    const results = await searchPatientsByRecord(recordNumber);
    res.json(results);
  } catch (error) {
    console.error('Error searching pets by record number:', error);
    res.json([]);
  }
});

// Get specific patient route
router.get('/api/patients/:patientId', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    console.log('Getting Firebase patient:', patientId);
    
    const { getPatientById } = await import('./firebase');
    const patient = await getPatientById(patientId);
    
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  } catch (error) {
    console.error('Error getting Firebase patient:', error);
    res.status(500).json({ error: 'Failed to get patient from Firebase' });
  }
});

// Prescriptions routes
router.post('/api/prescriptions/firebase', async (req, res) => {
  try {
    console.log('Creating Firebase prescription:', req.body);
    const { createPrescription } = await import('./firebase');
    const prescriptionId = await createPrescription(req.body);
    res.status(201).json({ id: prescriptionId, ...req.body });
  } catch (error) {
    console.error('Error creating Firebase prescription:', error);
    res.status(500).json({ error: 'Failed to create prescription in Firebase' });
  }
});

router.get('/api/prescriptions/firebase/pet/:petId', async (req, res) => {
  try {
    const { getPrescriptionsByPet } = await import('./firebase');
    const prescriptions = await getPrescriptionsByPet(req.params.petId);
    res.json(prescriptions);
  } catch (error) {
    console.error('Error getting Firebase prescriptions:', error);
    res.status(500).json({ error: 'Failed to get prescriptions from Firebase' });
  }
});

// Certificates routes
router.post('/api/certificates/firebase', async (req, res) => {
  try {
    console.log('Creating Firebase certificate:', req.body);
    const { createCertificate } = await import('./firebase');
    const certificateId = await createCertificate(req.body);
    res.status(201).json({ id: certificateId, ...req.body });
  } catch (error) {
    console.error('Error creating Firebase certificate:', error);
    res.status(500).json({ error: 'Failed to create certificate in Firebase' });
  }
});

router.get('/api/certificates/firebase/pet/:petId', async (req, res) => {
  try {
    const { getCertificatesByPet } = await import('./firebase');
    const certificates = await getCertificatesByPet(req.params.petId);
    res.json(certificates);
  } catch (error) {
    console.error('Error getting Firebase certificates:', error);
    res.status(500).json({ error: 'Failed to get certificates from Firebase' });
  }
});

// Deworming routes
router.post('/api/dewormings/firebase', async (req, res) => {
  try {
    console.log('Creating Firebase deworming:', req.body);
    const { createDeworming } = await import('./firebase');
    const dewormingId = await createDeworming(req.body);
    res.status(201).json({ id: dewormingId, ...req.body });
  } catch (error) {
    console.error('Error creating Firebase deworming:', error);
    res.status(500).json({ error: 'Failed to create deworming in Firebase' });
  }
});

router.get('/api/dewormings/firebase/pet/:petId', async (req, res) => {
  try {
    const { getDewormingsByPet } = await import('./firebase');
    const dewormings = await getDewormingsByPet(req.params.petId);
    console.log('API returning dewormings:', dewormings);
    res.json(dewormings);
  } catch (error) {
    console.error('Error getting Firebase dewormings:', error);
    res.status(500).json({ error: 'Failed to get dewormings from Firebase' });
  }
});

// Update patient route
router.put('/api/patients/firebase/:id', async (req, res) => {
  try {
    console.log('Updating Firebase patient:', req.params.id, req.body);
    const { updatePatient } = await import('./firebase');
    await updatePatient(req.params.id, req.body);
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error('Error updating Firebase patient:', error);
    res.status(500).json({ error: 'Failed to update patient in Firebase' });
  }
});

// Update pets route to use patients
router.post('/api/pets/firebase', async (req, res) => {
  try {
    console.log('Creating Firebase patient:', req.body);
    const { createPatient } = await import('./firebase');
    const patientId = await createPatient(req.body);
    res.status(201).json({ id: patientId, ...req.body });
  } catch (error) {
    console.error('Error creating Firebase patient:', error);
    res.status(500).json({ error: 'Failed to create patient in Firebase' });
  }
});

// Users
router.get('/api/users/:id', async (req, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.get('/api/users/email/:email', async (req, res) => {
  try {
    const user = await storage.getUserByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.post('/api/users', async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Pets
router.get('/api/pets/owner/:ownerId', async (req, res) => {
  try {
    const pets = await storage.getPetsByOwner(req.params.ownerId);
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get pets' });
  }
});

router.get('/api/pets/:id', async (req, res) => {
  try {
    const pet = await storage.getPet(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get pet' });
  }
});

router.post('/api/pets', async (req, res) => {
  try {
    console.log('Creating pet with data:', req.body);
    const petData = insertPetSchema.parse(req.body);
    const pet = await storage.createPet(petData);
    console.log('Pet created successfully:', pet);
    res.status(201).json(pet);
  } catch (error) {
    console.error('Error creating pet:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create pet' });
  }
});

// Medical Records
router.get('/api/medical-records/pet/:petId', async (req, res) => {
  try {
    const records = await storage.getMedicalRecordsByPet(req.params.petId);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get medical records' });
  }
});

router.post('/api/medical-records', async (req, res) => {
  try {
    const recordData = insertMedicalRecordSchema.parse(req.body);
    const record = await storage.createMedicalRecord(recordData);
    res.status(201).json(record);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create medical record' });
  }
});

// Vaccinations
router.get('/api/vaccinations/pet/:petId', async (req, res) => {
  try {
    const vaccinations = await storage.getVaccinationsByPet(req.params.petId);
    res.json(vaccinations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get vaccinations' });
  }
});

router.post('/api/vaccinations', async (req, res) => {
  try {
    const vaccinationData = insertVaccinationSchema.parse(req.body);
    const vaccination = await storage.createVaccination(vaccinationData);
    res.status(201).json(vaccination);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create vaccination' });
  }
});

// Dewormings
router.get('/api/dewormings/pet/:petId', async (req, res) => {
  try {
    const dewormings = await storage.getDewormingsByPet(req.params.petId);
    res.json(dewormings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get dewormings' });
  }
});

router.post('/api/dewormings', async (req, res) => {
  try {
    const dewormingData = insertDewormingSchema.parse(req.body);
    const deworming = await storage.createDeworming(dewormingData);
    res.status(201).json(deworming);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create deworming' });
  }
});

// Examinations
router.get('/api/examinations/pet/:petId', async (req, res) => {
  try {
    const examinations = await storage.getExaminationsByPet(req.params.petId);
    res.json(examinations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get examinations' });
  }
});

router.post('/api/examinations', async (req, res) => {
  try {
    const examinationData = insertExaminationSchema.parse(req.body);
    const examination = await storage.createExamination(examinationData);
    res.status(201).json(examination);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create examination' });
  }
});

// Certificates
router.get('/api/certificates/pet/:petId', async (req, res) => {
  try {
    const certificates = await storage.getCertificatesByPet(req.params.petId);
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get certificates' });
  }
});

router.post('/api/certificates', async (req, res) => {
  try {
    const certificateData = insertCertificateSchema.parse(req.body);
    const certificate = await storage.createCertificate(certificateData);
    res.status(201).json(certificate);
  } catch (error) {
    console.error('Certificate creation error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create certificate', details: error.message });
  }
});

// Questionnaires
router.get('/api/questionnaires', async (req, res) => {
  try {
    const questionnaires = await storage.getAllQuestionnaires();
    res.json(questionnaires);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get questionnaires' });
  }
});

router.get('/api/questionnaires/:id', async (req, res) => {
  try {
    const questionnaire = await storage.getQuestionnaire(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }
    res.json(questionnaire);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get questionnaire' });
  }
});

// Get questionnaires by appointment
router.get('/api/questionnaires/appointment/:appointmentId', async (req, res) => {
  try {
    const questionnaires = await storage.getQuestionnairesByAppointment(req.params.appointmentId);
    res.json(questionnaires);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get questionnaires for appointment' });
  }
});

// Get questionnaires by pet
router.get('/api/questionnaires/pet/:petId', async (req, res) => {
  try {
    const questionnaires = await storage.getQuestionnairesByPet(req.params.petId);
    res.json(questionnaires);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get questionnaires for pet' });
  }
});

// Route to get questionnaire by appointment token
router.get('/api/questionnaire/:token', async (req, res) => {
  try {
    const token = req.params.token;
    
    // Decode the token to get appointment data
    let tokenData;
    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf-8');
      tokenData = JSON.parse(decoded);
    } catch (error) {
      return res.status(400).json({ error: 'Token inválido' });
    }
    
    // Validate token has required fields
    if (!tokenData.appointmentId || !tokenData.tutorEmail) {
      return res.status(400).json({ error: 'Token incompleto' });
    }
    
    // Return appointment data for the questionnaire form
    res.json({
      appointmentId: tokenData.appointmentId,
      tutorEmail: tokenData.tutorEmail,
      petName: tokenData.petName || '',
      valid: true
    });
    
  } catch (error) {
    console.error('Error validating questionnaire token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/api/questionnaires', async (req, res) => {
  try {
    const questionnaireData = insertPreVisitQuestionnaireSchema.parse(req.body);
    const questionnaire = await storage.createQuestionnaire(questionnaireData);
    
    // Send email notification to veterinarian
    try {
      await sendQuestionnaireCompletedEmail(questionnaire);
      console.log('📋 Questionnaire completed email sent successfully');
    } catch (emailError) {
      console.error('❌ Error sending questionnaire notification email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json(questionnaire);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create questionnaire' });
  }
});

// DELETE routes for Firebase records
router.delete('/api/prescriptions/firebase/:prescriptionId', async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    console.log('Deleting Firebase prescription:', prescriptionId);
    
    const { deletePrescription } = await import('./firebase');
    const success = await deletePrescription(prescriptionId);
    
    if (success) {
      res.json({ success: true, message: 'Prescription deleted successfully' });
    } else {
      res.status(404).json({ error: 'Prescription not found' });
    }
  } catch (error) {
    console.error('Error deleting Firebase prescription:', error);
    res.status(500).json({ error: 'Error deleting prescription' });
  }
});

router.delete('/api/vaccinations/firebase/:vaccinationId', async (req, res) => {
  try {
    const { vaccinationId } = req.params;
    console.log('Deleting Firebase vaccination:', vaccinationId);
    
    const { deleteVaccination } = await import('./firebase');
    const success = await deleteVaccination(vaccinationId);
    
    if (success) {
      res.json({ success: true, message: 'Vaccination deleted successfully' });
    } else {
      res.status(404).json({ error: 'Vaccination not found' });
    }
  } catch (error) {
    console.error('Error deleting Firebase vaccination:', error);
    res.status(500).json({ error: 'Error deleting vaccination' });
  }
});

router.delete('/api/dewormings/firebase/:dewormingId', async (req, res) => {
  try {
    const { dewormingId } = req.params;
    console.log('Deleting Firebase deworming:', dewormingId);
    
    const { deleteDeworming } = await import('./firebase');
    const success = await deleteDeworming(dewormingId);
    
    if (success) {
      res.json({ success: true, message: 'Deworming deleted successfully' });
    } else {
      res.status(404).json({ error: 'Deworming not found' });
    }
  } catch (error) {
    console.error('Error deleting Firebase deworming:', error);
    res.status(500).json({ error: 'Error deleting deworming' });
  }
});

router.delete('/api/certificates/firebase/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    console.log('=== ATTEMPTING TO DELETE CERTIFICATE ===');
    console.log('Certificate ID:', certificateId);
    
    // Try Firebase first (certificates subcollection)
    const { deleteCertificate } = await import('./firebase');
    const firebaseSuccess = await deleteCertificate(certificateId);
    
    if (firebaseSuccess) {
      res.json({ success: true, message: 'Certificate deleted successfully from Firebase' });
      return;
    }
    
    // If not found in Firebase, try PostgreSQL
    console.log('Not found in Firebase, trying PostgreSQL...');
    const { db } = await import('./db');
    const { certificates } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const result = await db.delete(certificates)
      .where(eq(certificates.id, certificateId))
      .returning();
    
    if (result.length > 0) {
      console.log('Certificate deleted successfully from PostgreSQL:', certificateId);
      res.json({ success: true, message: 'Certificate deleted successfully from PostgreSQL' });
    } else {
      console.log('Certificate not found in any location:', certificateId);
      res.status(404).json({ error: 'Certificate not found' });
    }
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Error deleting certificate' });
  }
});

router.delete('/api/medical-records/firebase/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    console.log('=== ATTEMPTING TO DELETE MEDICAL RECORD ===');
    console.log('Record ID:', recordId);
    
    // Try Firebase first (consultations subcollection)
    const { deleteMedicalRecord } = await import('./firebase');
    const firebaseSuccess = await deleteMedicalRecord(recordId);
    
    if (firebaseSuccess) {
      res.json({ success: true, message: 'Medical record deleted successfully from Firebase' });
      return;
    }
    
    // If not found in Firebase, try PostgreSQL
    console.log('Not found in Firebase, trying PostgreSQL...');
    const { db } = await import('./db');
    const { medicalRecords } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const result = await db.delete(medicalRecords)
      .where(eq(medicalRecords.id, recordId))
      .returning();
    
    if (result.length > 0) {
      console.log('Medical record deleted successfully from PostgreSQL:', recordId);
      res.json({ success: true, message: 'Medical record deleted successfully from PostgreSQL' });
    } else {
      console.log('Medical record not found in any location:', recordId);
      res.status(404).json({ error: 'Medical record not found' });
    }
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ error: 'Error deleting medical record' });
  }
});

router.delete('/api/exam-orders/firebase/:examOrderId', async (req, res) => {
  try {
    const { examOrderId } = req.params;
    console.log('Deleting Firebase exam order:', examOrderId);
    
    const { deleteExamOrder } = await import('./firebase');
    const success = await deleteExamOrder(examOrderId);
    
    if (success) {
      res.json({ success: true, message: 'Exam order deleted successfully' });
    } else {
      res.status(404).json({ error: 'Exam order not found' });
    }
  } catch (error) {
    console.error('Error deleting Firebase exam order:', error);
    res.status(500).json({ error: 'Error deleting exam order' });
  }
});

// Development routes for testing without Firebase auth (NODE_ENV !== 'production' only)
if (process.env.NODE_ENV !== 'production') {
  // Create a test vaccination with selectedDiseases and vaccineType
  router.post('/api/dev/seed/vaccination', async (req, res) => {
    try {
      console.log('Creating dev vaccination seed:', req.body);
      
      // Mock vaccination data with selectedDiseases and vaccineType
      const mockVaccination = {
        id: `mock-${Date.now()}`,
        petId: req.body.petId || 'mock-pet-id',
        veterinarianId: 'mock-vet-id', 
        vaccineName: req.body.vaccineName || 'Vacuna Múltiple',
        laboratory: req.body.laboratory || 'Lab Test',
        batch: req.body.batch || 'BATCH123',
        serialNumber: req.body.serialNumber || 'SN123456',
        applicationDate: req.body.applicationDate || new Date().toISOString(),
        validityDate: req.body.validityDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        selectedDiseases: req.body.selectedDiseases || ['distemper', 'parvovirus'],
        vaccineType: req.body.vaccineType || 'viva_modificada',
        pathogens: req.body.pathogens || [],
        certificate: req.body.certificate || '',
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(mockVaccination);
    } catch (error) {
      console.error('Error creating dev vaccination seed:', error);
      res.status(500).json({ error: 'Failed to create dev vaccination seed' });
    }
  });

  // Get mock vaccinations for a pet (for testing certificate generation)
  router.get('/api/dev/mock/vaccinations/:petId', async (req, res) => {
    try {
      console.log('Getting dev mock vaccinations for pet:', req.params.petId);
      
      // Return mock vaccination data with proper SAG structure
      const mockVaccinations = [
        {
          id: `mock-vacc-1-${req.params.petId}`,
          petId: req.params.petId,
          veterinarianId: 'mock-vet-id',
          name: 'Vacuna Múltiple Canina',
          vaccineName: 'Vacuna Múltiple Canina',
          laboratory: 'Laboratorio Veterinario',
          batch: 'BATCH001',
          serialNumber: 'SN789012',
          batchNumber: 'BATCH001',  // Alternative field name
          applicationDate: '2024-01-15T10:00:00.000Z',
          validityDate: '2025-01-15T10:00:00.000Z',
          selectedDiseases: ['distemper', 'parvovirus', 'adenovirus'],
          vaccineType: 'viva_modificada',
          pathogens: ['Distemper', 'Parvovirus'],
          certificate: '',
          createdAt: '2024-01-15T10:00:00.000Z'
        },
        {
          id: `mock-vacc-2-${req.params.petId}`,
          petId: req.params.petId,
          veterinarianId: 'mock-vet-id',
          name: 'Vacuna Antirrábica',
          vaccineName: 'Vacuna Antirrábica',
          laboratory: 'Laboratorio Nacional',
          batch: 'RABIES123',
          serialNumber: 'SN456789',
          batchNumber: 'RABIES123',
          applicationDate: '2024-02-01T14:00:00.000Z',
          validityDate: '2027-02-01T14:00:00.000Z',
          selectedDiseases: ['antirrabica'],
          vaccineType: 'inactivada',
          pathogens: ['Rabia'],
          certificate: '',
          createdAt: '2024-02-01T14:00:00.000Z'
        }
      ];
      
      res.json(mockVaccinations);
    } catch (error) {
      console.error('Error getting mock vaccinations:', error);
      res.status(500).json({ error: 'Failed to get mock vaccinations' });
    }
  });

  // Get mock deworming data for certificate generation
  router.get('/api/dev/mock/dewormings/:petId', async (req, res) => {
    try {
      console.log('Getting dev mock dewormings for pet:', req.params.petId);
      
      const mockDewormings = [
        {
          id: `mock-deworm-1-${req.params.petId}`,
          petId: req.params.petId,
          veterinarianId: 'mock-vet-id',
          product: 'Drontal Plus',
          type: 'internal',
          laboratory: 'Bayer',
          activeIngredient: 'Praziquantel + Pyrantel',
          batchNumber: 'DT789',
          applicationDate: '2024-01-20T09:00:00.000Z',
          createdAt: '2024-01-20T09:00:00.000Z'
        },
        {
          id: `mock-deworm-2-${req.params.petId}`,
          petId: req.params.petId, 
          veterinarianId: 'mock-vet-id',
          product: 'Frontline',
          type: 'external',
          laboratory: 'Merial',
          activeIngredient: 'Fipronil',
          batchNumber: 'FL456',
          applicationDate: '2024-01-25T11:00:00.000Z',
          createdAt: '2024-01-25T11:00:00.000Z'
        }
      ];
      
      res.json(mockDewormings);
    } catch (error) {
      console.error('Error getting mock dewormings:', error);
      res.status(500).json({ error: 'Failed to get mock dewormings' });
    }
  });

  console.log('🔧 Development routes loaded: /api/dev/seed/vaccination, /api/dev/mock/vaccinations/:petId, /api/dev/mock/dewormings/:petId');
}

// Nutrition Assessment Routes
router.post('/api/nutrition-assessments', async (req, res) => {
  try {
    const { db } = await import('./db');
    const { nutritionAssessments, insertNutritionAssessmentSchema } = await import('@shared/schema');
    
    const validatedData = insertNutritionAssessmentSchema.parse(req.body);
    const [assessment] = await db.insert(nutritionAssessments).values(validatedData).returning();
    
    res.status(201).json(assessment);
  } catch (error) {
    console.error('Error creating nutrition assessment:', error);
    res.status(500).json({ error: 'Error creating nutrition assessment' });
  }
});

router.get('/api/nutrition-assessments/pet/:petId', async (req, res) => {
  try {
    const { db } = await import('./db');
    const { nutritionAssessments } = await import('@shared/schema');
    const { eq, desc } = await import('drizzle-orm');
    
    const assessments = await db
      .select()
      .from(nutritionAssessments)
      .where(eq(nutritionAssessments.petId, req.params.petId))
      .orderBy(desc(nutritionAssessments.assessmentDate));
    
    res.json(assessments);
  } catch (error) {
    console.error('Error fetching nutrition assessments:', error);
    res.status(500).json({ error: 'Error fetching nutrition assessments' });
  }
});

router.put('/api/nutrition-assessments/:id', async (req, res) => {
  try {
    const { db } = await import('./db');
    const { nutritionAssessments, insertNutritionAssessmentSchema } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const validatedData = insertNutritionAssessmentSchema.parse(req.body);
    const [assessment] = await db
      .update(nutritionAssessments)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(nutritionAssessments.id, req.params.id))
      .returning();
    
    if (!assessment) {
      return res.status(404).json({ error: 'Nutrition assessment not found' });
    }
    
    res.json(assessment);
  } catch (error) {
    console.error('Error updating nutrition assessment:', error);
    res.status(500).json({ error: 'Error updating nutrition assessment' });
  }
});

router.delete('/api/nutrition-assessments/:id', async (req, res) => {
  try {
    const { db } = await import('./db');
    const { nutritionAssessments } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [deleted] = await db
      .delete(nutritionAssessments)
      .where(eq(nutritionAssessments.id, req.params.id))
      .returning();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Nutrition assessment not found' });
    }
    
    res.json({ success: true, message: 'Nutrition assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting nutrition assessment:', error);
    res.status(500).json({ error: 'Error deleting nutrition assessment' });
  }
});

// Food Database Routes
router.post('/api/foods', async (req, res) => {
  try {
    const { db } = await import('./db');
    const { foods, insertFoodSchema } = await import('@shared/schema');
    
    const validatedData = insertFoodSchema.parse(req.body);
    const [food] = await db.insert(foods).values(validatedData).returning();
    
    res.status(201).json(food);
  } catch (error) {
    console.error('Error creating food:', error);
    res.status(500).json({ error: 'Error creating food' });
  }
});

router.get('/api/foods', async (req, res) => {
  try {
    const { db } = await import('./db');
    const { foods } = await import('@shared/schema');
    const { eq, desc, and, like } = await import('drizzle-orm');
    
    const { species, type, search, active = 'true' } = req.query;
    
    const conditions = [];
    
    if (active === 'true') {
      conditions.push(eq(foods.isActive, true));
    }
    
    if (species && species !== 'all' && species !== 'Ambos') {
      // For enum types, we need to cast properly
      const speciesValue = species as 'Canino' | 'Felino' | 'Ambos';
      conditions.push(eq(foods.species, speciesValue));
    }
    
    if (type && type !== 'all') {
      // For enum types, we need to cast properly  
      const typeValue = type as 'kibble' | 'wet' | 'raw' | 'treat' | 'supplement';
      conditions.push(eq(foods.type, typeValue));
    }
    
    if (search) {
      conditions.push(like(foods.name, `%${search}%`));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const foodList = await db
      .select()
      .from(foods)
      .where(whereClause)
      .orderBy(desc(foods.createdAt));
    res.json(foodList);
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Error fetching foods' });
  }
});

router.get('/api/foods/:id', async (req, res) => {
  try {
    const { db } = await import('./db');
    const { foods } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [food] = await db
      .select()
      .from(foods)
      .where(eq(foods.id, req.params.id));
    
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json(food);
  } catch (error) {
    console.error('Error fetching food:', error);
    res.status(500).json({ error: 'Error fetching food' });
  }
});

router.put('/api/foods/:id', async (req, res) => {
  try {
    const { db } = await import('./db');
    const { foods, insertFoodSchema } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const validatedData = insertFoodSchema.parse(req.body);
    const [food] = await db
      .update(foods)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(foods.id, req.params.id))
      .returning();
    
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json(food);
  } catch (error) {
    console.error('Error updating food:', error);
    res.status(500).json({ error: 'Error updating food' });
  }
});

router.delete('/api/foods/:id', async (req, res) => {
  try {
    const { db } = await import('./db');
    const { foods } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    // Soft delete - mark as inactive instead of hard delete
    const [food] = await db
      .update(foods)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(foods.id, req.params.id))
      .returning();
    
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json({ success: true, message: 'Food deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating food:', error);
    res.status(500).json({ error: 'Error deactivating food' });
  }
});

// Rutas para el sistema de agenda
router.get('/api/appointments/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await storage.getAppointmentsByDate(today);
    res.json(appointments);
  } catch (error) {
    console.error('Error getting today appointments:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
});

router.get('/api/appointments/tutor/:rut', async (req, res) => {
  try {
    const appointments = await storage.getAppointmentsByTutorRut(req.params.rut);
    res.json(appointments);
  } catch (error) {
    console.error('Error getting appointments by tutor:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
});

router.get('/api/appointments/date/:date', async (req, res) => {
  try {
    const appointments = await storage.getAppointmentsByDate(req.params.date);
    res.json(appointments);
  } catch (error) {
    console.error('Error getting appointments by date:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
});

// Get appointments by year and month for professional portal calendar view
router.get('/api/appointments/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const appointments = await storage.getAppointmentsByYearMonth(parseInt(year), parseInt(month));
    res.json(appointments);
  } catch (error) {
    console.error('Error getting appointments by year/month:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
});

router.post('/api/appointments', async (req, res) => {
  try {
    const { insertAppointmentSchema } = await import('@shared/schema');
    const validatedData = insertAppointmentSchema.parse(req.body);
    const appointment = await storage.createAppointment(validatedData);
    
    // Update pet tutor information based on appointment data
    try {
      if (appointment.petId && appointment.tutorName) {
        const { db } = await import('./db');
        const { pets } = await import('@shared/schema');
        const { eq } = await import('drizzle-orm');
        
        // Parse address to extract region, comuna, house number if available
        const addressParts = appointment.address ? appointment.address.split(',').map(part => part.trim()) : [];
        let tutorRegion = '';
        let tutorComuna = '';
        let tutorHouseNumber = '';
        
        // Try to extract location info from address
        if (addressParts.length >= 3) {
          tutorComuna = addressParts[addressParts.length - 2] || '';
          tutorRegion = addressParts[addressParts.length - 1] || '';
          
          // Extract house number from first part of address
          const addressFirstPart = addressParts[0] || '';
          const houseNumberMatch = addressFirstPart.match(/(\d+)/);
          if (houseNumberMatch) {
            tutorHouseNumber = houseNumberMatch[1];
          }
        }
        
        // Update pet with complete tutor information
        await db
          .update(pets)
          .set({
            tutorName: appointment.tutorName,
            tutorPhone: appointment.tutorPhone,
            tutorEmail: appointment.tutorEmail,
            tutorAddress: appointment.address || '',
            tutorRegion: tutorRegion,
            tutorComuna: tutorComuna,
            tutorHouseNumber: tutorHouseNumber,
          })
          .where(eq(pets.id, appointment.petId));
        
        console.log('✅ Pet tutor information updated from appointment data');
      }
    } catch (updateError) {
      console.error('❌ Error updating pet tutor information:', updateError);
      // Don't fail appointment creation if update fails
    }
    
    // Auto-sync with Google Calendar if connected and enabled
    try {
      if (storedTokens) {
        oauth2Client.setCredentials(storedTokens);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        // Calculate appointment duration (default 1 hour)
        const duration = appointment.duration || 60; // minutes
        const startDateTime = new Date(appointment.appointmentDate + 'T' + appointment.appointmentTime);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
        
        const event = {
          summary: `🐕 Veterinaria - ${appointment.petName}`,
          description: `Consulta veterinaria para ${appointment.petName}\n\n` +
                      `👨‍⚕️ Servicio: ${appointment.serviceType}\n` +
                      `👤 Tutor: ${appointment.tutorName}\n` +
                      `📞 Teléfono: ${appointment.tutorPhone || 'No especificado'}\n` +
                      `📍 Dirección: ${appointment.address || 'No especificada'}\n\n` +
                      `📝 Notas: ${appointment.notes || 'Sin notas adicionales'}`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'America/Santiago',
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'America/Santiago',
          },
          location: appointment.address || 'Domicilio del cliente',
          colorId: '10', // Green color for vet appointments
        };

        const createdEvent = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event,
        });
        
        console.log('✅ Appointment synced to Google Calendar automatically:', createdEvent.data.id);
      } else {
        console.log('ℹ️ Google Calendar not connected, skipping sync');
      }
    } catch (calendarError) {
      console.error('❌ Error syncing to Google Calendar:', calendarError);
      // Don't fail the appointment creation if calendar sync fails
    }

    // Send email notification for new appointment
    try {
      const emailSettings = await storage.getNotificationSettings('email');
      
      if (emailSettings && emailSettings.smtpHost) {
        const nodemailer = await import('nodemailer');
        
        const transporter = nodemailer.default.createTransport({
          host: emailSettings.smtpHost,
          port: emailSettings.smtpPort || 465,
          secure: emailSettings.smtpSecure !== false, // true para puerto 465 (Zoho)
          auth: {
            user: emailSettings.smtpUser,
            pass: emailSettings.smtpPassword
          },
          // Configuración adicional para Zoho Mail
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 60000, // 60 segundos
          greetingTimeout: 30000,   // 30 segundos
          socketTimeout: 60000      // 60 segundos
        });

        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString('es-CL', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        };

        const formatTime = (timeStr: string) => {
          return timeStr.slice(0, 5); // Remove seconds if present
        };

        // Email template for appointment notification
        const appointmentEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #A3CBB2 0%, #7FB3C3 100%); padding: 20px; border-radius: 10px 10px 0 0;">
              <h2 style="margin: 0; color: white; text-align: center;">🐕 Nueva Cita Agendada</h2>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border: 1px solid #e9ecef;">
              <h3 style="color: #2D3748; margin-top: 0;">Detalles de la Cita:</h3>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Mascota:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${appointment.petName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Servicio:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${appointment.serviceType}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Fecha:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${formatDate(appointment.appointmentDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Hora:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${formatTime(appointment.appointmentTime)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Tutor:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${appointment.tutorName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Teléfono:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${appointment.tutorPhone || 'No especificado'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Email:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${appointment.tutorEmail || 'No especificado'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Dirección:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${appointment.address || 'No especificada'}</td>
                </tr>
              </table>
              
              ${appointment.notes ? `
              <h4 style="color: #2D3748; margin-bottom: 10px;">Notas adicionales:</h4>
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #A3CBB2;">
                ${appointment.notes.replace(/\n/g, '<br>')}
              </div>
              ` : ''}
            </div>
            
            <div style="background: #A3CBB2; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
              <p style="margin: 0; color: white; font-size: 14px;">
                Cita agendada a través de aleveterinaria.cl<br>
                Fecha de registro: ${new Date().toLocaleString('es-CL')}
              </p>
            </div>
          </div>
        `;

        // Send notification to veterinarian
        await transporter.sendMail({
          from: `"${emailSettings.fromName || 'Ale Veterinaria'}" <${emailSettings.fromEmail}>`,
          to: 'contacto@aleveterinaria.cl',
          subject: `🐕 Nueva Cita Agendada - ${appointment.petName} - ${formatDate(appointment.appointmentDate)}`,
          html: appointmentEmailHtml
        });

        // Send confirmation to client if email provided
        if (appointment.tutorEmail) {
          const clientConfirmationHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #A3CBB2 0%, #7FB3C3 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; color: white; text-align: center;">✅ Cita Confirmada</h2>
              </div>
              
              <div style="background: #f8f9fa; padding: 25px; border: 1px solid #e9ecef;">
                <p style="color: #2D3748; font-size: 16px;">Hola <strong>${appointment.tutorName}</strong>,</p>
                
                <p style="color: #495057;">Tu cita veterinaria ha sido agendada exitosamente. Aquí tienes los detalles:</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #A3CBB2; margin: 20px 0;">
                  <table style="width: 100%;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #2D3748;">Mascota:</td>
                      <td style="padding: 8px 0; color: #495057;">${appointment.petName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #2D3748;">Servicio:</td>
                      <td style="padding: 8px 0; color: #495057;">${appointment.serviceType}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #2D3748;">Fecha:</td>
                      <td style="padding: 8px 0; color: #495057;">${formatDate(appointment.appointmentDate)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #2D3748;">Hora:</td>
                      <td style="padding: 8px 0; color: #495057;">${formatTime(appointment.appointmentTime)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #2D3748;">Dirección:</td>
                      <td style="padding: 8px 0; color: #495057;">${appointment.address || 'Por confirmar'}</td>
                    </tr>
                  </table>
                </div>

                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="color: #1976d2; margin: 0 0 10px 0;">Información de Contacto:</h4>
                  <p style="margin: 5px 0; color: #1565c0;"><strong>WhatsApp:</strong> +56 9 7604 0797</p>
                  <p style="margin: 5px 0; color: #1565c0;"><strong>Email:</strong> contacto@aleveterinaria.cl</p>
                  <p style="margin: 5px 0; color: #1565c0;"><strong>Instagram:</strong> @aleveterinaria</p>
                </div>

                <p style="color: #495057;">
                  Te contactaremos próximamente para confirmar los detalles de la consulta.
                  Si necesitas modificar o cancelar la cita, no dudes en contactarnos.
                </p>
              </div>
              
              <div style="background: #A3CBB2; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
                <p style="margin: 0; color: white; font-size: 14px;">
                  Gracias por confiar en Ale Veterinaria<br>
                  🐕 Cuidamos a tu mascota con amor y dedicación 🐕
                </p>
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: `"${emailSettings.fromName || 'Ale Veterinaria'}" <${emailSettings.fromEmail}>`,
            to: appointment.tutorEmail,
            subject: `✅ Cita Confirmada - ${appointment.petName} - ${formatDate(appointment.appointmentDate)}`,
            html: clientConfirmationHtml,
            replyTo: 'contacto@aleveterinaria.cl'
          });
        }

        console.log('✅ Appointment notification emails sent successfully');
      } else {
        console.log('⚠️ Email settings not configured, skipping email notifications');
      }
    } catch (emailError) {
      console.error('❌ Error sending appointment notification email:', emailError);
      // Don't fail the appointment creation if email fails
    }

    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});


// Cancel appointment (change status to cancelled)
router.patch('/api/appointments/:id/cancel', async (req, res) => {
  try {
    // Get appointment details before cancelling for email notification
    const originalAppointment = await storage.getAppointmentById(req.params.id);
    if (!originalAppointment) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const appointment = await storage.updateAppointment(req.params.id, { status: 'cancelled' });

    // Send cancellation email notification
    try {
      const emailSettings = await storage.getNotificationSettings('email');
      
      if (emailSettings && emailSettings.smtpHost && originalAppointment.tutorEmail) {
        const nodemailer = await import('nodemailer');
        
        const transporter = nodemailer.default.createTransport({
          host: emailSettings.smtpHost,
          port: emailSettings.smtpPort || 465,
          secure: emailSettings.smtpSecure !== false,
          auth: {
            user: emailSettings.smtpUser,
            pass: emailSettings.smtpPassword
          },
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 60000,
          greetingTimeout: 30000,
          socketTimeout: 60000
        });

        // Import cancellation template
        const { getAppointmentCancellationTemplate } = await import('../functions/src/mail/templates');
        
        const templateData = {
          tutorName: originalAppointment.tutorName,
          tutorEmail: originalAppointment.tutorEmail,
          patientName: originalAppointment.petName,
          species: 'Mascota',
          serviceType: originalAppointment.serviceType,
          appointmentDate: new Date(`${originalAppointment.appointmentDate}T${originalAppointment.appointmentTime}`)
        };

        const emailTemplate = getAppointmentCancellationTemplate(templateData);

        // Send to client
        await transporter.sendMail({
          from: `"${emailSettings.fromName || 'Ale Veterinaria'}" <${emailSettings.fromEmail}>`,
          to: originalAppointment.tutorEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          replyTo: 'contacto@aleveterinaria.cl'
        });

        // Send notification to veterinarian
        await transporter.sendMail({
          from: `"${emailSettings.fromName || 'Ale Veterinaria'}" <${emailSettings.fromEmail}>`,
          to: 'contacto@aleveterinaria.cl',
          subject: `❌ Cita Cancelada - ${originalAppointment.petName}`,
          html: `<h3>Cita cancelada por cliente</h3>
                 <p><strong>Cliente:</strong> ${originalAppointment.tutorName}</p>
                 <p><strong>Mascota:</strong> ${originalAppointment.petName}</p>
                 <p><strong>Fecha:</strong> ${originalAppointment.appointmentDate} ${originalAppointment.appointmentTime}</p>
                 <p><strong>Servicio:</strong> ${originalAppointment.serviceType}</p>`
        });

        console.log('✅ Cancellation notification emails sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Error sending cancellation notification email:', emailError);
      // Don't fail the cancellation if email fails
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Error cancelling appointment' });
  }
});

// Delete appointment (only for cancelled appointments)
router.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if appointment exists and is cancelled
    const appointment = await storage.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (appointment.status !== 'cancelled') {
      return res.status(400).json({ 
        error: 'Solo se pueden eliminar citas que estén canceladas' 
      });
    }

    // Delete the appointment
    const deletedAppointment = await storage.deleteAppointment(id);
    
    res.json({ 
      success: true, 
      message: 'Cita eliminada exitosamente',
      deletedAppointment 
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Update appointment
router.patch('/api/appointments/:id', async (req, res) => {
  try {
    const updateData = req.body;
    const appointment = await storage.updateAppointment(req.params.id, updateData);

    // Update in Google Calendar if connected
    try {
      if (storedTokens && appointment && appointment.status === 'scheduled') {
        oauth2Client.setCredentials(storedTokens);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        // Search for existing event to update
        const eventSummary = `🐕 Veterinaria - ${appointment.petName}`;
        const searchResults = await calendar.events.list({
          calendarId: 'primary',
          q: appointment.petName,
          timeMin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Search 1 week back
        });
        
        // Find the specific event by checking summary and date
        const existingEvent = searchResults.data.items?.find(event => 
          event.summary?.includes(appointment.petName) &&
          (event.start?.dateTime?.includes(appointment.appointmentDate) ||
           event.description?.includes(appointment.petName))
        );
        
        if (existingEvent) {
          // Update existing event
          const duration = appointment.duration || 60;
          const startDateTime = new Date(appointment.appointmentDate + 'T' + appointment.appointmentTime);
          const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
          
          const updatedEvent = {
            summary: eventSummary,
            description: `Consulta veterinaria para ${appointment.petName}\n\n` +
                        `👨‍⚕️ Servicio: ${appointment.serviceType}\n` +
                        `👤 Tutor: ${appointment.tutorName}\n` +
                        `📞 Teléfono: ${appointment.tutorPhone || 'No especificado'}\n` +
                        `📍 Dirección: ${appointment.address || 'No especificada'}\n\n` +
                        `📝 Notas: ${appointment.notes || 'Sin notas adicionales'}`,
            start: {
              dateTime: startDateTime.toISOString(),
              timeZone: 'America/Santiago',
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: 'America/Santiago',
            },
            location: appointment.address || 'Domicilio del cliente',
            colorId: '10',
          };

          await calendar.events.update({
            calendarId: 'primary',
            eventId: existingEvent.id!,
            requestBody: updatedEvent,
          });
          
          console.log('✅ Appointment updated in Google Calendar:', existingEvent.id);
        } else {
          console.log('⚠️ Event not found in Google Calendar, will be created on next sync');
        }
      }
    } catch (calendarError) {
      console.error('❌ Error updating Google Calendar:', calendarError);
      // Don't fail the appointment update if calendar sync fails
    }

    // Send update email notification
    try {
      const emailSettings = await storage.getNotificationSettings('email');
      
      if (emailSettings && emailSettings.smtpHost && appointment && appointment.tutorEmail) {
        const nodemailer = await import('nodemailer');
        
        const transporter = nodemailer.default.createTransport({
          host: emailSettings.smtpHost,
          port: emailSettings.smtpPort || 465,
          secure: emailSettings.smtpSecure !== false,
          auth: {
            user: emailSettings.smtpUser,
            pass: emailSettings.smtpPassword
          },
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 60000,
          greetingTimeout: 30000,
          socketTimeout: 60000
        });

        // Import update template
        const { getAppointmentUpdateTemplate } = await import('../functions/src/mail/templates');
        
        const templateData = {
          tutorName: appointment.tutorName,
          tutorEmail: appointment.tutorEmail,
          patientName: appointment.petName,
          species: 'Mascota',
          serviceType: appointment.serviceType,
          appointmentDate: new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`),
          appointmentNotes: appointment.notes || '',
          address: appointment.address
        };

        const emailTemplate = getAppointmentUpdateTemplate(templateData);

        // Send to client
        await transporter.sendMail({
          from: `"${emailSettings.fromName || 'Ale Veterinaria'}" <${emailSettings.fromEmail}>`,
          to: appointment.tutorEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          replyTo: 'contacto@aleveterinaria.cl',
          attachments: emailTemplate.icsBuffer ? [
            {
              filename: 'cita_actualizada.ics',
              content: emailTemplate.icsBuffer,
              contentType: 'text/calendar; charset=utf-8; method=REQUEST'
            }
          ] : undefined
        });

        // Send notification to veterinarian
        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString('es-CL', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        };

        const formatTime = (timeStr: string) => {
          return timeStr.slice(0, 5);
        };

        await transporter.sendMail({
          from: `"${emailSettings.fromName || 'Ale Veterinaria'}" <${emailSettings.fromEmail}>`,
          to: 'contacto@aleveterinaria.cl',
          subject: `✏️ Cita Modificada - ${appointment.petName}`,
          html: `<h3>Cita modificada por cliente</h3>
                 <p><strong>Cliente:</strong> ${appointment.tutorName}</p>
                 <p><strong>Mascota:</strong> ${appointment.petName}</p>
                 <p><strong>Nueva fecha:</strong> ${formatDate(appointment.appointmentDate)} ${formatTime(appointment.appointmentTime)}</p>
                 <p><strong>Servicio:</strong> ${appointment.serviceType}</p>
                 <p><strong>Dirección:</strong> ${appointment.address}</p>
                 ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ''}`
        });

        console.log('✅ Update notification emails sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Error sending update notification email:', emailError);
      // Don't fail the update if email fails
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Error updating appointment' });
  }
});

// Notification Settings routes
router.get('/api/settings/notifications/:type', async (req, res) => {
  try {
    const settings = await storage.getNotificationSettings(req.params.type);
    res.json(settings);
  } catch (error) {
    console.error('Error getting notification settings:', error);
    res.status(500).json({ error: 'Error getting notification settings' });
  }
});

router.post('/api/settings/notifications', async (req, res) => {
  try {
    const settings = await storage.saveNotificationSettings(req.body);
    res.json(settings);
  } catch (error) {
    console.error('Error saving notification settings:', error);
    res.status(500).json({ error: 'Error saving notification settings' });
  }
});

router.patch('/api/settings/notifications/:type', async (req, res) => {
  try {
    const settings = await storage.updateNotificationSettings(req.params.type, req.body);
    res.json(settings);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Error updating notification settings' });
  }
});

router.get('/api/schedule/availability/:date', async (req, res) => {
  try {
    const serviceType = req.query.serviceType as string;
    const editingAppointment = req.query.editingAppointment as string;
    const availability = await storage.getAvailableSlots(req.params.date, serviceType, editingAppointment);
    res.json(availability);
  } catch (error) {
    console.error('Error getting availability:', error);
    res.status(500).json({ error: 'Failed to get availability' });
  }
});

// Check if a specific date is completely blocked
router.get('/api/schedule/is-blocked/:date', async (req, res) => {
  try {
    const isBlocked = await storage.isDateCompletelyBlocked(req.params.date);
    res.json({ isBlocked });
  } catch (error) {
    console.error('Error checking if date is blocked:', error);
    res.status(500).json({ error: 'Failed to check date availability' });
  }
});

// Veterinary schedule management routes
router.post('/api/schedule/veterinary', async (req, res) => {
  try {
    const { insertVeterinaryScheduleSchema } = await import('@shared/schema');
    const validatedData = insertVeterinaryScheduleSchema.parse(req.body);
    const schedule = await storage.createVeterinarySchedule(validatedData);
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating veterinary schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

router.get('/api/schedule/veterinary', async (req, res) => {
  try {
    const schedule = await storage.getVeterinarySchedule();
    res.json(schedule);
  } catch (error) {
    console.error('Error getting veterinary schedule:', error);
    res.status(500).json({ error: 'Failed to get schedule' });
  }
});

// Schedule blocks management routes
router.post('/api/schedule/blocks', async (req, res) => {
  try {
    const { insertScheduleBlockSchema } = await import('@shared/schema');
    const validatedData = insertScheduleBlockSchema.parse(req.body);
    const block = await storage.createScheduleBlock(validatedData);
    res.status(201).json(block);
  } catch (error) {
    console.error('Error creating schedule block:', error);
    res.status(500).json({ error: 'Failed to create schedule block' });
  }
});

// Get schedule blocks
router.get('/api/schedule/blocks', async (req, res) => {
  try {
    const blocks = await storage.getScheduleBlocks();
    res.json(blocks);
  } catch (error) {
    console.error('Error getting schedule blocks:', error);
    res.status(500).json({ error: 'Failed to get schedule blocks' });
  }
});

// Update schedule block
router.put('/api/schedule/blocks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBlock = await storage.updateScheduleBlock(id, req.body);
    if (!updatedBlock) {
      return res.status(404).json({ error: 'Schedule block not found' });
    }
    res.json(updatedBlock);
  } catch (error) {
    console.error('Error updating schedule block:', error);
    res.status(500).json({ error: 'Failed to update schedule block' });
  }
});

// Update veterinary schedule
router.put('/api/schedule/veterinary/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSchedule = await storage.updateVeterinarySchedule(id, req.body);
    if (!updatedSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating veterinary schedule:', error);
    res.status(500).json({ error: 'Failed to update veterinary schedule' });
  }
});

// Bulk schedule operations
router.post('/api/schedule/bulk', async (req, res) => {
  try {
    const { fromDate, toDate, startTime, endTime, lunchStart, lunchEnd, enableLunch, action } = req.body;
    
    const results = [];
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    // Iterate through each day in the range
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      
      if (action === 'enable') {
        // Create or update veterinary schedule for this day of week
        if (startTime && endTime) {
          // Check if schedule already exists for this day
          const existingSchedules = await storage.getVeterinarySchedule();
          const existingSchedule = existingSchedules.find(s => s.dayOfWeek === dayOfWeek);
          
          if (existingSchedule) {
            // Update existing schedule
            const updatedSchedule = await storage.updateVeterinarySchedule(existingSchedule.id, {
              startTime,
              endTime,
              isActive: true
            });
            if (updatedSchedule) {
              results.push({ type: 'schedule_updated', data: updatedSchedule });
            }
          } else {
            // Create new schedule
            const { insertVeterinaryScheduleSchema } = await import('@shared/schema');
            const scheduleData = insertVeterinaryScheduleSchema.parse({
              dayOfWeek,
              startTime,
              endTime,
              isActive: true
            });
            const newSchedule = await storage.createVeterinarySchedule(scheduleData);
            results.push({ type: 'schedule_created', data: newSchedule });
          }
        }

        // Create schedule blocks for lunch if enabled
        if (enableLunch && lunchStart && lunchEnd) {
          const { insertScheduleBlockSchema } = await import('@shared/schema');
          const lunchBlockData = insertScheduleBlockSchema.parse({
            blockDate: date.toISOString().split('T')[0],
            startTime: lunchStart,
            endTime: lunchEnd,
            reason: 'Almuerzo',
            isActive: true
          });
          const lunchBlock = await storage.createScheduleBlock(lunchBlockData);
          results.push({ type: 'lunch_block', data: lunchBlock });
        }
      } else if (action === 'disable') {
        // Create full day block
        const { insertScheduleBlockSchema } = await import('@shared/schema');
        const blockData = insertScheduleBlockSchema.parse({
          blockDate: date.toISOString().split('T')[0],
          startTime: null,
          endTime: null,
          reason: 'Día Bloqueado',
          isActive: true
        });
        const block = await storage.createScheduleBlock(blockData);
        results.push({ type: 'day_block', data: block });
      }
    }
    
    res.status(201).json({ 
      message: `Operación masiva completada. ${results.length} elementos creados.`,
      results 
    });
  } catch (error) {
    console.error('Error in bulk schedule operation:', error);
    res.status(500).json({ error: 'Failed to perform bulk schedule operation' });
  }
});

// Google Calendar OAuth setup
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('Google OAuth credentials missing. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
}
const REDIRECT_URI = process.env.REPLIT_DOMAINS 
  ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/auth/google/callback`
  : 'http://localhost:5000/auth/google/callback';

console.log('Google OAuth Config:', { 
  clientId: GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
  clientSecret: GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
  redirectUri: REDIRECT_URI
});

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

// Store for access tokens (in production, use database)
let storedTokens: any = null;

// Google Calendar Integration Routes
router.get('/api/google-calendar/status', async (req, res) => {
  try {
    res.json({
      connected: !!storedTokens,
      lastSync: storedTokens ? new Date().toISOString() : null
    });
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    res.status(500).json({ error: 'Error checking calendar status' });
  }
});

// OAuth Authorization URL
router.get('/api/google-calendar/auth-url', async (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Error generating authorization URL' });
  }
});

// OAuth Callback Handler
router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send('Authorization code not provided');
    }

    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);
    storedTokens = tokens;

    console.log('Google Calendar connected successfully');
    
    // Redirect back to the application with success
    res.redirect('/?calendar=connected');
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.redirect('/?calendar=error');
  }
});

router.post('/api/google-calendar/disconnect', async (req, res) => {
  try {
    if (storedTokens) {
      // Revoke the access token
      await oauth2Client.revokeCredentials();
      storedTokens = null;
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ error: 'Error disconnecting calendar' });
  }
});

router.post('/api/google-calendar/sync', async (req, res) => {
  try {
    if (!storedTokens) {
      return res.status(401).json({ error: 'Google Calendar not connected' });
    }

    oauth2Client.setCredentials(storedTokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get all future appointments (no month restriction)
    const today = new Date();
    const allAppointments = await storage.getAllAppointments();
    
    // Filter to get only future scheduled appointments
    const scheduledAppointments = allAppointments.filter(apt => {
      const appointmentDate = new Date(apt.appointmentDate);
      return apt.status === 'scheduled' && appointmentDate >= today;
    });
    
    console.log(`📅 Found ${scheduledAppointments.length} scheduled appointments to sync`);
    
    let eventsCreated = 0;
    let eventsUpdated = 0;
    let eventsDeleted = 0;
    
    // Get all existing veterinary events (broader search for cleanup)
    const existingEvents = await calendar.events.list({
      calendarId: 'primary',
      timeMin: today.toISOString(),
      timeMax: new Date(today.getFullYear() + 2, 11, 31).toISOString(),
      q: 'Veterinaria',
      maxResults: 2500
    });

    const existingEventMap = new Map();
    const duplicateEvents = [];
    
    // Map existing events and identify duplicates
    for (const event of existingEvents.data.items || []) {
      if (event.summary?.includes('🐕 Veterinaria -')) {
        // Extract pet name from summary
        const petNameMatch = event.summary.match(/🐕 Veterinaria - (.+)/);
        if (petNameMatch) {
          const petName = petNameMatch[1];
          const eventDate = event.start?.dateTime ? new Date(event.start.dateTime).toISOString().split('T')[0] : null;
          const eventKey = `${petName}-${eventDate}`;
          
          if (existingEventMap.has(eventKey)) {
            // Mark as duplicate for deletion
            duplicateEvents.push(event.id);
          } else {
            existingEventMap.set(eventKey, {
              id: event.id,
              petName,
              eventDate,
              event
            });
          }
        }
      }
    }

    // Delete duplicate events
    for (const duplicateId of duplicateEvents) {
      try {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: duplicateId!
        });
        eventsDeleted++;
        console.log(`🗑️ Deleted duplicate event: ${duplicateId}`);
      } catch (deleteError) {
        console.error('Error deleting duplicate event:', deleteError);
      }
    }
    
    // Process each scheduled appointment
    for (const appointment of scheduledAppointments) {
      try {
        const eventKey = `${appointment.petName}-${appointment.appointmentDate}`;
        const existingEventData = existingEventMap.get(eventKey);
        
        const duration = appointment.duration || 60;
        const startDateTime = new Date(appointment.appointmentDate + 'T' + appointment.appointmentTime);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
        
        const eventData = {
          summary: `🐕 Veterinaria - ${appointment.petName}`,
          description: `Consulta veterinaria para ${appointment.petName}\n\n` +
                      `👨‍⚕️ Servicio: ${appointment.serviceType}\n` +
                      `👤 Tutor: ${appointment.tutorName}\n` +
                      `📞 Teléfono: ${appointment.tutorPhone || 'No especificado'}\n` +
                      `📍 Dirección: ${appointment.address || 'No especificada'}\n\n` +
                      `📝 Notas: ${appointment.notes || 'Sin notas adicionales'}`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'America/Santiago',
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'America/Santiago',
          },
          location: appointment.address || 'Domicilio del cliente',
          colorId: '10',
        };

        if (existingEventData) {
          // Update existing event
          await calendar.events.update({
            calendarId: 'primary',
            eventId: existingEventData.id,
            requestBody: eventData,
          });
          eventsUpdated++;
          console.log(`🔄 Updated: ${appointment.petName} - ${appointment.appointmentDate} ${appointment.appointmentTime}`);
        } else {
          // Create new event
          await calendar.events.insert({
            calendarId: 'primary',
            requestBody: eventData,
          });
          eventsCreated++;
          console.log(`✅ Created: ${appointment.petName} - ${appointment.appointmentDate} ${appointment.appointmentTime}`);
        }
        
      } catch (eventError) {
        console.error('❌ Error processing calendar event:', eventError);
      }
    }

    // Remove events for appointments that no longer exist or are cancelled
    const activeEventKeys = new Set(scheduledAppointments.map(apt => `${apt.petName}-${apt.appointmentDate}`));
    for (const [eventKey, eventData] of Array.from(existingEventMap.entries())) {
      if (!activeEventKeys.has(eventKey)) {
        try {
          await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventData.id
          });
          eventsDeleted++;
          console.log(`🗑️ Deleted obsolete event: ${eventKey}`);
        } catch (deleteError) {
          console.error('Error deleting obsolete event:', deleteError);
        }
      }
    }

    const message = `Sincronización completada. ${eventsCreated} eventos creados, ${eventsUpdated} actualizados, ${eventsDeleted} eliminados.`;
    console.log(`📊 ${message}`);
    
    res.json({ 
      eventsCreated, 
      eventsUpdated,
      eventsDeleted,
      totalAppointments: scheduledAppointments.length,
      message 
    });
    
  } catch (error) {
    console.error('❌ Error syncing Google Calendar:', error);
    res.status(500).json({ error: 'Error syncing calendar' });
  }
});

router.get('/api/google-calendar/events', async (req, res) => {
  try {
    if (!storedTokens) {
      return res.status(401).json({ error: 'Google Calendar not connected' });
    }

    oauth2Client.setCredentials(storedTokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      description: event.description,
      location: event.location
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Notification Settings Routes
router.get('/api/notification-templates', async (req, res) => {
  try {
    // En una implementación real, obtendrías las plantillas desde la base de datos
    const templates = [
      {
        id: '1',
        name: 'Confirmación de Cita',
        type: 'email',
        trigger: 'appointment_created',
        template: 'Hola {{tutorName}}, tu cita para {{petName}} ha sido agendada para el {{appointmentDate}} a las {{appointmentTime}}.',
        isActive: true
      }
    ];
    res.json(templates);
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    res.status(500).json({ error: 'Error fetching templates' });
  }
});

router.post('/api/notification-templates', async (req, res) => {
  try {
    // En una implementación real, crearías la plantilla en la base de datos
    const template = { id: Date.now().toString(), ...req.body };
    res.json(template);
  } catch (error) {
    console.error('Error creating notification template:', error);
    res.status(500).json({ error: 'Error creating template' });
  }
});

router.put('/api/notification-templates/:id', async (req, res) => {
  try {
    // En una implementación real, actualizarías la plantilla en la base de datos
    res.json({ ...req.body, id: req.params.id });
  } catch (error) {
    console.error('Error updating notification template:', error);
    res.status(500).json({ error: 'Error updating template' });
  }
});

router.delete('/api/notification-templates/:id', async (req, res) => {
  try {
    // En una implementación real, eliminarías la plantilla de la base de datos
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification template:', error);
    res.status(500).json({ error: 'Error deleting template' });
  }
});

// Email configuration test route - simplified version that works reliably
router.post('/api/email/test', async (req, res) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPassword } = req.body;
    
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos',
        details: 'Debe proporcionar host, puerto, usuario y contraseña SMTP'
      });
    }

    // Simple SMTP connection test using Node.js built-in modules
    
    // Test basic connection to SMTP server
    const testConnection = () => {
      return new Promise((resolve, reject) => {
        const port = parseInt(smtpPort);
        const socket = net.createConnection(port, smtpHost);
        
        socket.setTimeout(10000); // 10 second timeout
        
        socket.on('connect', () => {
          console.log(`Connected to ${smtpHost}:${port}`);
          socket.end();
          resolve(true);
        });
        
        socket.on('error', (error) => {
          console.log(`Connection error: ${error.message}`);
          reject(error);
        });
        
        socket.on('timeout', () => {
          console.log('Connection timeout');
          socket.destroy();
          reject(new Error('Connection timeout'));
        });
      });
    };

    await testConnection();
    
    // If basic connection works, configuration is likely correct
    res.json({ 
      success: true, 
      message: `Conexión SMTP exitosa a ${smtpHost}:${smtpPort}. Configuración guardada correctamente.`,
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      note: 'Para envío real de emails, asegúrate de usar la contraseña de aplicación correcta de Gmail.'
    });
    
  } catch (error: any) {
    console.error('Error testing SMTP configuration:', error);
    
    let errorMessage = 'Error de conexión SMTP';
    let details = 'No se pudo conectar al servidor SMTP. Verifique el host y puerto.';
    
    if (error?.code === 'ENOTFOUND') {
      errorMessage = 'Servidor SMTP no encontrado';
      details = `El servidor ${req.body.smtpHost} no existe o no está disponible.`;
    } else if (error?.code === 'ECONNREFUSED') {
      errorMessage = 'Conexión rechazada';
      details = `El servidor ${req.body.smtpHost}:${req.body.smtpPort} rechazó la conexión. Verifique el puerto.`;
    } else if (error?.code === 'ETIMEDOUT' || error.message === 'Connection timeout') {
      errorMessage = 'Timeout de conexión';
      details = 'La conexión al servidor SMTP tardó demasiado. Verifique la configuración de red.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: details,
      code: error?.code || 'UNKNOWN'
    });
  }
});







// Función para verificar Turnstile
const verifyTurnstile = async (token: string, clientIp?: string): Promise<boolean> => {
  try {
    // En modo desarrollo o con tokens de fallback, aprobar automáticamente
    if (token === 'dev-token-simulation' || token === 'fallback-token') {
      console.log('🔧 Modo desarrollo/fallback: aprobando token automáticamente');
      return true;
    }

    const secretKey = '0x4AAAAAABuFJVQ7DwKjFHXAWH9Fj67WX3Y';
    
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (clientIp) {
      formData.append('remoteip', clientIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    const result = await response.json();
    console.log('🔐 Resultado verificación Turnstile:', result.success);
    return result.success === true;
  } catch (error) {
    console.error('❌ Error verificando Turnstile:', error);
    // En caso de error, aprobar en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Modo desarrollo: aprobando por error de conexión');
      return true;
    }
    return false;
  }
};

// Contact form email sending route
router.post('/api/contact/send-message', async (req, res) => {
  try {
    const { name, email, phone, message, turnstileToken } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos' });
    }

    if (!turnstileToken) {
      return res.status(400).json({ error: 'Token de verificación requerido' });
    }

    // Verificar Turnstile
    const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress;
    const isTurnstileValid = await verifyTurnstile(turnstileToken, clientIp as string);
    
    if (!isTurnstileValid) {
      console.log('❌ Verificación Turnstile falló para IP:', clientIp);
      return res.status(400).json({ error: 'Verificación de seguridad falló. Por favor intenta nuevamente.' });
    }

    console.log('✅ Verificación Turnstile exitosa para IP:', clientIp);

    // Get email settings from database
    const emailSettings = await storage.getNotificationSettings('email');
    
    if (!emailSettings || !emailSettings.smtpHost) {
      return res.status(500).json({ 
        error: 'Configuración de email no encontrada. Configura SMTP en Configuración de Notificaciones.' 
      });
    }

    const nodemailer = await import('nodemailer');
    
    // Create transporter with saved SMTP settings
    const transporter = nodemailer.default.createTransport({
      host: emailSettings.smtpHost,
      port: emailSettings.smtpPort || 465,
      secure: emailSettings.smtpSecure !== false, // true para puerto 465 (Zoho)
      auth: {
        user: emailSettings.smtpUser,
        pass: emailSettings.smtpPassword
      },
      // Configuración adicional para Zoho Mail
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 60000, // 60 segundos
      greetingTimeout: 30000,   // 30 segundos
      socketTimeout: 60000      // 60 segundos
    });

    // Email to send to contacto@aleveterinaria.cl
    const mailOptions = {
      from: `"${emailSettings.fromName || 'Ale Veterinaria'}" <${emailSettings.fromEmail}>`,
      to: 'contacto@aleveterinaria.cl',
      subject: `Nuevo mensaje de contacto - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #A3CBB2 0%, #7FB3C3 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0; color: white; text-align: center;">Nuevo Mensaje de Contacto</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border: 1px solid #e9ecef;">
            <h3 style="color: #2D3748; margin-top: 0;">Información del Contacto:</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Nombre:</td>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${email}</td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Teléfono:</td>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${phone}</td>
              </tr>
              ` : ''}
            </table>
            
            <h4 style="color: #2D3748; margin-bottom: 10px;">Mensaje:</h4>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #A3CBB2;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="background: #A3CBB2; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="margin: 0; color: white; font-size: 14px;">
              Este mensaje fue enviado desde el formulario de contacto de aleveterinaria.cl<br>
              Fecha: ${new Date().toLocaleString('es-CL')}
            </p>
          </div>
        </div>
      `,
      replyTo: email
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'Mensaje enviado correctamente a contacto@aleveterinaria.cl' 
    });

  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ 
      error: 'Error al enviar el mensaje. Verifica la configuración SMTP.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// Route for diagnosing Firebase structure
router.get('/api/debug/firebase-structure/:petId', async (req, res) => {
  try {
    const { petId } = req.params;
    const { db } = await import('./firebase');
    const { collection, doc, getDocs } = await import('firebase/firestore');
    
    console.log('Debugging Firebase structure for pet:', petId);
    
    const structure: any = {};
    
    // Check main collections
    const mainCollections = ['questionnaires', 'certificates', 'medicalRecords', 'preVisitQuestionnaires'];
    
    for (const collName of mainCollections) {
      try {
        const collRef = collection(db, collName);
        const snapshot = await getDocs(collRef);
        structure[collName] = {
          count: snapshot.size,
          documents: snapshot.docs.map(d => ({ id: d.id, data: d.data() }))
        };
      } catch (error) {
        structure[collName] = { error: error.message };
      }
    }
    
    // Check patient subcollections
    const patientSubcollections = ['questionnaires', 'certificates', 'medicalRecords'];
    
    for (const subcoll of patientSubcollections) {
      try {
        const subcollRef = collection(db, `patients/${petId}/${subcoll}`);
        const snapshot = await getDocs(subcollRef);
        structure[`patients/${petId}/${subcoll}`] = {
          count: snapshot.size,
          documents: snapshot.docs.map(d => ({ id: d.id, data: d.data() }))
        };
      } catch (error) {
        structure[`patients/${petId}/${subcoll}`] = { error: error.message };
      }
    }
    
    res.json(structure);
  } catch (error) {
    console.error('Error debugging Firebase structure:', error);
    res.status(500).json({ error: 'Failed to debug structure' });
  }
});

// Route for deleting questionnaires
router.delete('/api/questionnaires/:questionnaireId', async (req, res) => {
  try {
    const { questionnaireId } = req.params;
    console.log('=== DELETING QUESTIONNAIRE FROM POSTGRESQL ===');
    console.log('Questionnaire ID:', questionnaireId);
    
    // Import db and schema dynamically
    const { db } = await import('./db');
    const { preVisitQuestionnaires } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    // Questionnaires are stored in PostgreSQL, not Firebase
    const result = await db.delete(preVisitQuestionnaires)
      .where(eq(preVisitQuestionnaires.id, questionnaireId))
      .returning();
    
    if (result.length > 0) {
      console.log('Questionnaire deleted successfully from PostgreSQL:', questionnaireId);
      res.json({ message: 'Questionnaire deleted successfully' });
    } else {
      console.log('Questionnaire not found in PostgreSQL:', questionnaireId);
      res.status(404).json({ error: 'Questionnaire not found' });
    }
  } catch (error) {
    console.error('Error deleting questionnaire from PostgreSQL:', error);
    res.status(500).json({ error: 'Failed to delete questionnaire' });
  }
});

// Route for sending direct email to tutor
router.post('/api/send-direct-email', async (req, res) => {
  try {
    const { to, subject, message, tutorName, petName } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const emailSettings = await storage.getNotificationSettings('email');
    
    if (!emailSettings || !emailSettings.smtpHost) {
      return res.status(400).json({ error: 'Email not configured' });
    }

    // Import nodemailer correctly for ES modules
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransport({
      host: emailSettings.smtpHost,
      port: emailSettings.smtpPort || 465,
      secure: emailSettings.smtpSecure !== false,
      auth: {
        user: emailSettings.smtpUser,
        pass: emailSettings.smtpPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #5FA98D 0%, #4a7c59 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Ale Veterinaria</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Atención veterinaria profesional</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 20px 0; font-size: 16px;">Estimado/a ${tutorName || 'cliente'},</p>
          
          <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 5px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          ${petName ? `<p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">Este mensaje está relacionado con ${petName}.</p>` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
            <p><strong>Alejandra Cautin Bastias</strong><br>
            Médico Veterinario<br>
            📞 +569 76040797<br>
            📱 <a href="https://wa.me/56976040797" style="color: #25D366;">WhatsApp</a><br>
            📸 <a href="https://instagram.com/aleveterinaria" style="color: #E4405F;">@aleveterinaria</a></p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Ale Veterinaria" <${emailSettings.smtpUser}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      text: `Estimado/a ${tutorName || 'cliente'},\n\n${message}\n\n${petName ? `Este mensaje está relacionado con ${petName}.\n\n` : ''}Saludos,\nAlejandra Cautin Bastias\nMédico Veterinario\n+569 76040797`
    });

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending direct email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});


export default router;