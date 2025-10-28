import { 
  users, pets, medicalRecords, vaccinations, dewormings, examinations, certificates, preVisitQuestionnaires,
  appointments, veterinarySchedule, scheduleBlocks, notificationSettings, examDocuments,
  type User, type InsertUser, 
  type Pet, type InsertPet,
  type MedicalRecord, type InsertMedicalRecord,
  type Vaccination, type InsertVaccination,
  type Deworming, type InsertDeworming,
  type Examination, type InsertExamination,
  type Certificate, type InsertCertificate,
  type PreVisitQuestionnaire, type InsertPreVisitQuestionnaire,
  type Appointment, type InsertAppointment,
  type VeterinarySchedule, type InsertVeterinarySchedule,
  type ScheduleBlock, type InsertScheduleBlock,
  type ExamDocument, type InsertExamDocument
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { getServiceDuration, MIN_APPOINTMENT_SEPARATION } from '@shared/serviceTypes';

// Enhanced interface with all veterinary data methods
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Pets
  createPet(pet: InsertPet): Promise<Pet>;
  getPet(id: string): Promise<Pet | undefined>;
  getPetsByOwner(ownerId: string): Promise<Pet[]>;
  getPetsByTutorRut(tutorRut: string): Promise<Pet[]>;
  updatePet(id: string, pet: Partial<InsertPet>): Promise<Pet>;
  updatePetPhoto(id: string, photoURL: string): Promise<Pet | null>;
  
  // Medical Records
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  getMedicalRecord(id: string): Promise<MedicalRecord | undefined>;
  getMedicalRecordsByPet(petId: string): Promise<MedicalRecord[]>;
  
  // Vaccinations
  createVaccination(vaccination: InsertVaccination): Promise<Vaccination>;
  getVaccinationsByPet(petId: string): Promise<Vaccination[]>;
  
  // Dewormings
  createDeworming(deworming: InsertDeworming): Promise<Deworming>;
  getDewormingsByPet(petId: string): Promise<Deworming[]>;
  
  // Examinations
  createExamination(examination: InsertExamination): Promise<Examination>;
  getExaminationsByPet(petId: string): Promise<Examination[]>;
  updateExamination(id: string, examination: Partial<InsertExamination>): Promise<Examination>;
  
  // Exam Documents
  createExamDocument(examDocument: InsertExamDocument): Promise<ExamDocument>;
  getExamDocumentsByPet(petId: string): Promise<ExamDocument[]>;
  deleteExamDocument(id: string): Promise<ExamDocument | null>;
  
  // Certificates
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getCertificatesByPet(petId: string): Promise<Certificate[]>;
  
  // Questionnaires
  createQuestionnaire(questionnaire: InsertPreVisitQuestionnaire): Promise<PreVisitQuestionnaire>;
  getQuestionnaire(id: string): Promise<PreVisitQuestionnaire | undefined>;
  getAllQuestionnaires(): Promise<PreVisitQuestionnaire[]>;
  getQuestionnairesByAppointment(appointmentId: string): Promise<PreVisitQuestionnaire[]>;
  getQuestionnairesByPet(petId: string): Promise<PreVisitQuestionnaire[]>;
  
  // Appointments
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAppointmentsByTutorRut(rut: string): Promise<Appointment[]>;
  getAppointmentsByYearMonth(year: number, month: number): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | null>;
  getAppointmentById(id: string): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<Appointment | null>;
  
  // Schedule Management
  getVeterinarySchedule(): Promise<VeterinarySchedule[]>;
  createVeterinarySchedule(schedule: InsertVeterinarySchedule): Promise<VeterinarySchedule>;
  updateVeterinarySchedule(id: string, schedule: Partial<InsertVeterinarySchedule>): Promise<VeterinarySchedule | null>;
  createScheduleBlock(block: InsertScheduleBlock): Promise<ScheduleBlock>;
  getScheduleBlocks(): Promise<ScheduleBlock[]>;
  updateScheduleBlock(id: string, block: Partial<InsertScheduleBlock>): Promise<ScheduleBlock | null>;
  getAvailableSlots(date: string): Promise<string[]>;
  
  // Notification Settings
  getNotificationSettings(type: string): Promise<any | undefined>;
  saveNotificationSettings(settings: any): Promise<any>;
  updateNotificationSettings(type: string, settings: any): Promise<any | null>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('User already exists');
      }
      throw error;
    }
  }

  // Pets
  async createPet(insertPet: InsertPet): Promise<Pet> {
    const [pet] = await db.insert(pets).values(insertPet).returning();
    return pet;
  }

  async getPet(id: string): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || undefined;
  }

  async getPetsByOwner(ownerId: string): Promise<Pet[]> {
    return await db.select().from(pets).where(eq(pets.ownerId, ownerId));
  }

  async getPetsByTutorRut(tutorRut: string): Promise<Pet[]> {
    const cleanRut = tutorRut.replace(/\D/g, '');
    
    // First try to get pets from the pets table
    const appointmentPets = await db
      .select({ petId: appointments.petId })
      .from(appointments)
      .where(eq(appointments.tutorRut, cleanRut));
    
    if (appointmentPets.length === 0) {
      return [];
    }
    
    // Get unique pet IDs
    const petIds = Array.from(new Set(appointmentPets.map(ap => ap.petId)));
    
    // Try to get pets from pets table first
    const existingPets = await db.select().from(pets).where(
      sql`${pets.id} IN (${sql.join(petIds.map(id => sql`${id}`), sql`,`)})`
    );
    
    if (existingPets.length > 0) {
      return existingPets;
    }
    
    // If no pets found in pets table, create pseudo pets from appointment data
    const appointmentsData = await db
      .select({
        petId: appointments.petId,
        petName: appointments.petName,
        tutorName: appointments.tutorName,
        tutorRut: appointments.tutorRut
      })
      .from(appointments)
      .where(eq(appointments.tutorRut, cleanRut));
    
    // Create pseudo pets from appointment data
    const pseudoPets = appointmentsData.map(apt => ({
      id: apt.petId,
      ownerId: apt.tutorRut, // Use RUT as owner ID temporarily
      name: apt.petName || 'Sin nombre',
      species: 'Canino' as const, // Default species
      breed: null,
      sex: null,
      birthDate: null,
      weight: null,
      color: null,
      microchip: null,
      photo: null,
      recordNumber: null,
      sterilized: false,
      sterilizationDate: null,
      allergies: null,
      chronicConditions: null,
      currentMedications: null,
      diet: null,
      activityLevel: null,
      anamnesis: null,
      createdAt: new Date(),
    }));
    
    // Remove duplicates
    const uniquePseudoPets = pseudoPets.filter((pet, index, self) => 
      index === self.findIndex(p => p.id === pet.id)
    );
    
    return uniquePseudoPets;
  }

  async updatePet(id: string, updatePet: Partial<InsertPet>): Promise<Pet> {
    const [pet] = await db.update(pets).set(updatePet).where(eq(pets.id, id)).returning();
    return pet;
  }

  async updatePetPhoto(id: string, photoURL: string): Promise<Pet | null> {
    try {
      const [pet] = await db.update(pets).set({ photo: photoURL }).where(eq(pets.id, id)).returning();
      return pet || null;
    } catch (error) {
      console.error('Error updating pet photo in database:', error);
      return null;
    }
  }

  // Medical Records
  async createMedicalRecord(insertRecord: InsertMedicalRecord): Promise<MedicalRecord> {
    const [record] = await db.insert(medicalRecords).values(insertRecord).returning();
    return record;
  }

  async getMedicalRecord(id: string): Promise<MedicalRecord | undefined> {
    const [record] = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id));
    return record || undefined;
  }

  async getMedicalRecordsByPet(petId: string): Promise<MedicalRecord[]> {
    return await db.select().from(medicalRecords).where(eq(medicalRecords.petId, petId));
  }

  // Vaccinations
  async createVaccination(insertVaccination: InsertVaccination): Promise<Vaccination> {
    const [vaccination] = await db.insert(vaccinations).values(insertVaccination).returning();
    return vaccination;
  }

  async getVaccinationsByPet(petId: string): Promise<Vaccination[]> {
    return await db.select().from(vaccinations).where(eq(vaccinations.petId, petId));
  }

  // Dewormings
  async createDeworming(insertDeworming: InsertDeworming): Promise<Deworming> {
    const [deworming] = await db.insert(dewormings).values(insertDeworming).returning();
    return deworming;
  }

  async getDewormingsByPet(petId: string): Promise<Deworming[]> {
    return await db.select().from(dewormings).where(eq(dewormings.petId, petId));
  }

  // Examinations
  async createExamination(insertExamination: InsertExamination): Promise<Examination> {
    const [examination] = await db.insert(examinations).values(insertExamination).returning();
    return examination;
  }

  async getExaminationsByPet(petId: string): Promise<Examination[]> {
    return await db.select().from(examinations).where(eq(examinations.petId, petId));
  }

  async updateExamination(id: string, examination: Partial<InsertExamination>): Promise<Examination> {
    const [updated] = await db
      .update(examinations)
      .set(examination)
      .where(eq(examinations.id, id))
      .returning();
    return updated;
  }

  async createExamDocument(examDocument: InsertExamDocument): Promise<ExamDocument> {
    const [newExamDocument] = await db.insert(examDocuments).values(examDocument).returning();
    return newExamDocument;
  }

  async getExamDocumentsByPet(petId: string): Promise<ExamDocument[]> {
    return await db.select().from(examDocuments).where(eq(examDocuments.petId, petId));
  }

  async deleteExamDocument(id: string): Promise<ExamDocument | null> {
    const [deleted] = await db
      .delete(examDocuments)
      .where(eq(examDocuments.id, id))
      .returning();
    return deleted || null;
  }

  // Certificates
  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const [certificate] = await db.insert(certificates).values(insertCertificate).returning();
    return certificate;
  }

  async getCertificatesByPet(petId: string): Promise<Certificate[]> {
    return await db.select().from(certificates).where(eq(certificates.petId, petId));
  }

  // Questionnaires
  async createQuestionnaire(insertQuestionnaire: InsertPreVisitQuestionnaire): Promise<PreVisitQuestionnaire> {
    const [questionnaire] = await db.insert(preVisitQuestionnaires).values(insertQuestionnaire).returning();
    return questionnaire;
  }

  async getQuestionnaire(id: string): Promise<PreVisitQuestionnaire | undefined> {
    const [questionnaire] = await db.select().from(preVisitQuestionnaires).where(eq(preVisitQuestionnaires.id, id));
    return questionnaire || undefined;
  }

  async getAllQuestionnaires(): Promise<PreVisitQuestionnaire[]> {
    return await db.select().from(preVisitQuestionnaires);
  }

  async getQuestionnairesByAppointment(appointmentId: string): Promise<PreVisitQuestionnaire[]> {
    return await db.select().from(preVisitQuestionnaires)
      .where(eq(preVisitQuestionnaires.appointmentId, appointmentId));
  }

  async getQuestionnairesByPet(petId: string): Promise<PreVisitQuestionnaire[]> {
    return await db.select().from(preVisitQuestionnaires)
      .where(eq(preVisitQuestionnaires.petId, petId));
  }

  // Appointment management
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.appointmentDate, date));
  }

  async getAppointmentsByTutorRut(rut: string): Promise<Appointment[]> {
    const cleanRut = rut.replace(/\D/g, '');
    return await db.select().from(appointments).where(eq(appointments.tutorRut, cleanRut));
  }

  async getAppointmentsByYearMonth(year: number, month: number): Promise<Appointment[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    return await db.select().from(appointments).where(
      and(
        gte(appointments.appointmentDate, startDate),
        lte(appointments.appointmentDate, endDate)
      )
    );
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(appointments.appointmentDate, appointments.appointmentTime);
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | null> {
    const [updated] = await db
      .update(appointments)
      .set({ ...appointment, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updated || null;
  }

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return appointment || undefined;
  }

  async deleteAppointment(id: string): Promise<Appointment | null> {
    const [deleted] = await db
      .delete(appointments)
      .where(eq(appointments.id, id))
      .returning();
    return deleted || null;
  }

  async getVeterinarySchedule(): Promise<VeterinarySchedule[]> {
    return await db.select().from(veterinarySchedule).where(eq(veterinarySchedule.isActive, true));
  }

  async createVeterinarySchedule(schedule: InsertVeterinarySchedule): Promise<VeterinarySchedule> {
    const [newSchedule] = await db.insert(veterinarySchedule).values(schedule).returning();
    return newSchedule;
  }

  async updateVeterinarySchedule(id: string, schedule: Partial<InsertVeterinarySchedule>): Promise<VeterinarySchedule | null> {
    const [updated] = await db
      .update(veterinarySchedule)
      .set(schedule)
      .where(eq(veterinarySchedule.id, id))
      .returning();
    return updated || null;
  }

  async createScheduleBlock(block: InsertScheduleBlock): Promise<ScheduleBlock> {
    const [newBlock] = await db.insert(scheduleBlocks).values(block).returning();
    return newBlock;
  }

  async getScheduleBlocks(): Promise<ScheduleBlock[]> {
    return await db.select().from(scheduleBlocks).where(eq(scheduleBlocks.isActive, true));
  }

  async updateScheduleBlock(id: string, block: Partial<InsertScheduleBlock>): Promise<ScheduleBlock | null> {
    const [updated] = await db
      .update(scheduleBlocks)
      .set(block)
      .where(eq(scheduleBlocks.id, id))
      .returning();
    return updated || null;
  }

  async getAvailableSlots(date: string, requestedServiceType?: string, editingAppointmentId?: string): Promise<string[]> {
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    
    // Get schedule for the day
    const scheduleForDay = await db
      .select()
      .from(veterinarySchedule)
      .where(and(eq(veterinarySchedule.dayOfWeek, dayOfWeek), eq(veterinarySchedule.isActive, true)));
    
    if (scheduleForDay.length === 0) return [];
    
    // Get blocks for this specific date
    const blocksForDate = await db
      .select()
      .from(scheduleBlocks)
      .where(and(eq(scheduleBlocks.blockDate, date), eq(scheduleBlocks.isActive, true)));
    
    // Get existing appointments with their service types and durations
    let existingAppointments = await this.getAppointmentsByDate(date);
    
    // If editing an appointment, exclude it from conflicts so we can reschedule it
    if (editingAppointmentId) {
      existingAppointments = existingAppointments.filter(apt => apt.id !== editingAppointmentId);
    }
    
    const availableSlots: string[] = [];
    
    // Helper function to convert time string to minutes since midnight
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    // Helper function to convert minutes since midnight to time string
    const minutesToTime = (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };
    
    // Helper function to check if a time slot conflicts with existing appointments
    const hasConflict = (slotStart: number, slotDuration: number): boolean => {
      const slotEnd = slotStart + slotDuration;
      
      return existingAppointments.some(apt => {
        const aptStart = timeToMinutes(apt.appointmentTime);
        const aptDuration = getServiceDuration(apt.serviceType);
        const aptEnd = aptStart + aptDuration;
        
        // Check for overlap: slot starts before appointment ends AND slot ends after appointment starts
        return slotStart < aptEnd && slotEnd > aptStart;
      });
    };
    
    scheduleForDay.forEach(schedule => {
      const scheduleStart = timeToMinutes(schedule.startTime);
      const scheduleEnd = timeToMinutes(schedule.endTime);
      const requestedDuration = requestedServiceType ? getServiceDuration(requestedServiceType) : 30;
      
      // Generate 30-minute interval slots
      for (let currentMinutes = scheduleStart; currentMinutes < scheduleEnd; currentMinutes += MIN_APPOINTMENT_SEPARATION) {
        const currentTime = minutesToTime(currentMinutes);
        const slotEnd = currentMinutes + requestedDuration;
        
        // Check if the entire duration fits within schedule
        if (slotEnd > scheduleEnd) continue;
        
        // Check if this time is blocked by any schedule block
        const isBlocked = blocksForDate.some(block => {
          if (!block.startTime || !block.endTime) {
            // Full day block
            return true;
          }
          // Time range block - check if slot overlaps with block
          const blockStart = timeToMinutes(block.startTime);
          const blockEnd = timeToMinutes(block.endTime);
          return currentMinutes < blockEnd && slotEnd > blockStart;
        });
        
        // Check for conflicts with existing appointments
        const hasAppointmentConflict = hasConflict(currentMinutes, requestedDuration);
        
        // Add slot if not blocked and no conflicts
        if (!isBlocked && !hasAppointmentConflict) {
          availableSlots.push(currentTime);
        }
      }
    });
    
    return availableSlots.sort();
  }

  async isDateCompletelyBlocked(date: string): Promise<boolean> {
    // Get blocks for this specific date
    const blocksForDate = await db
      .select()
      .from(scheduleBlocks)
      .where(and(eq(scheduleBlocks.blockDate, date), eq(scheduleBlocks.isActive, true)));
    
    // Check if there's a full-day block (no startTime or endTime)
    const hasFullDayBlock = blocksForDate.some(block => !block.startTime || !block.endTime);
    
    if (hasFullDayBlock) {
      return true;
    }

    // Check if the day has no regular schedule
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    
    const scheduleForDay = await db
      .select()
      .from(veterinarySchedule)
      .where(and(eq(veterinarySchedule.dayOfWeek, dayOfWeek), eq(veterinarySchedule.isActive, true)));
    
    // If no schedule exists for this day, it's effectively blocked
    return scheduleForDay.length === 0;
  }

  // Notification Settings methods
  async getNotificationSettings(type: string): Promise<any | undefined> {
    const [settings] = await db.select().from(notificationSettings).where(eq(notificationSettings.type, type));
    return settings || undefined;
  }

  async saveNotificationSettings(settings: any): Promise<any> {
    // Check if settings for this type already exist
    const existing = await this.getNotificationSettings(settings.type);
    
    if (existing) {
      // Update existing settings
      const [updated] = await db
        .update(notificationSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(notificationSettings.type, settings.type))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [created] = await db.insert(notificationSettings).values(settings).returning();
      return created;
    }
  }

  async updateNotificationSettings(type: string, settings: any): Promise<any | null> {
    const [updated] = await db
      .update(notificationSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(notificationSettings.type, type))
      .returning();
    return updated || null;
  }
}

export const storage = new DatabaseStorage();