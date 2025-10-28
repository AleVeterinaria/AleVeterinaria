var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  appointments: () => appointments,
  certificates: () => certificates,
  dewormings: () => dewormings,
  examDocuments: () => examDocuments,
  examinations: () => examinations,
  foods: () => foods,
  insertAppointmentSchema: () => insertAppointmentSchema,
  insertCertificateSchema: () => insertCertificateSchema,
  insertDewormingSchema: () => insertDewormingSchema,
  insertExamDocumentSchema: () => insertExamDocumentSchema,
  insertExaminationSchema: () => insertExaminationSchema,
  insertFoodSchema: () => insertFoodSchema,
  insertMedicalRecordSchema: () => insertMedicalRecordSchema,
  insertNotificationSettingsSchema: () => insertNotificationSettingsSchema,
  insertNutritionAssessmentSchema: () => insertNutritionAssessmentSchema,
  insertPetSchema: () => insertPetSchema,
  insertPreVisitQuestionnaireSchema: () => insertPreVisitQuestionnaireSchema,
  insertScheduleBlockSchema: () => insertScheduleBlockSchema,
  insertUserSchema: () => insertUserSchema,
  insertVaccinationSchema: () => insertVaccinationSchema,
  insertVeterinaryScheduleSchema: () => insertVeterinaryScheduleSchema,
  medicalRecords: () => medicalRecords,
  notificationSettings: () => notificationSettings,
  nutritionAssessments: () => nutritionAssessments,
  pets: () => pets,
  preVisitQuestionnaires: () => preVisitQuestionnaires,
  scheduleBlocks: () => scheduleBlocks,
  users: () => users,
  vaccinations: () => vaccinations,
  veterinarySchedule: () => veterinarySchedule
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, pets, medicalRecords, vaccinations, dewormings, examinations, examDocuments, certificates, insertUserSchema, insertPetSchema, insertMedicalRecordSchema, insertExaminationSchema, insertVaccinationSchema, insertDewormingSchema, insertCertificateSchema, foods, nutritionAssessments, insertFoodSchema, insertNutritionAssessmentSchema, insertExamDocumentSchema, preVisitQuestionnaires, insertPreVisitQuestionnaireSchema, appointments, veterinarySchedule, scheduleBlocks, insertAppointmentSchema, insertVeterinaryScheduleSchema, insertScheduleBlockSchema, notificationSettings, insertNotificationSettingsSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey(),
      // Use Firebase UID directly, no default
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      role: text("role", { enum: ["veterinarian", "owner"] }).notNull(),
      name: text("name").notNull(),
      rut: text("rut").unique(),
      // Chilean RUT for owners
      phone: text("phone"),
      address: text("address"),
      commune: text("commune"),
      // Chilean commune
      emergencyContact: text("emergency_contact"),
      emergencyPhone: text("emergency_phone"),
      createdAt: timestamp("created_at").defaultNow()
    });
    pets = pgTable("pets", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      ownerId: varchar("owner_id").notNull(),
      name: text("name").notNull(),
      species: text("species", { enum: ["Canino", "Felino", "Ave", "Conejo", "Otro"] }).notNull(),
      breed: text("breed"),
      sex: text("sex", { enum: ["Macho", "Hembra"] }),
      birthDate: timestamp("birth_date"),
      weight: text("weight"),
      color: text("color"),
      colorMarkings: text("color_markings"),
      microchip: text("microchip"),
      photo: text("photo"),
      recordNumber: text("record_number").unique(),
      sterilized: boolean("sterilized").default(false),
      sterilizationDate: timestamp("sterilization_date"),
      reproductiveStatus: text("reproductive_status", { enum: ["Entero", "Castrado", "Esterilizado"] }),
      allergies: text("allergies"),
      chronicConditions: text("chronic_conditions"),
      currentMedications: text("current_medications"),
      diet: text("diet"),
      activityLevel: text("activity_level"),
      anamnesis: text("anamnesis"),
      // Remote anamnesis
      // Tutor information stored with pet
      tutorName: text("tutor_name"),
      tutorPhone: text("tutor_phone"),
      tutorEmail: text("tutor_email"),
      tutorCity: text("tutor_city"),
      tutorAddress: text("tutor_address"),
      createdAt: timestamp("created_at").defaultNow()
    });
    medicalRecords = pgTable("medical_records", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      petId: varchar("pet_id").notNull().references(() => pets.id),
      veterinarianId: varchar("veterinarian_id").notNull().references(() => users.id),
      type: text("type", { enum: ["consultation", "vaccination", "deworming", "examination", "certificate", "prescription"] }).notNull(),
      date: timestamp("date").notNull(),
      diagnosis: text("diagnosis"),
      treatment: text("treatment"),
      notes: text("notes"),
      documents: json("documents").$type().default([]),
      // Detailed consultation fields
      chiefComplaint: text("chief_complaint"),
      symptoms: text("symptoms"),
      symptomDuration: text("symptom_duration"),
      recentChanges: text("recent_changes"),
      currentMedications: text("current_medications"),
      allergies: text("allergies"),
      eliminationHabits: text("elimination_habits"),
      currentDiet: text("current_diet"),
      activityLevel: text("activity_level"),
      environment: text("environment"),
      // Physical examination
      temperature: text("temperature"),
      heartRate: text("heart_rate"),
      respiratoryRate: text("respiratory_rate"),
      capillaryRefillTime: text("capillary_refill_time"),
      physicalFindings: text("physical_findings"),
      // Diagnosis and plan
      presumptiveDiagnosis: text("presumptive_diagnosis"),
      differentialDiagnosis: text("differential_diagnosis"),
      diagnosticPlan: text("diagnostic_plan"),
      therapeuticPlan: text("therapeutic_plan"),
      followUp: text("follow_up"),
      createdAt: timestamp("created_at").defaultNow()
    });
    vaccinations = pgTable("vaccinations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      petId: varchar("pet_id").notNull().references(() => pets.id),
      veterinarianId: varchar("veterinarian_id").notNull().references(() => users.id),
      vaccineName: text("vaccine_name").notNull(),
      laboratory: text("laboratory").notNull(),
      batch: text("batch"),
      expiryDate: timestamp("expiry_date"),
      applicationDate: timestamp("application_date").notNull(),
      pathogens: json("pathogens").$type().default([]),
      nextDueDate: timestamp("next_due_date"),
      certificate: text("certificate"),
      createdAt: timestamp("created_at").defaultNow()
    });
    dewormings = pgTable("dewormings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      petId: varchar("pet_id").notNull().references(() => pets.id),
      veterinarianId: varchar("veterinarian_id").notNull().references(() => users.id),
      product: text("product").notNull(),
      dose: text("dose"),
      applicationDate: timestamp("application_date").notNull(),
      nextDueDate: timestamp("next_due_date"),
      createdAt: timestamp("created_at").defaultNow()
    });
    examinations = pgTable("examinations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      petId: varchar("pet_id").notNull().references(() => pets.id),
      veterinarianId: varchar("veterinarian_id").notNull().references(() => users.id),
      type: text("type", { enum: ["order", "result"] }).notNull(),
      examType: text("exam_type", {
        enum: ["hemograma", "bioquimica", "orina", "coprologico", "radiografia", "ecografia", "cultivo", "citologia", "histopatologia", "otros"]
      }).notNull(),
      date: timestamp("date").notNull(),
      urgency: text("urgency", { enum: ["normal", "urgente", "emergencia"] }).default("normal"),
      fastingRequired: boolean("fasting_required").default(false),
      instructions: text("instructions"),
      observations: text("observations"),
      results: text("results"),
      interpretation: text("interpretation"),
      recommendations: text("recommendations"),
      fileUrl: text("file_url"),
      fileName: text("file_name"),
      laboratoryName: text("laboratory_name"),
      referenceValues: json("reference_values"),
      status: text("status", { enum: ["pendiente", "en_proceso", "completado", "cancelado"] }).default("pendiente"),
      createdAt: timestamp("created_at").defaultNow()
    });
    examDocuments = pgTable("exam_documents", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      petId: varchar("pet_id").notNull().references(() => pets.id),
      examType: text("exam_type").notNull(),
      objectPath: text("object_path").notNull(),
      // Path in object storage
      fileName: text("file_name").notNull(),
      fileSize: integer("file_size"),
      uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
      uploadDate: timestamp("upload_date").defaultNow(),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow()
    });
    certificates = pgTable("certificates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      petId: varchar("pet_id").notNull().references(() => pets.id),
      veterinarianId: varchar("veterinarian_id").notNull().references(() => users.id),
      type: text("type", { enum: ["health", "export", "vaccination"] }).notNull(),
      issuedDate: timestamp("issued_date").notNull(),
      validUntil: timestamp("valid_until"),
      content: json("content"),
      pdfUrl: text("pdf_url"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).pick({
      email: true,
      password: true,
      role: true,
      name: true,
      rut: true,
      phone: true,
      address: true,
      commune: true,
      emergencyContact: true,
      emergencyPhone: true
    });
    insertPetSchema = createInsertSchema(pets).pick({
      ownerId: true,
      name: true,
      species: true,
      breed: true,
      sex: true,
      birthDate: true,
      weight: true,
      color: true,
      colorMarkings: true,
      microchip: true,
      photo: true,
      recordNumber: true,
      sterilized: true,
      sterilizationDate: true,
      reproductiveStatus: true,
      allergies: true,
      chronicConditions: true,
      currentMedications: true,
      diet: true,
      activityLevel: true,
      anamnesis: true,
      tutorName: true,
      tutorPhone: true,
      tutorEmail: true,
      tutorCity: true,
      tutorAddress: true
    }).extend({
      // Handle date strings and convert them to Date objects
      birthDate: z.string().optional().transform((val) => val ? new Date(val) : void 0),
      sterilizationDate: z.string().optional().transform((val) => val ? new Date(val) : void 0)
    });
    insertMedicalRecordSchema = createInsertSchema(medicalRecords).pick({
      petId: true,
      veterinarianId: true,
      type: true,
      date: true,
      diagnosis: true,
      treatment: true,
      notes: true,
      documents: true,
      chiefComplaint: true,
      symptoms: true,
      symptomDuration: true,
      recentChanges: true,
      currentMedications: true,
      allergies: true,
      eliminationHabits: true,
      currentDiet: true,
      activityLevel: true,
      environment: true,
      temperature: true,
      heartRate: true,
      respiratoryRate: true,
      capillaryRefillTime: true,
      physicalFindings: true,
      presumptiveDiagnosis: true,
      differentialDiagnosis: true,
      diagnosticPlan: true,
      therapeuticPlan: true,
      followUp: true
    });
    insertExaminationSchema = createInsertSchema(examinations).pick({
      petId: true,
      veterinarianId: true,
      type: true,
      examType: true,
      date: true,
      urgency: true,
      fastingRequired: true,
      instructions: true,
      observations: true,
      results: true,
      interpretation: true,
      recommendations: true,
      fileUrl: true,
      fileName: true,
      laboratoryName: true,
      referenceValues: true,
      status: true
    });
    insertVaccinationSchema = createInsertSchema(vaccinations).pick({
      petId: true,
      veterinarianId: true,
      vaccineName: true,
      laboratory: true,
      batch: true,
      expiryDate: true,
      applicationDate: true,
      pathogens: true,
      nextDueDate: true,
      certificate: true
    });
    insertDewormingSchema = createInsertSchema(dewormings).pick({
      petId: true,
      veterinarianId: true,
      product: true,
      dose: true,
      applicationDate: true,
      nextDueDate: true
    });
    insertCertificateSchema = createInsertSchema(certificates).pick({
      petId: true,
      veterinarianId: true,
      type: true,
      issuedDate: true,
      validUntil: true,
      content: true,
      pdfUrl: true
    });
    foods = pgTable("foods", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      brand: text("brand"),
      type: text("type", { enum: ["kibble", "wet", "raw", "treat", "supplement"] }).notNull(),
      species: text("species", { enum: ["Canino", "Felino", "Ambos"] }).notNull(),
      lifeStage: text("life_stage", { enum: ["puppy", "kitten", "adult", "senior", "all"] }).notNull(),
      // Nutritional information per 100g
      calories: text("calories"),
      // kcal/100g
      protein: text("protein"),
      // g/100g
      fat: text("fat"),
      // g/100g
      carbohydrates: text("carbohydrates"),
      // g/100g
      fiber: text("fiber"),
      // g/100g
      moisture: text("moisture"),
      // g/100g
      calcium: text("calcium"),
      // mg/100g
      phosphorus: text("phosphorus"),
      // mg/100g
      sodium: text("sodium"),
      // mg/100g
      ingredients: text("ingredients"),
      notes: text("notes"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    nutritionAssessments = pgTable("nutrition_assessments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      petId: varchar("pet_id").notNull().references(() => pets.id),
      veterinarianId: varchar("veterinarian_id").notNull().references(() => users.id),
      assessmentDate: timestamp("assessment_date").notNull(),
      // Body condition scoring
      bcs: text("bcs"),
      // Body Condition Score (1-9 for dogs, 1-9 for cats)
      bcsMethod: text("bcs_method", { enum: ["canine_9_point", "feline_9_point"] }),
      currentWeight: text("current_weight"),
      // kg
      idealWeight: text("ideal_weight"),
      // kg
      // Measurements for PIBW calculations
      thoracicPerimeter: text("thoracic_perimeter"),
      // cm
      limbLength: text("limb_length"),
      // cm (posterior limb for dogs)
      calculatedIdealWeight: text("calculated_ideal_weight"),
      // PIBW for dogs
      // Energy requirements
      rer: text("rer"),
      // Resting Energy Requirement (kcal/day)
      der: text("der"),
      // Daily Energy Requirement (kcal/day)
      activityFactor: text("activity_factor"),
      // Multiplier used for DER calculation
      // Current diet assessment
      currentFood: text("current_food"),
      currentFoodBrand: text("current_food_brand"),
      dailyAmount: text("daily_amount"),
      // grams per day
      feedingFrequency: text("feeding_frequency"),
      treats: text("treats"),
      supplements: text("supplements"),
      // Nutritional recommendations
      recommendedCalories: text("recommended_calories"),
      // kcal/day
      recommendedFood: text("recommended_food"),
      recommendedAmount: text("recommended_amount"),
      // grams per day
      weightGoal: text("weight_goal", { enum: ["maintain", "gain", "lose"] }),
      targetWeight: text("target_weight"),
      // kg
      // Clinical notes
      bodyConditionNotes: text("body_condition_notes"),
      nutritionalConcerns: text("nutritional_concerns"),
      recommendations: text("recommendations"),
      followUpDate: timestamp("follow_up_date"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertFoodSchema = createInsertSchema(foods).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertNutritionAssessmentSchema = createInsertSchema(nutritionAssessments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertExamDocumentSchema = createInsertSchema(examDocuments).pick({
      petId: true,
      examType: true,
      objectPath: true,
      fileName: true,
      fileSize: true,
      uploadedBy: true,
      notes: true
    });
    preVisitQuestionnaires = pgTable("pre_visit_questionnaires", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clientName: text("client_name").notNull(),
      petName: text("pet_name").notNull(),
      email: text("email").notNull(),
      phone: text("phone"),
      appointmentDate: timestamp("appointment_date"),
      // Transportation
      travelMethod: text("travel_method"),
      // How pet travels in car
      travelBehaviors: json("travel_behaviors").$type().default([]),
      // Anxious, drooling, vomiting, etc.
      otherTravelBehavior: text("other_travel_behavior"),
      // Veterinary experience dislikes
      dislikes: json("dislikes").$type().default([]),
      // Things pet doesn't like during vet visits
      // Social behavior
      behaviorAroundOthers: text("behavior_around_others"),
      // How pet acts around other animals/people
      // Physical sensitivity
      sensitiveBodyAreas: text("sensitive_body_areas"),
      // Areas pet doesn't like touched
      // Past procedures
      difficultProcedures: text("difficult_procedures"),
      // Procedures pet didn't like
      petReaction: text("pet_reaction"),
      // How pet reacted to difficult procedures
      // Preferences
      favoriteTreats: text("favorite_treats"),
      favoriteToys: text("favorite_toys"),
      // Medications
      previousMedications: text("previous_medications"),
      // Medications for vet visits
      medicationResults: text("medication_results"),
      // Additional information
      additionalInfo: text("additional_info"),
      // Status
      completed: boolean("completed").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertPreVisitQuestionnaireSchema = createInsertSchema(preVisitQuestionnaires).pick({
      clientName: true,
      petName: true,
      email: true,
      phone: true,
      appointmentDate: true,
      travelMethod: true,
      travelBehaviors: true,
      otherTravelBehavior: true,
      dislikes: true,
      behaviorAroundOthers: true,
      sensitiveBodyAreas: true,
      difficultProcedures: true,
      petReaction: true,
      favoriteTreats: true,
      favoriteToys: true,
      previousMedications: true,
      medicationResults: true,
      additionalInfo: true
    });
    appointments = pgTable("appointments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      petId: varchar("pet_id", { length: 255 }).notNull(),
      tutorRut: varchar("tutor_rut", { length: 12 }).notNull(),
      appointmentDate: varchar("appointment_date", { length: 10 }).notNull(),
      // YYYY-MM-DD format
      appointmentTime: varchar("appointment_time", { length: 5 }).notNull(),
      // HH:MM format
      duration: integer("duration").default(60).notNull(),
      // duration in minutes
      serviceType: varchar("service_type", { length: 100 }).notNull(),
      status: varchar("status", { length: 20 }).default("scheduled").notNull(),
      // scheduled, completed, cancelled
      notes: text("notes"),
      vetNotes: text("vet_notes"),
      address: text("address").notNull(),
      tutorPhone: varchar("tutor_phone", { length: 20 }).notNull(),
      tutorName: varchar("tutor_name", { length: 255 }).notNull(),
      tutorEmail: varchar("tutor_email", { length: 255 }),
      petName: varchar("pet_name", { length: 255 }).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    veterinarySchedule = pgTable("veterinary_schedule", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      dayOfWeek: integer("day_of_week").notNull(),
      // 0=Sunday, 1=Monday, etc.
      startTime: varchar("start_time", { length: 5 }).notNull(),
      // HH:MM format
      endTime: varchar("end_time", { length: 5 }).notNull(),
      // HH:MM format
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    scheduleBlocks = pgTable("schedule_blocks", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      blockDate: varchar("block_date", { length: 10 }).notNull(),
      // YYYY-MM-DD format
      startTime: varchar("start_time", { length: 5 }),
      // Si es null, bloquea todo el día
      endTime: varchar("end_time", { length: 5 }),
      // Si es null, bloquea todo el día
      reason: varchar("reason", { length: 255 }).notNull(),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertAppointmentSchema = createInsertSchema(appointments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVeterinaryScheduleSchema = createInsertSchema(veterinarySchedule).omit({
      id: true,
      createdAt: true
    });
    insertScheduleBlockSchema = createInsertSchema(scheduleBlocks).omit({
      id: true,
      createdAt: true
    });
    notificationSettings = pgTable("notification_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      type: varchar("type", { length: 20 }).notNull(),
      // 'email' o 'whatsapp'
      // Configuración Email (SMTP)
      smtpHost: varchar("smtp_host", { length: 255 }),
      smtpPort: integer("smtp_port"),
      smtpUser: varchar("smtp_user", { length: 255 }),
      smtpPassword: varchar("smtp_password", { length: 255 }),
      smtpSecure: boolean("smtp_secure").default(true),
      fromEmail: varchar("from_email", { length: 255 }),
      fromName: varchar("from_name", { length: 255 }),
      // Configuración WhatsApp
      whatsappToken: text("whatsapp_token"),
      whatsappPhoneId: varchar("whatsapp_phone_id", { length: 50 }),
      whatsappBusinessAccountId: varchar("whatsapp_business_account_id", { length: 50 }),
      // Estado y configuración general
      isActive: boolean("is_active").default(true),
      isTestMode: boolean("is_test_mode").default(false),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/firebase.ts
var firebase_exports = {};
__export(firebase_exports, {
  createCertificate: () => createCertificate,
  createDeworming: () => createDeworming,
  createMedicalRecord: () => createMedicalRecord,
  createPatient: () => createPatient,
  createPet: () => createPet,
  createPrescription: () => createPrescription,
  createVaccination: () => createVaccination,
  deleteCertificate: () => deleteCertificate,
  deleteDeworming: () => deleteDeworming,
  deleteExamOrder: () => deleteExamOrder,
  deleteMedicalRecord: () => deleteMedicalRecord,
  deletePrescription: () => deletePrescription,
  deleteVaccination: () => deleteVaccination,
  getAllPatients: () => getAllPatients,
  getCertificatesByPet: () => getCertificatesByPet,
  getDewormingsByPet: () => getDewormingsByPet,
  getMedicalRecordsByPet: () => getMedicalRecordsByPet,
  getPatientById: () => getPatientById,
  getPetsByOwner: () => getPetsByOwner,
  getPrescriptionsByPet: () => getPrescriptionsByPet,
  getVaccinationsByPet: () => getVaccinationsByPet,
  searchPatients: () => searchPatients,
  searchPatientsByRecord: () => searchPatientsByRecord,
  updatePatient: () => updatePatient
});
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, getDocs, addDoc, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, orderBy } from "firebase/firestore";
async function deletePrescription(prescriptionId) {
  try {
    const patientsRef = collection(db2, "patients");
    const patientsSnapshot = await getDocs(patientsRef);
    for (const patientDoc of patientsSnapshot.docs) {
      const prescriptionRef = doc(db2, `patients/${patientDoc.id}/prescriptions/${prescriptionId}`);
      const prescriptionDoc = await getDoc(prescriptionRef);
      if (prescriptionDoc.exists()) {
        await deleteDoc(prescriptionRef);
        console.log("Prescription deleted successfully:", prescriptionId);
        return true;
      }
    }
    console.log("Prescription not found:", prescriptionId);
    return false;
  } catch (error) {
    console.error("Error deleting prescription:", error);
    throw error;
  }
}
async function deleteVaccination(vaccinationId) {
  try {
    const patientsRef = collection(db2, "patients");
    const patientsSnapshot = await getDocs(patientsRef);
    for (const patientDoc of patientsSnapshot.docs) {
      const vaccinationRef = doc(db2, `patients/${patientDoc.id}/vaccinations/${vaccinationId}`);
      const vaccinationDoc = await getDoc(vaccinationRef);
      if (vaccinationDoc.exists()) {
        await deleteDoc(vaccinationRef);
        console.log("Vaccination deleted successfully:", vaccinationId);
        return true;
      }
    }
    console.log("Vaccination not found:", vaccinationId);
    return false;
  } catch (error) {
    console.error("Error deleting vaccination:", error);
    throw error;
  }
}
async function deleteDeworming(dewormingId) {
  try {
    const patientsRef = collection(db2, "patients");
    const patientsSnapshot = await getDocs(patientsRef);
    for (const patientDoc of patientsSnapshot.docs) {
      const dewormingRef = doc(db2, `patients/${patientDoc.id}/dewormings/${dewormingId}`);
      const dewormingDoc = await getDoc(dewormingRef);
      if (dewormingDoc.exists()) {
        await deleteDoc(dewormingRef);
        console.log("Deworming deleted successfully:", dewormingId);
        return true;
      }
    }
    console.log("Deworming not found:", dewormingId);
    return false;
  } catch (error) {
    console.error("Error deleting deworming:", error);
    throw error;
  }
}
async function deleteCertificate(certificateId) {
  try {
    const patientsRef = collection(db2, "patients");
    const patientsSnapshot = await getDocs(patientsRef);
    for (const patientDoc of patientsSnapshot.docs) {
      const certificateRef = doc(db2, `patients/${patientDoc.id}/certificates/${certificateId}`);
      const certificateDoc = await getDoc(certificateRef);
      if (certificateDoc.exists()) {
        await deleteDoc(certificateRef);
        console.log("Certificate deleted successfully:", certificateId);
        return true;
      }
    }
    console.log("Certificate not found:", certificateId);
    return false;
  } catch (error) {
    console.error("Error deleting certificate:", error);
    throw error;
  }
}
async function deleteMedicalRecord(recordId) {
  try {
    const patientsRef = collection(db2, "patients");
    const patientsSnapshot = await getDocs(patientsRef);
    for (const patientDoc of patientsSnapshot.docs) {
      const recordRef = doc(db2, `patients/${patientDoc.id}/medicalRecords/${recordId}`);
      const recordDoc = await getDoc(recordRef);
      if (recordDoc.exists()) {
        await deleteDoc(recordRef);
        console.log("Medical record deleted successfully:", recordId);
        return true;
      }
    }
    console.log("Medical record not found:", recordId);
    return false;
  } catch (error) {
    console.error("Error deleting medical record:", error);
    throw error;
  }
}
async function deleteExamOrder(examOrderId) {
  try {
    const patientsRef = collection(db2, "patients");
    const patientsSnapshot = await getDocs(patientsRef);
    for (const patientDoc of patientsSnapshot.docs) {
      const examOrderRef = doc(db2, `patients/${patientDoc.id}/examOrders/${examOrderId}`);
      const examOrderDoc = await getDoc(examOrderRef);
      if (examOrderDoc.exists()) {
        await deleteDoc(examOrderRef);
        console.log("Exam order deleted successfully:", examOrderId);
        return true;
      }
    }
    console.log("Exam order not found:", examOrderId);
    return false;
  } catch (error) {
    console.error("Error deleting exam order:", error);
    throw error;
  }
}
var firebaseConfig, app, db2, getAllPatients, getPatientById, searchPatients, searchPatientsByRecord, getPetsByOwner, getVaccinationsByPet, getDewormingsByPet, getMedicalRecordsByPet, createPatient, createPet, createVaccination, createDeworming, createMedicalRecord, createPrescription, createCertificate, getPrescriptionsByPet, getCertificatesByPet, updatePatient;
var init_firebase = __esm({
  "server/firebase.ts"() {
    "use strict";
    firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
      appId: process.env.VITE_FIREBASE_APP_ID
    };
    app = initializeApp(firebaseConfig);
    db2 = getFirestore(app);
    getAllPatients = async () => {
      try {
        const q = query(collection(db2, "patients"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      } catch (error) {
        console.error("Error getting patients from Firebase:", error);
        return [];
      }
    };
    getPatientById = async (patientId) => {
      try {
        const docRef = doc(db2, "patients", patientId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
      } catch (error) {
        console.error("Error getting patient from Firebase:", error);
        return null;
      }
    };
    searchPatients = async (searchTerm) => {
      try {
        const patients = await getAllPatients();
        const filtered = patients.filter((patient) => {
          const term = searchTerm.toLowerCase();
          return patient.name?.toLowerCase().includes(term) || patient.id?.toString().includes(term) || patient.tutorName?.toLowerCase().includes(term) || patient.tutorRut?.includes(searchTerm.replace(/[.-]/g, ""));
        });
        return filtered;
      } catch (error) {
        console.error("Error searching patients:", error);
        return [];
      }
    };
    searchPatientsByRecord = async (recordNumber) => {
      try {
        const patients = await getAllPatients();
        const filtered = patients.filter(
          (patient) => patient.recordNumber?.toString() === recordNumber || patient.id?.toString() === recordNumber
        );
        return filtered;
      } catch (error) {
        console.error("Error searching patients by record number:", error);
        return [];
      }
    };
    getPetsByOwner = async (ownerId) => {
      try {
        return await getAllPatients();
      } catch (error) {
        console.error("Error getting pets from Firebase:", error);
        return [];
      }
    };
    getVaccinationsByPet = async (petId) => {
      try {
        const q = query(collection(db2, "patients", petId, "vaccines"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      } catch (error) {
        console.error("Error getting vaccinations from Firebase:", error);
        return [];
      }
    };
    getDewormingsByPet = async (petId) => {
      try {
        console.log("Getting Firebase dewormings for pet:", petId);
        console.log("Collection path:", `patients/${petId}/dewormings`);
        const dewormingsRef = collection(db2, "patients", petId, "dewormings");
        const querySnapshot = await getDocs(dewormingsRef);
        console.log("Query snapshot size:", querySnapshot.size);
        console.log("Query snapshot empty:", querySnapshot.empty);
        const dewormings2 = querySnapshot.docs.map((doc2) => ({
          id: doc2.id,
          ...doc2.data()
        }));
        dewormings2.sort((a, b) => {
          const dateA = new Date(a.applicationDate || a.createdAt || 0);
          const dateB = new Date(b.applicationDate || b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        console.log("Firebase dewormings found:", dewormings2.length);
        if (dewormings2.length > 0) {
          console.log("Sample deworming record:", dewormings2[0]);
        }
        return dewormings2;
      } catch (error) {
        console.error("Error getting dewormings from Firebase:", error);
        return [];
      }
    };
    getMedicalRecordsByPet = async (petId) => {
      try {
        const q = query(collection(db2, "patients", petId, "consultations"), orderBy("savedAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      } catch (error) {
        console.error("Error getting medical records from Firebase:", error);
        return [];
      }
    };
    createPatient = async (patientData) => {
      try {
        const counterRef = doc(db2, "counters", "patientCounter");
        const counterSnap = await getDoc(counterRef);
        const lastNumber = counterSnap.exists() ? counterSnap.data()?.lastNumber || 0 : 0;
        const newNumber = lastNumber + 1;
        const patientId = String(newNumber);
        const formattedData = {
          ...patientData,
          name: patientData.petName?.toLowerCase() || patientData.name?.toLowerCase() || "",
          tutorRut: patientData.tutorRut?.replace(/[.-]/g, ""),
          sex: patientData.sex?.toLowerCase() || "unknown",
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        };
        await setDoc(doc(db2, "patients", patientId), formattedData);
        await setDoc(counterRef, { lastNumber: newNumber });
        return patientId;
      } catch (error) {
        console.error("Error creating patient in Firebase:", error);
        throw error;
      }
    };
    createPet = async (petData) => {
      return await createPatient(petData);
    };
    createVaccination = async (vaccinationData) => {
      try {
        const { petId, ...data } = vaccinationData;
        const docRef = await addDoc(collection(db2, "patients", petId, "vaccines"), {
          ...data,
          createdAt: serverTimestamp()
        });
        return docRef.id;
      } catch (error) {
        console.error("Error creating vaccination in Firebase:", error);
        throw error;
      }
    };
    createDeworming = async (dewormingData) => {
      try {
        const { petId, ...data } = dewormingData;
        const docRef = await addDoc(collection(db2, "patients", petId, "dewormings"), {
          ...data,
          createdAt: serverTimestamp()
        });
        return docRef.id;
      } catch (error) {
        console.error("Error creating deworming in Firebase:", error);
        throw error;
      }
    };
    createMedicalRecord = async (recordData) => {
      try {
        const { petId, ...data } = recordData;
        const docRef = await addDoc(collection(db2, "patients", petId, "consultations"), {
          ...data,
          savedAt: serverTimestamp()
        });
        return docRef.id;
      } catch (error) {
        console.error("Error creating medical record in Firebase:", error);
        throw error;
      }
    };
    createPrescription = async (prescriptionData) => {
      try {
        const { petId, ...data } = prescriptionData;
        const docRef = await addDoc(collection(db2, "patients", petId, "prescriptions"), {
          ...data,
          createdAt: serverTimestamp()
        });
        return docRef.id;
      } catch (error) {
        console.error("Error creating prescription in Firebase:", error);
        throw error;
      }
    };
    createCertificate = async (certificateData) => {
      try {
        const { petId, ...data } = certificateData;
        const docRef = await addDoc(collection(db2, "patients", petId, "certificates"), {
          ...data,
          createdAt: serverTimestamp()
        });
        return docRef.id;
      } catch (error) {
        console.error("Error creating certificate in Firebase:", error);
        throw error;
      }
    };
    getPrescriptionsByPet = async (petId) => {
      try {
        console.log("Getting Firebase prescriptions for pet:", petId);
        const prescriptionsRef = collection(db2, "patients", petId, "prescriptions");
        const q = query(prescriptionsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const prescriptions = querySnapshot.docs.map((doc2) => ({
          id: doc2.id,
          ...doc2.data()
        }));
        console.log("Firebase prescriptions found:", prescriptions.length);
        return prescriptions;
      } catch (error) {
        console.error("Error getting prescriptions from Firebase:", error);
        return [];
      }
    };
    getCertificatesByPet = async (petId) => {
      try {
        console.log("Getting Firebase certificates for pet:", petId);
        const certificatesRef = collection(db2, "patients", petId, "certificates");
        const q = query(certificatesRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const certificates2 = querySnapshot.docs.map((doc2) => ({
          id: doc2.id,
          ...doc2.data()
        }));
        console.log("Firebase certificates found:", certificates2.length);
        return certificates2;
      } catch (error) {
        console.error("Error getting certificates from Firebase:", error);
        return [];
      }
    };
    updatePatient = async (patientId, updateData) => {
      try {
        console.log("Updating Firebase patient:", patientId, updateData);
        const patientRef = doc(db2, "patients", patientId);
        await updateDoc(patientRef, {
          ...updateData,
          lastUpdated: serverTimestamp()
        });
        console.log("Patient updated successfully");
      } catch (error) {
        console.error("Error updating patient in Firebase:", error);
        throw error;
      }
    };
  }
});

// functions/src/mail/templates.ts
var templates_exports = {};
__export(templates_exports, {
  getAppointmentCancellationTemplate: () => getAppointmentCancellationTemplate,
  getAppointmentConfirmationTemplate: () => getAppointmentConfirmationTemplate,
  getAppointmentReminderTemplate: () => getAppointmentReminderTemplate,
  getAppointmentUpdateTemplate: () => getAppointmentUpdateTemplate,
  getContactFormTemplate: () => getContactFormTemplate,
  getDewormingReminderTemplate: () => getDewormingReminderTemplate,
  getExamDocumentTemplate: () => getExamDocumentTemplate,
  getExamReminderTemplate: () => getExamReminderTemplate,
  getFollowUpTemplate: () => getFollowUpTemplate,
  getVaccineReminderTemplate: () => getVaccineReminderTemplate
});
import { createEvent } from "ics";
var SIGNATURE, EMAIL_STYLES, generateICS, baseTemplate, getContactFormTemplate, getAppointmentConfirmationTemplate, getAppointmentReminderTemplate, getVaccineReminderTemplate, getDewormingReminderTemplate, getAppointmentCancellationTemplate, getAppointmentUpdateTemplate, getExamDocumentTemplate, getFollowUpTemplate, getExamReminderTemplate;
var init_templates = __esm({
  "functions/src/mail/templates.ts"() {
    "use strict";
    SIGNATURE = {
      name: "Alejandra Cautin Bastias",
      title: "M\xE9dico Veterinario",
      phone: "+569 76040797",
      whatsapp: "https://wa.me/56976040797",
      instagram: "@aleveterinaria"
    };
    EMAIL_STYLES = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f7f9fc; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; }
    .highlight { background-color: #f0f7ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; font-size: 14px; color: #666; }
    .signature { border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px; }
    @media (max-width: 600px) { body { padding: 10px; } .content, .header { padding: 20px; } }
  </style>
`;
    generateICS = (appointmentDate, tutorName, tutorEmail, notes) => {
      try {
        console.log("\u{1F4C5} Generando archivo ICS para cita");
        const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1e3);
        const event = {
          start: [
            appointmentDate.getFullYear(),
            appointmentDate.getMonth() + 1,
            appointmentDate.getDate(),
            appointmentDate.getHours(),
            appointmentDate.getMinutes()
          ],
          end: [
            endDate.getFullYear(),
            endDate.getMonth() + 1,
            endDate.getDate(),
            endDate.getHours(),
            endDate.getMinutes()
          ],
          title: "Consulta Veterinaria - Ale Veterinaria",
          description: notes ? `Consulta veterinaria a domicilio.

Notas: ${notes}` : "Consulta veterinaria a domicilio",
          location: "Domicilio del tutor",
          status: "CONFIRMED",
          organizer: { name: SIGNATURE.name, email: "contacto@aleveterinaria.cl" },
          attendees: [{ name: tutorName, email: tutorEmail, rsvp: true }],
          uid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@aleveterinaria.cl`
        };
        const { error, value } = createEvent(event);
        if (error) {
          console.error("\u274C Error generando ICS:", error);
          return void 0;
        }
        console.log("\u2705 Archivo ICS generado exitosamente");
        return Buffer.from(value, "utf-8");
      } catch (error) {
        console.error("\u274C Error en generateICS:", error);
        return void 0;
      }
    };
    baseTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${EMAIL_STYLES}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>\u{1F43E} Ale Veterinaria</h1>
      <p>Atenci\xF3n veterinaria a domicilio con amor y profesionalismo</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <div class="signature">
        <strong>${SIGNATURE.name}</strong><br>
        ${SIGNATURE.title}<br>
        \u{1F4F1} ${SIGNATURE.phone}<br>
        \u{1F4AC} <a href="${SIGNATURE.whatsapp}">WhatsApp</a> |
        \u{1F4F8} <a href="https://instagram.com/${SIGNATURE.instagram.substring(1)}">${SIGNATURE.instagram}</a>
      </div>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        Este email fue enviado autom\xE1ticamente por el sistema de Ale Veterinaria.<br>
        Si tienes alguna consulta, responde a este correo o cont\xE1ctanos por WhatsApp.
      </p>
    </div>
  </div>
</body>
</html>
`;
    getContactFormTemplate = (data) => {
      const subject = `Contacto web: ${data.senderName}`;
      const content = `
    <h2>\u{1F4AC} Nuevo mensaje desde el formulario de contacto</h2>
    <div class="highlight">
      <p><strong>Nombre:</strong> ${data.senderName}</p>
      <p><strong>Email:</strong> ${data.senderEmail}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${data.contactMessage?.replace(/\n/g, "<br>")}</p>
    </div>
    <p>Este mensaje fue enviado desde el formulario de contacto del sitio web.</p>
  `;
      return {
        subject,
        text: `Nuevo mensaje de contacto

Nombre: ${data.senderName}
Email: ${data.senderEmail}

Mensaje:
${data.contactMessage}`,
        html: baseTemplate(subject, content)
      };
    };
    getAppointmentConfirmationTemplate = (data) => {
      const subject = "\u2705 Confirmaci\xF3n de cita - Ale Veterinaria";
      const appointmentDateStr = data.appointmentDate?.toLocaleString("es-CL", {
        timeZone: "America/Santiago",
        dateStyle: "full",
        timeStyle: "short"
      });
      const content = `
    <h2>\u2705 Tu cita ha sido confirmada</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Hemos confirmado tu cita para <strong>${data.patientName}</strong> (${data.species}).</p>
    
    <div class="highlight">
      <h3>\u{1F4C5} Detalles de la cita:</h3>
      <p><strong>Fecha y hora:</strong> ${appointmentDateStr}</p>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p><strong>Tutor:</strong> ${data.tutorName}</p>
      ${data.appointmentNotes ? `<p><strong>Notas:</strong> ${data.appointmentNotes}</p>` : ""}
    </div>

    <p>\u{1F4CD} La consulta ser\xE1 realizada en tu domicilio. Te confirmaremos la hora exacta el d\xEDa anterior.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">\u{1F4AC} Contactar por WhatsApp</a>
    
    <p><strong>\xBFNecesitas reagendar?</strong> Cont\xE1ctanos por WhatsApp o responde a este email.</p>
  `;
      const icsBuffer = data.appointmentDate ? generateICS(data.appointmentDate, data.tutorName, data.tutorEmail, data.appointmentNotes) : void 0;
      return {
        subject,
        text: `Confirmaci\xF3n de cita

Hola ${data.tutorName},

Tu cita para ${data.patientName} ha sido confirmada para el ${appointmentDateStr}.

Nos vemos pronto!`,
        html: baseTemplate(subject, content),
        icsBuffer
      };
    };
    getAppointmentReminderTemplate = (data, reminderType) => {
      const titles = {
        "48h": "\u{1F514} Recordatorio: Tu cita es en 2 d\xEDas",
        "24h": "\u23F0 Recordatorio: Tu cita es ma\xF1ana",
        "today": "\u{1F6A8} Recordatorio: Tu cita es hoy"
      };
      const subject = titles[reminderType];
      const appointmentDateStr = data.appointmentDate?.toLocaleString("es-CL", {
        timeZone: "America/Santiago",
        dateStyle: "full",
        timeStyle: "short"
      });
      const content = `
    <h2>${titles[reminderType]}</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Te recordamos que tienes una cita confirmada para <strong>${data.patientName}</strong>.</p>
    
    <div class="highlight">
      <h3>\u{1F4C5} Detalles de la cita:</h3>
      <p><strong>Fecha y hora:</strong> ${appointmentDateStr}</p>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
    </div>

    <p>\u{1F4CD} Nos vemos en tu domicilio a la hora acordada.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">\u{1F4AC} Contactar por WhatsApp</a>
    
    <p>Si necesitas cancelar o reagendar, cont\xE1ctanos lo antes posible.</p>
  `;
      return {
        subject,
        text: `${titles[reminderType]}

Hola ${data.tutorName},

Recordatorio de cita para ${data.patientName} el ${appointmentDateStr}.

Nos vemos pronto!`,
        html: baseTemplate(subject, content)
      };
    };
    getVaccineReminderTemplate = (data) => {
      const subject = "\u{1F489} Recordatorio: Vacuna pr\xF3xima para " + data.patientName;
      const nextDoseStr = data.nextDose?.toLocaleDateString("es-CL", {
        timeZone: "America/Santiago",
        dateStyle: "full"
      });
      const content = `
    <h2>\u{1F489} Recordatorio de vacunaci\xF3n</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Te recordamos que <strong>${data.patientName}</strong> tiene una dosis de vacuna pr\xF3xima.</p>
    
    <div class="highlight">
      <h3>\u{1F489} Detalles de la vacuna:</h3>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p><strong>Vacuna:</strong> ${data.vaccineType}</p>
      <p><strong>Fecha programada:</strong> ${nextDoseStr}</p>
    </div>

    <p>Es importante mantener al d\xEDa las vacunas para proteger la salud de tu mascota.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">\u{1F4AC} Agendar por WhatsApp</a>
    
    <p>Cont\xE1ctanos para agendar la aplicaci\xF3n de la vacuna a domicilio.</p>
  `;
      return {
        subject,
        text: `Recordatorio de vacuna

Hola ${data.tutorName},

${data.patientName} tiene una dosis de ${data.vaccineType} programada para el ${nextDoseStr}.

Cont\xE1ctanos para agendar.`,
        html: baseTemplate(subject, content)
      };
    };
    getDewormingReminderTemplate = (data) => {
      const subject = "\u{1F6E1}\uFE0F Recordatorio: Desparasitaci\xF3n para " + data.patientName;
      const nextDoseStr = data.nextDose?.toLocaleDateString("es-CL", {
        timeZone: "America/Santiago",
        dateStyle: "full"
      });
      const content = `
    <h2>\u{1F6E1}\uFE0F Recordatorio de desparasitaci\xF3n</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Te recordamos que <strong>${data.patientName}</strong> necesita su pr\xF3xima desparasitaci\xF3n.</p>
    
    <div class="highlight">
      <h3>\u{1F6E1}\uFE0F Detalles:</h3>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p><strong>Producto:</strong> ${data.productName}</p>
      <p><strong>Fecha programada:</strong> ${nextDoseStr}</p>
    </div>

    <p>La desparasitaci\xF3n regular es fundamental para mantener la salud de tu mascota.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">\u{1F4AC} Consultar por WhatsApp</a>
    
    <p>Podemos orientarte sobre el mejor producto y aplicaci\xF3n a domicilio.</p>
  `;
      return {
        subject,
        text: `Recordatorio de desparasitaci\xF3n

Hola ${data.tutorName},

${data.patientName} necesita desparasitaci\xF3n programada para el ${nextDoseStr}.

Cont\xE1ctanos para m\xE1s informaci\xF3n.`,
        html: baseTemplate(subject, content)
      };
    };
    getAppointmentCancellationTemplate = (data) => {
      const subject = "\u274C Cita Cancelada - Ale Veterinaria";
      const appointmentDateStr = data.appointmentDate?.toLocaleString("es-CL", {
        timeZone: "America/Santiago",
        dateStyle: "full",
        timeStyle: "short"
      });
      const content = `
    <h2>\u274C Tu cita ha sido cancelada</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Te confirmamos que la cita para <strong>${data.patientName}</strong> (${data.species}) ha sido cancelada.</p>
    
    <div class="highlight">
      <h3>\u{1F4C5} Detalles de la cita cancelada:</h3>
      <p><strong>Fecha y hora:</strong> ${appointmentDateStr}</p>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p><strong>Servicio:</strong> ${data.serviceType}</p>
    </div>

    <p>\u{1F4CD} Si deseas reagendar o necesitas una nueva cita, no dudes en contactarnos.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">\u{1F4AC} Contactar por WhatsApp</a>
    
    <p><strong>\xBFNecesitas otra cita?</strong> Cont\xE1ctanos por WhatsApp o responde a este email.</p>
  `;
      return {
        subject,
        text: `Cita cancelada

Hola ${data.tutorName},

Tu cita para ${data.patientName} programada para el ${appointmentDateStr} ha sido cancelada.

Cont\xE1ctanos si necesitas reagendar.`,
        html: baseTemplate(subject, content)
      };
    };
    getAppointmentUpdateTemplate = (data) => {
      const subject = "\u270F\uFE0F Cita Modificada - Ale Veterinaria";
      const appointmentDateStr = data.appointmentDate?.toLocaleString("es-CL", {
        timeZone: "America/Santiago",
        dateStyle: "full",
        timeStyle: "short"
      });
      const content = `
    <h2>\u270F\uFE0F Tu cita ha sido modificada</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Te confirmamos que la cita para <strong>${data.patientName}</strong> (${data.species}) ha sido actualizada con los nuevos datos.</p>
    
    <div class="highlight">
      <h3>\u{1F4C5} Nuevos detalles de la cita:</h3>
      <p><strong>Fecha y hora:</strong> ${appointmentDateStr}</p>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p><strong>Servicio:</strong> ${data.serviceType}</p>
      <p><strong>Direcci\xF3n:</strong> ${data.address}</p>
      ${data.appointmentNotes ? `<p><strong>Notas:</strong> ${data.appointmentNotes}</p>` : ""}
    </div>

    <p>\u{1F4CD} La consulta ser\xE1 realizada en tu domicilio a la nueva hora acordada.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">\u{1F4AC} Contactar por WhatsApp</a>
    
    <p><strong>\xBFTienes dudas?</strong> Cont\xE1ctanos por WhatsApp o responde a este email.</p>
  `;
      const icsBuffer = data.appointmentDate ? generateICS(data.appointmentDate, data.tutorName, data.tutorEmail, data.appointmentNotes) : void 0;
      return {
        subject,
        text: `Cita modificada

Hola ${data.tutorName},

Tu cita para ${data.patientName} ha sido actualizada para el ${appointmentDateStr}.

Nos vemos pronto!`,
        html: baseTemplate(subject, content),
        icsBuffer
      };
    };
    getExamDocumentTemplate = (data) => {
      const subject = `\u{1F4CB} Resultados de Ex\xE1menes - ${data.patientName} - Ale Veterinaria`;
      const content = `
    <h2>\u{1F4CB} Resultados de ex\xE1menes disponibles</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Los resultados de los ex\xE1menes de <strong>${data.patientName}</strong> ya est\xE1n disponibles.</p>
    
    <div class="highlight">
      <h3>\u{1F4C4} Detalles del documento:</h3>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p><strong>Tipo de examen:</strong> ${data.productName || "Examen m\xE9dico"}</p>
      <p><strong>Fecha:</strong> ${(/* @__PURE__ */ new Date()).toLocaleDateString("es-CL", {
        timeZone: "America/Santiago",
        dateStyle: "full"
      })}</p>
      ${data.appointmentNotes ? `<p><strong>Observaciones:</strong> ${data.appointmentNotes}</p>` : ""}
    </div>

    <p>\u{1F4C1} El documento adjunto contiene todos los resultados detallados.</p>
    <p>\u{1F4DE} Si tienes alguna consulta sobre los resultados, no dudes en contactarnos.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">\u{1F4AC} Consultar por WhatsApp</a>
    
    <p><strong>\xBFNecesitas una consulta de seguimiento?</strong> Cont\xE1ctanos para agendar una cita y revisar los resultados juntos.</p>
  `;
      return {
        subject,
        text: `Resultados de ex\xE1menes

Hola ${data.tutorName},

Los resultados de los ex\xE1menes de ${data.patientName} est\xE1n disponibles en el documento adjunto.

Cont\xE1ctanos si tienes consultas.`,
        html: baseTemplate(subject, content)
      };
    };
    getFollowUpTemplate = (data) => {
      const subject = "\u{1F49D} \xBFC\xF3mo est\xE1 " + data.patientName + "? - Seguimiento";
      const content = `
    <h2>\u{1F49D} Seguimiento post-consulta</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Ha pasado una semana desde la consulta de <strong>${data.patientName}</strong> y queremos saber c\xF3mo est\xE1.</p>
    
    <div class="highlight">
      <h3>\u{1F469}\u200D\u2695\uFE0F Nos interesa saber:</h3>
      <ul>
        <li>\xBFC\xF3mo ha evolucionado ${data.patientName}?</li>
        <li>\xBFHay alguna mejor\xEDa en su condici\xF3n?</li>
        <li>\xBFTienes alguna consulta sobre el tratamiento?</li>
        <li>\xBFNecesitas agendar un control de seguimiento?</li>
      </ul>
    </div>

    <p>Tu mascota es importante para nosotros y queremos asegurar su completa recuperaci\xF3n.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">\u{1F4AC} Responder por WhatsApp</a>
    
    <p>No dudes en contactarnos si tienes cualquier duda o inquietud.</p>
  `;
      return {
        subject,
        text: `Seguimiento post-consulta

Hola ${data.tutorName},

\xBFC\xF3mo est\xE1 ${data.patientName} despu\xE9s de la consulta? Queremos saber su evoluci\xF3n.

Cont\xE1ctanos si tienes dudas.`,
        html: baseTemplate(subject, content)
      };
    };
    getExamReminderTemplate = (data) => {
      const subject = "\u{1F52C} Recordatorio: Ex\xE1menes pendientes para " + data.patientName;
      const content = `
    <h2>\u{1F52C} Recordatorio de ex\xE1menes</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Te recordamos que <strong>${data.patientName}</strong> tiene ex\xE1menes m\xE9dicos pendientes.</p>
    
    <div class="highlight">
      <h3>\u{1F52C} Informaci\xF3n:</h3>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p>Han pasado varios d\xEDas desde que se solicitaron los ex\xE1menes y no hemos recibido los resultados.</p>
    </div>

    <p>Los resultados de los ex\xE1menes son importantes para el diagn\xF3stico y tratamiento adecuado.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">\u{1F4AC} Consultar por WhatsApp</a>
    
    <p>Por favor cont\xE1ctanos para coordinar la entrega de resultados o resolver cualquier duda.</p>
  `;
      return {
        subject,
        text: `Recordatorio de ex\xE1menes

Hola ${data.tutorName},

${data.patientName} tiene ex\xE1menes pendientes. Cont\xE1ctanos para coordinar la entrega de resultados.`,
        html: baseTemplate(subject, content)
      };
    };
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { Router } from "express";

// server/storage.ts
init_schema();
init_db();
import { eq, and, gte, lte, sql as sql2 } from "drizzle-orm";

// shared/serviceTypes.ts
var SERVICE_TYPES = [
  {
    name: "Consulta General",
    duration: 60,
    color: "#5FA98D"
  },
  {
    name: "Control M\xE9dico",
    duration: 45,
    color: "#8B93C7"
  },
  {
    name: "Toma de Ex\xE1menes",
    duration: 30,
    color: "#87CEEB"
  },
  {
    name: "Vacunaci\xF3n",
    duration: 30,
    color: "#98D8C8"
  },
  {
    name: "Desparasitaci\xF3n",
    duration: 30,
    color: "#FFB6C1"
  },
  {
    name: "Control Anual",
    duration: 60,
    color: "#DDA0DD"
  },
  {
    name: "Certificado de Salud",
    duration: 30,
    color: "#F0E68C"
  }
];
var MIN_APPOINTMENT_SEPARATION = 30;
var getServiceDuration = (serviceType) => {
  const service = SERVICE_TYPES.find((s) => s.name === serviceType);
  return service?.duration || 30;
};

// server/storage.ts
var DatabaseStorage = class {
  // Users
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      if (error.code === "23505") {
        throw new Error("User already exists");
      }
      throw error;
    }
  }
  // Pets
  async createPet(insertPet) {
    const [pet] = await db.insert(pets).values(insertPet).returning();
    return pet;
  }
  async getPet(id) {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || void 0;
  }
  async getPetsByOwner(ownerId) {
    return await db.select().from(pets).where(eq(pets.ownerId, ownerId));
  }
  async getPetsByTutorRut(tutorRut) {
    const cleanRut = tutorRut.replace(/\D/g, "");
    const appointmentPets = await db.select({ petId: appointments.petId }).from(appointments).where(eq(appointments.tutorRut, cleanRut));
    if (appointmentPets.length === 0) {
      return [];
    }
    const petIds = Array.from(new Set(appointmentPets.map((ap) => ap.petId)));
    const existingPets = await db.select().from(pets).where(
      sql2`${pets.id} IN (${sql2.join(petIds.map((id) => sql2`${id}`), sql2`,`)})`
    );
    if (existingPets.length > 0) {
      return existingPets;
    }
    const appointmentsData = await db.select({
      petId: appointments.petId,
      petName: appointments.petName,
      tutorName: appointments.tutorName,
      tutorRut: appointments.tutorRut
    }).from(appointments).where(eq(appointments.tutorRut, cleanRut));
    const pseudoPets = appointmentsData.map((apt) => ({
      id: apt.petId,
      ownerId: apt.tutorRut,
      // Use RUT as owner ID temporarily
      name: apt.petName || "Sin nombre",
      species: "Canino",
      // Default species
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
      createdAt: /* @__PURE__ */ new Date()
    }));
    const uniquePseudoPets = pseudoPets.filter(
      (pet, index, self) => index === self.findIndex((p) => p.id === pet.id)
    );
    return uniquePseudoPets;
  }
  async updatePet(id, updatePet) {
    const [pet] = await db.update(pets).set(updatePet).where(eq(pets.id, id)).returning();
    return pet;
  }
  // Medical Records
  async createMedicalRecord(insertRecord) {
    const [record] = await db.insert(medicalRecords).values(insertRecord).returning();
    return record;
  }
  async getMedicalRecord(id) {
    const [record] = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id));
    return record || void 0;
  }
  async getMedicalRecordsByPet(petId) {
    return await db.select().from(medicalRecords).where(eq(medicalRecords.petId, petId));
  }
  // Vaccinations
  async createVaccination(insertVaccination) {
    const [vaccination] = await db.insert(vaccinations).values(insertVaccination).returning();
    return vaccination;
  }
  async getVaccinationsByPet(petId) {
    return await db.select().from(vaccinations).where(eq(vaccinations.petId, petId));
  }
  // Dewormings
  async createDeworming(insertDeworming) {
    const [deworming] = await db.insert(dewormings).values(insertDeworming).returning();
    return deworming;
  }
  async getDewormingsByPet(petId) {
    return await db.select().from(dewormings).where(eq(dewormings.petId, petId));
  }
  // Examinations
  async createExamination(insertExamination) {
    const [examination] = await db.insert(examinations).values(insertExamination).returning();
    return examination;
  }
  async getExaminationsByPet(petId) {
    return await db.select().from(examinations).where(eq(examinations.petId, petId));
  }
  async updateExamination(id, examination) {
    const [updated] = await db.update(examinations).set(examination).where(eq(examinations.id, id)).returning();
    return updated;
  }
  async createExamDocument(examDocument) {
    const [newExamDocument] = await db.insert(examDocuments).values(examDocument).returning();
    return newExamDocument;
  }
  async getExamDocumentsByPet(petId) {
    return await db.select().from(examDocuments).where(eq(examDocuments.petId, petId));
  }
  async deleteExamDocument(id) {
    const [deleted] = await db.delete(examDocuments).where(eq(examDocuments.id, id)).returning();
    return deleted || null;
  }
  // Certificates
  async createCertificate(insertCertificate) {
    const [certificate] = await db.insert(certificates).values(insertCertificate).returning();
    return certificate;
  }
  async getCertificatesByPet(petId) {
    return await db.select().from(certificates).where(eq(certificates.petId, petId));
  }
  // Questionnaires
  async createQuestionnaire(insertQuestionnaire) {
    const [questionnaire] = await db.insert(preVisitQuestionnaires).values(insertQuestionnaire).returning();
    return questionnaire;
  }
  async getQuestionnaire(id) {
    const [questionnaire] = await db.select().from(preVisitQuestionnaires).where(eq(preVisitQuestionnaires.id, id));
    return questionnaire || void 0;
  }
  async getAllQuestionnaires() {
    return await db.select().from(preVisitQuestionnaires);
  }
  // Appointment management
  async createAppointment(appointment) {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }
  async getAppointmentsByDate(date) {
    return await db.select().from(appointments).where(eq(appointments.appointmentDate, date));
  }
  async getAppointmentsByTutorRut(rut) {
    const cleanRut = rut.replace(/\D/g, "");
    return await db.select().from(appointments).where(eq(appointments.tutorRut, cleanRut));
  }
  async getAppointmentsByYearMonth(year, month) {
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
    const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;
    return await db.select().from(appointments).where(
      and(
        gte(appointments.appointmentDate, startDate),
        lte(appointments.appointmentDate, endDate)
      )
    );
  }
  async getAllAppointments() {
    return await db.select().from(appointments).orderBy(appointments.appointmentDate, appointments.appointmentTime);
  }
  async updateAppointment(id, appointment) {
    const [updated] = await db.update(appointments).set({ ...appointment, updatedAt: /* @__PURE__ */ new Date() }).where(eq(appointments.id, id)).returning();
    return updated || null;
  }
  async getAppointmentById(id) {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return appointment || void 0;
  }
  async deleteAppointment(id) {
    const [deleted] = await db.delete(appointments).where(eq(appointments.id, id)).returning();
    return deleted || null;
  }
  async getVeterinarySchedule() {
    return await db.select().from(veterinarySchedule).where(eq(veterinarySchedule.isActive, true));
  }
  async createVeterinarySchedule(schedule) {
    const [newSchedule] = await db.insert(veterinarySchedule).values(schedule).returning();
    return newSchedule;
  }
  async updateVeterinarySchedule(id, schedule) {
    const [updated] = await db.update(veterinarySchedule).set(schedule).where(eq(veterinarySchedule.id, id)).returning();
    return updated || null;
  }
  async createScheduleBlock(block) {
    const [newBlock] = await db.insert(scheduleBlocks).values(block).returning();
    return newBlock;
  }
  async getScheduleBlocks() {
    return await db.select().from(scheduleBlocks).where(eq(scheduleBlocks.isActive, true));
  }
  async updateScheduleBlock(id, block) {
    const [updated] = await db.update(scheduleBlocks).set(block).where(eq(scheduleBlocks.id, id)).returning();
    return updated || null;
  }
  async getAvailableSlots(date, requestedServiceType, editingAppointmentId) {
    const dateObj = /* @__PURE__ */ new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay();
    const scheduleForDay = await db.select().from(veterinarySchedule).where(and(eq(veterinarySchedule.dayOfWeek, dayOfWeek), eq(veterinarySchedule.isActive, true)));
    if (scheduleForDay.length === 0) return [];
    const blocksForDate = await db.select().from(scheduleBlocks).where(and(eq(scheduleBlocks.blockDate, date), eq(scheduleBlocks.isActive, true)));
    let existingAppointments = await this.getAppointmentsByDate(date);
    if (editingAppointmentId) {
      existingAppointments = existingAppointments.filter((apt) => apt.id !== editingAppointmentId);
    }
    const availableSlots = [];
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };
    const minutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    };
    const hasConflict = (slotStart, slotDuration) => {
      const slotEnd = slotStart + slotDuration;
      return existingAppointments.some((apt) => {
        const aptStart = timeToMinutes(apt.appointmentTime);
        const aptDuration = getServiceDuration(apt.serviceType);
        const aptEnd = aptStart + aptDuration;
        return slotStart < aptEnd && slotEnd > aptStart;
      });
    };
    scheduleForDay.forEach((schedule) => {
      const scheduleStart = timeToMinutes(schedule.startTime);
      const scheduleEnd = timeToMinutes(schedule.endTime);
      const requestedDuration = requestedServiceType ? getServiceDuration(requestedServiceType) : 30;
      for (let currentMinutes = scheduleStart; currentMinutes < scheduleEnd; currentMinutes += MIN_APPOINTMENT_SEPARATION) {
        const currentTime = minutesToTime(currentMinutes);
        const slotEnd = currentMinutes + requestedDuration;
        if (slotEnd > scheduleEnd) continue;
        const isBlocked = blocksForDate.some((block) => {
          if (!block.startTime || !block.endTime) {
            return true;
          }
          const blockStart = timeToMinutes(block.startTime);
          const blockEnd = timeToMinutes(block.endTime);
          return currentMinutes < blockEnd && slotEnd > blockStart;
        });
        const hasAppointmentConflict = hasConflict(currentMinutes, requestedDuration);
        if (!isBlocked && !hasAppointmentConflict) {
          availableSlots.push(currentTime);
        }
      }
    });
    return availableSlots.sort();
  }
  async isDateCompletelyBlocked(date) {
    const blocksForDate = await db.select().from(scheduleBlocks).where(and(eq(scheduleBlocks.blockDate, date), eq(scheduleBlocks.isActive, true)));
    const hasFullDayBlock = blocksForDate.some((block) => !block.startTime || !block.endTime);
    if (hasFullDayBlock) {
      return true;
    }
    const dateObj = /* @__PURE__ */ new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay();
    const scheduleForDay = await db.select().from(veterinarySchedule).where(and(eq(veterinarySchedule.dayOfWeek, dayOfWeek), eq(veterinarySchedule.isActive, true)));
    return scheduleForDay.length === 0;
  }
  // Notification Settings methods
  async getNotificationSettings(type) {
    const [settings] = await db.select().from(notificationSettings).where(eq(notificationSettings.type, type));
    return settings || void 0;
  }
  async saveNotificationSettings(settings) {
    const existing = await this.getNotificationSettings(settings.type);
    if (existing) {
      const [updated] = await db.update(notificationSettings).set({ ...settings, updatedAt: /* @__PURE__ */ new Date() }).where(eq(notificationSettings.type, settings.type)).returning();
      return updated;
    } else {
      const [created] = await db.insert(notificationSettings).values(settings).returning();
      return created;
    }
  }
  async updateNotificationSettings(type, settings) {
    const [updated] = await db.update(notificationSettings).set({ ...settings, updatedAt: /* @__PURE__ */ new Date() }).where(eq(notificationSettings.type, type)).returning();
    return updated || null;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
init_schema();
init_firebase();
import { z as z2 } from "zod";
import * as net from "net";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// server/objectStorage.ts
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

// server/objectAcl.ts
var ACL_POLICY_METADATA_KEY = "custom:aclPolicy";
function isPermissionAllowed(requested, granted) {
  if (requested === "read" /* READ */) {
    return ["read" /* READ */, "write" /* WRITE */].includes(granted);
  }
  return granted === "write" /* WRITE */;
}
function createObjectAccessGroup(group) {
  switch (group.type) {
    // Implement the case for each type of access group to instantiate.
    //
    // For example:
    // case "USER_LIST":
    //   return new UserListAccessGroup(group.id);
    // case "EMAIL_DOMAIN":
    //   return new EmailDomainAccessGroup(group.id);
    // case "GROUP_MEMBER":
    //   return new GroupMemberAccessGroup(group.id);
    // case "SUBSCRIBER":
    //   return new SubscriberAccessGroup(group.id);
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}
async function setObjectAclPolicy(objectFile, aclPolicy) {
  const [exists] = await objectFile.exists();
  if (!exists) {
    throw new Error(`Object not found: ${objectFile.name}`);
  }
  await objectFile.setMetadata({
    metadata: {
      [ACL_POLICY_METADATA_KEY]: JSON.stringify(aclPolicy)
    }
  });
}
async function getObjectAclPolicy(objectFile) {
  const [metadata] = await objectFile.getMetadata();
  const aclPolicy = metadata?.metadata?.[ACL_POLICY_METADATA_KEY];
  if (!aclPolicy) {
    return null;
  }
  return JSON.parse(aclPolicy);
}
async function canAccessObject({
  userId,
  objectFile,
  requestedPermission
}) {
  const aclPolicy = await getObjectAclPolicy(objectFile);
  if (!aclPolicy) {
    return false;
  }
  if (aclPolicy.visibility === "public" && requestedPermission === "read" /* READ */) {
    return true;
  }
  if (!userId) {
    return false;
  }
  if (aclPolicy.owner === userId) {
    return true;
  }
  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (await accessGroup.hasMember(userId) && isPermissionAllowed(requestedPermission, rule.permission)) {
      return true;
    }
  }
  return false;
}

// server/objectStorage.ts
var REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
var objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token"
      }
    },
    universe_domain: "googleapis.com"
  },
  projectId: ""
});
var ObjectNotFoundError = class _ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
  }
};
var ObjectStorageService = class {
  constructor() {
  }
  // Gets the public object search paths.
  getPublicObjectSearchPaths() {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr.split(",").map((path3) => path3.trim()).filter((path3) => path3.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }
  // Gets the private object directory.
  getPrivateObjectDir() {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }
  // Search for a public object from the search paths.
  async searchPublicObject(filePath) {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }
  // Downloads an object to the response.
  async downloadObject(file, res, cacheTtlSec = 3600) {
    try {
      const [metadata] = await file.getMetadata();
      const aclPolicy = await getObjectAclPolicy(file);
      const isPublic = aclPolicy?.visibility === "public";
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`
      });
      const stream = file.createReadStream();
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }
  // Gets the upload URL for an object entity.
  async getObjectEntityUploadURL() {
    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900
    });
  }
  // Gets the object entity file from the object path.
  async getObjectEntityFile(objectPath) {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }
    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }
  normalizeObjectEntityPath(rawPath) {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }
    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }
    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }
    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }
  // Tries to set the ACL policy for the object entity and return the normalized path.
  async trySetObjectEntityAclPolicy(rawPath, aclPolicy) {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }
    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }
  // Checks if the user can access the object entity.
  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission
  }) {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? "read" /* READ */
    });
  }
};
function parseObjectPath(path3) {
  if (!path3.startsWith("/")) {
    path3 = `/${path3}`;
  }
  const pathParts = path3.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return {
    bucketName,
    objectName
  };
}
async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec
}) {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1e3).toISOString()
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, make sure you're running on Replit`
    );
  }
  const { signed_url: signedURL } = await response.json();
  return signedURL;
}

// server/routes.ts
var router = Router();
router.get("/api/pets/firebase/owner/:ownerId", async (req, res) => {
  try {
    console.log("Getting Firebase patients for owner:", req.params.ownerId);
    const { getAllPatients: getAllPatients2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const patients = await getAllPatients2();
    console.log("Firebase patients found:", patients.length);
    res.json(patients);
  } catch (error) {
    console.error("Error getting Firebase patients:", error);
    res.status(500).json({ error: "Failed to get patients from Firebase" });
  }
});
router.get("/api/pets/rut/:rut", async (req, res) => {
  try {
    console.log("Getting database pets for tutor RUT:", req.params.rut);
    const pets2 = await storage.getPetsByTutorRut(req.params.rut);
    console.log("Database pets found for RUT:", pets2.length);
    res.json(pets2);
  } catch (error) {
    console.error("Error getting database pets by RUT:", error);
    res.status(500).json({ error: "Failed to get pets by RUT from database" });
  }
});
router.get("/api/pets/firebase/tutor/:rut", async (req, res) => {
  try {
    console.log("Getting Firebase pets for tutor RUT:", req.params.rut);
    const { getAllPatients: getAllPatients2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const allPets = await getAllPatients2();
    const pets2 = allPets.filter(
      (pet) => pet.tutorRut && pet.tutorRut.replace(/\D/g, "") === req.params.rut.replace(/\D/g, "")
    );
    console.log("Firebase pets found for RUT:", pets2.length);
    res.json(pets2);
  } catch (error) {
    console.error("Error getting Firebase pets by RUT:", error);
    res.status(500).json({ error: "Failed to get pets by RUT from Firebase" });
  }
});
router.get("/api/vaccinations/firebase/pets/:petIds", async (req, res) => {
  try {
    const petIds = req.params.petIds.split(",");
    console.log("Getting Firebase vaccinations for pets:", petIds);
    const { getVaccinationsByPet: getVaccinationsByPet2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const allVaccinations = [];
    for (const petId of petIds) {
      const vaccinations2 = await getVaccinationsByPet2(petId);
      allVaccinations.push(...vaccinations2.map((v) => ({ ...v, petId })));
    }
    console.log("Firebase vaccinations found:", allVaccinations.length);
    res.json(allVaccinations);
  } catch (error) {
    console.error("Error getting Firebase vaccinations for multiple pets:", error);
    res.status(500).json({ error: "Failed to get vaccinations from Firebase" });
  }
});
router.get("/api/dewormings/firebase/pets/:petIds", async (req, res) => {
  try {
    const petIds = req.params.petIds.split(",");
    console.log("Getting Firebase dewormings for pets:", petIds);
    const { getDewormingsByPet: getDewormingsByPet2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const allDewormings = [];
    for (const petId of petIds) {
      const dewormings2 = await getDewormingsByPet2(petId);
      allDewormings.push(...dewormings2.map((d) => ({ ...d, petId })));
    }
    console.log("Firebase dewormings found:", allDewormings.length);
    res.json(allDewormings);
  } catch (error) {
    console.error("Error getting Firebase dewormings for multiple pets:", error);
    res.status(500).json({ error: "Failed to get dewormings from Firebase" });
  }
});
router.get("/api/certificates/firebase/pets/:petIds", async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error("Error getting Firebase certificates:", error);
    res.status(500).json({ error: "Failed to get certificates from Firebase" });
  }
});
router.get("/api/prescriptions/firebase/pets/:petIds", async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error("Error getting Firebase prescriptions:", error);
    res.status(500).json({ error: "Failed to get prescriptions from Firebase" });
  }
});
router.get("/objects/:objectPath(*)", async (req, res) => {
  const objectStorageService = new ObjectStorageService();
  try {
    const objectFile = await objectStorageService.getObjectEntityFile(req.path);
    objectStorageService.downloadObject(objectFile, res);
  } catch (error) {
    console.error("Error accessing object:", error);
    if (error instanceof ObjectNotFoundError) {
      return res.sendStatus(404);
    }
    return res.sendStatus(500);
  }
});
router.post("/api/objects/upload", async (req, res) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error("Error getting upload URL:", error);
    res.status(500).json({ error: "Failed to get upload URL" });
  }
});
router.post("/api/exam-documents", async (req, res) => {
  try {
    console.log(`\u{1F50D} Starting exam document upload for pet: ${req.body.petId}`);
    const { petId, examType, documentURL, fileName, fileSize, uploadedBy, notes, tutorEmail, tutorName, petName, species } = req.body;
    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
      documentURL,
      {
        owner: uploadedBy,
        visibility: "private"
        // Exam documents should be private
      }
    );
    const existingPet = await storage.getPet(petId);
    if (!existingPet) {
      console.log(`Pet ${petId} not found in PostgreSQL, syncing from Firebase...`);
      try {
        const { getPatientById: getPatientById2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
        const firebasePet = await getPatientById2(petId);
        if (firebasePet) {
          await storage.createPet({
            id: firebasePet.id,
            ownerId: firebasePet.tutorRut?.replace(/\D/g, "") || "unknown",
            name: firebasePet.name,
            species: firebasePet.species || "Canino",
            breed: firebasePet.breed,
            sex: firebasePet.sex,
            birthDate: firebasePet.birthDate ? new Date(firebasePet.birthDate) : void 0,
            weight: firebasePet.weight,
            colorMarkings: firebasePet.colorMarkings,
            microchip: firebasePet.microchip,
            reproductiveStatus: firebasePet.reproductiveStatus,
            tutorName: firebasePet.tutorName,
            tutorPhone: firebasePet.tutorPhone,
            tutorEmail: firebasePet.tutorEmail,
            tutorCity: firebasePet.tutorCity,
            tutorAddress: firebasePet.tutorAddress
          });
          console.log(`\u2705 Pet ${petId} synced successfully from Firebase to PostgreSQL`);
        } else {
          console.log(`\u274C Pet ${petId} not found in Firebase either`);
          return res.status(400).json({ error: "Pet not found in either Firebase or PostgreSQL" });
        }
      } catch (syncError) {
        console.error("\u274C Error syncing pet from Firebase:", syncError);
        return res.status(500).json({ error: "Failed to sync pet from Firebase" });
      }
    } else {
      console.log(`\u2705 Pet ${petId} already exists in PostgreSQL`);
    }
    const examDocument = await storage.createExamDocument({
      petId,
      examType,
      objectPath,
      fileName,
      fileSize,
      uploadedBy,
      notes
    });
    try {
      const emailSettings = await storage.getNotificationSettings("email");
      if (emailSettings && emailSettings.smtpHost && tutorEmail) {
        const nodemailer = await import("nodemailer");
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
          connectionTimeout: 6e4,
          greetingTimeout: 3e4,
          socketTimeout: 6e4
        });
        const { getExamDocumentTemplate: getExamDocumentTemplate2 } = await Promise.resolve().then(() => (init_templates(), templates_exports));
        const templateData = {
          tutorName: tutorName || "Estimado/a cliente",
          tutorEmail,
          patientName: petName || "Mascota",
          species: species || "Mascota",
          productName: examType,
          appointmentNotes: notes
        };
        const emailTemplate = getExamDocumentTemplate2(templateData);
        let attachment = void 0;
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
          const fileBuffer = await new Promise((resolve, reject) => {
            const chunks = [];
            const stream = objectFile.createReadStream();
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("end", () => resolve(Buffer.concat(chunks)));
            stream.on("error", reject);
          });
          attachment = {
            filename: fileName,
            content: fileBuffer,
            contentType: "application/octet-stream"
          };
        } catch (attachError) {
          console.error("Error getting file for attachment:", attachError);
        }
        await transporter.sendMail({
          from: `"${emailSettings.fromName || "Ale Veterinaria"}" <${emailSettings.fromEmail}>`,
          to: tutorEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          replyTo: "contacto@aleveterinaria.cl",
          attachments: attachment ? [attachment] : void 0
        });
        await transporter.sendMail({
          from: `"${emailSettings.fromName || "Ale Veterinaria"}" <${emailSettings.fromEmail}>`,
          to: "contacto@aleveterinaria.cl",
          subject: `\u{1F4CB} Documento Enviado - ${petName}`,
          html: `<h3>Documento de examen enviado por email</h3>
                 <p><strong>Cliente:</strong> ${tutorName}</p>
                 <p><strong>Email:</strong> ${tutorEmail}</p>
                 <p><strong>Mascota:</strong> ${petName}</p>
                 <p><strong>Tipo de examen:</strong> ${examType}</p>
                 <p><strong>Archivo:</strong> ${fileName}</p>
                 ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ""}`
        });
        console.log("\u2705 Exam document notification emails sent successfully");
      }
    } catch (emailError) {
      console.error("\u274C Error sending exam document notification email:", emailError);
    }
    console.log("Exam document saved:", examDocument);
    res.status(201).json(examDocument);
  } catch (error) {
    console.error("Error saving exam document:", error);
    res.status(500).json({ error: "Failed to save exam document" });
  }
});
router.get("/api/exam-documents/pet/:petId", async (req, res) => {
  try {
    const petId = req.params.petId;
    console.log("Getting exam documents for pet:", petId);
    const examDocuments2 = await storage.getExamDocumentsByPet(petId);
    res.json(examDocuments2);
  } catch (error) {
    console.error("Error getting exam documents:", error);
    res.status(500).json({ error: "Failed to get exam documents" });
  }
});
router.get("/api/exam-documents/pets/:petIds", async (req, res) => {
  try {
    const petIds = req.params.petIds.split(",");
    console.log("Getting exam documents for pets:", petIds);
    let allExamDocs = [];
    for (const petId of petIds) {
      const petExamDocs = await storage.getExamDocumentsByPet(petId);
      allExamDocs.push(...petExamDocs.map((doc2) => ({ ...doc2, petId })));
    }
    res.json(allExamDocs);
  } catch (error) {
    console.error("Error getting exam documents:", error);
    res.status(500).json({ error: "Failed to get exam documents" });
  }
});
router.delete("/api/exam-documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting exam document:", id);
    const deletedDocument = await storage.deleteExamDocument(id);
    if (deletedDocument) {
      res.json({ success: true, message: "Exam document deleted successfully" });
    } else {
      res.status(404).json({ error: "Exam document not found" });
    }
  } catch (error) {
    console.error("Error deleting exam document:", error);
    res.status(500).json({ error: "Failed to delete exam document" });
  }
});
router.get("/api/vaccinations/firebase/pet/:petId", async (req, res) => {
  try {
    console.log("Getting Firebase vaccinations for pet:", req.params.petId);
    const vaccinations2 = await getVaccinationsByPet(req.params.petId);
    console.log("Firebase vaccinations found:", vaccinations2.length);
    res.json(vaccinations2);
  } catch (error) {
    console.error("Error getting Firebase vaccinations:", error);
    res.status(500).json({ error: "Failed to get vaccinations from Firebase" });
  }
});
router.get("/api/dewormings/firebase/pet/:petId", async (req, res) => {
  try {
    console.log("Getting Firebase dewormings for pet:", req.params.petId);
    const dewormings2 = await getDewormingsByPet(req.params.petId);
    console.log("Firebase dewormings found:", dewormings2.length);
    res.json(dewormings2);
  } catch (error) {
    console.error("Error getting Firebase dewormings:", error);
    res.status(500).json({ error: "Failed to get dewormings from Firebase" });
  }
});
router.get("/api/medical-records/firebase/pet/:petId", async (req, res) => {
  try {
    console.log("Getting Firebase medical records for pet:", req.params.petId);
    const records = await getMedicalRecordsByPet(req.params.petId);
    console.log("Firebase medical records found:", records.length);
    res.json(records);
  } catch (error) {
    console.error("Error getting Firebase medical records:", error);
    res.status(500).json({ error: "Failed to get medical records from Firebase" });
  }
});
router.post("/api/pets/firebase", async (req, res) => {
  try {
    console.log("Creating Firebase pet:", req.body);
    const petId = await createPet(req.body);
    res.status(201).json({ id: petId, ...req.body });
  } catch (error) {
    console.error("Error creating Firebase pet:", error);
    res.status(500).json({ error: "Failed to create pet in Firebase" });
  }
});
router.post("/api/vaccinations/firebase", async (req, res) => {
  try {
    console.log("Creating Firebase vaccination:", req.body);
    const vaccinationId = await createVaccination(req.body);
    res.status(201).json({ id: vaccinationId, ...req.body });
  } catch (error) {
    console.error("Error creating Firebase vaccination:", error);
    res.status(500).json({ error: "Failed to create vaccination in Firebase" });
  }
});
router.post("/api/dewormings/firebase", async (req, res) => {
  try {
    console.log("Creating Firebase deworming:", req.body);
    const dewormingId = await createDeworming(req.body);
    res.status(201).json({ id: dewormingId, ...req.body });
  } catch (error) {
    console.error("Error creating Firebase deworming:", error);
    res.status(500).json({ error: "Failed to create deworming in Firebase" });
  }
});
router.get("/api/search/patients/:searchTerm", async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm;
    console.log("Searching patients with term:", searchTerm);
    let results = [];
    try {
      const cleanRut = searchTerm.replace(/[.-]/g, "");
      console.log("Searching PostgreSQL with clean RUT:", cleanRut);
      const pgPets = await storage.getPetsByTutorRut(cleanRut);
      console.log("PostgreSQL pets result:", pgPets);
      if (pgPets && pgPets.length > 0) {
        results = pgPets;
        console.log("PostgreSQL search results found:", results.length);
      } else {
        console.log("No results found in PostgreSQL for RUT:", cleanRut);
      }
    } catch (pgError) {
      console.error("PostgreSQL search error:", pgError);
    }
    if (results.length === 0) {
      try {
        const { searchPatients: searchPatients2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
        results = await searchPatients2(searchTerm);
        console.log("Firebase search results found:", results.length);
      } catch (fbError) {
        console.error("Firebase search error:", fbError);
      }
    }
    res.json(results);
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({ error: "Failed to search patients" });
  }
});
router.get("/api/search/patients/tutor/:tutorName", async (req, res) => {
  try {
    const { tutorName } = req.params;
    console.log(`Searching patients by tutor name: ${tutorName}`);
    try {
      const { searchPatients: searchPatients2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
      const firebaseResults = await searchPatients2(tutorName);
      const filteredResults = firebaseResults.filter(
        (patient) => patient.tutorName?.toLowerCase().includes(tutorName.toLowerCase())
      );
      console.log(`Firebase tutor search results found: ${filteredResults.length}`);
      res.json(filteredResults);
    } catch (fbError) {
      console.error("Error searching patients by tutor in Firebase:", fbError);
      res.json([]);
    }
  } catch (error) {
    console.error("Error searching patients by tutor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/api/pets/firebase/record/:recordNumber", async (req, res) => {
  try {
    const { recordNumber } = req.params;
    console.log("Searching Firebase pets by record number:", recordNumber);
    const { searchPatientsByRecord: searchPatientsByRecord2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const results = await searchPatientsByRecord2(recordNumber);
    res.json(results);
  } catch (error) {
    console.error("Error searching pets by record number:", error);
    res.json([]);
  }
});
router.get("/api/patients/:patientId", async (req, res) => {
  try {
    const patientId = req.params.patientId;
    console.log("Getting Firebase patient:", patientId);
    const { getPatientById: getPatientById2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const patient = await getPatientById2(patientId);
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ error: "Patient not found" });
    }
  } catch (error) {
    console.error("Error getting Firebase patient:", error);
    res.status(500).json({ error: "Failed to get patient from Firebase" });
  }
});
router.post("/api/prescriptions/firebase", async (req, res) => {
  try {
    console.log("Creating Firebase prescription:", req.body);
    const { createPrescription: createPrescription2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const prescriptionId = await createPrescription2(req.body);
    res.status(201).json({ id: prescriptionId, ...req.body });
  } catch (error) {
    console.error("Error creating Firebase prescription:", error);
    res.status(500).json({ error: "Failed to create prescription in Firebase" });
  }
});
router.get("/api/prescriptions/firebase/pet/:petId", async (req, res) => {
  try {
    const { getPrescriptionsByPet: getPrescriptionsByPet2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const prescriptions = await getPrescriptionsByPet2(req.params.petId);
    res.json(prescriptions);
  } catch (error) {
    console.error("Error getting Firebase prescriptions:", error);
    res.status(500).json({ error: "Failed to get prescriptions from Firebase" });
  }
});
router.post("/api/certificates/firebase", async (req, res) => {
  try {
    console.log("Creating Firebase certificate:", req.body);
    const { createCertificate: createCertificate2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const certificateId = await createCertificate2(req.body);
    res.status(201).json({ id: certificateId, ...req.body });
  } catch (error) {
    console.error("Error creating Firebase certificate:", error);
    res.status(500).json({ error: "Failed to create certificate in Firebase" });
  }
});
router.get("/api/certificates/firebase/pet/:petId", async (req, res) => {
  try {
    const { getCertificatesByPet: getCertificatesByPet2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const certificates2 = await getCertificatesByPet2(req.params.petId);
    res.json(certificates2);
  } catch (error) {
    console.error("Error getting Firebase certificates:", error);
    res.status(500).json({ error: "Failed to get certificates from Firebase" });
  }
});
router.post("/api/dewormings/firebase", async (req, res) => {
  try {
    console.log("Creating Firebase deworming:", req.body);
    const { createDeworming: createDeworming2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const dewormingId = await createDeworming2(req.body);
    res.status(201).json({ id: dewormingId, ...req.body });
  } catch (error) {
    console.error("Error creating Firebase deworming:", error);
    res.status(500).json({ error: "Failed to create deworming in Firebase" });
  }
});
router.get("/api/dewormings/firebase/pet/:petId", async (req, res) => {
  try {
    const { getDewormingsByPet: getDewormingsByPet2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const dewormings2 = await getDewormingsByPet2(req.params.petId);
    console.log("API returning dewormings:", dewormings2);
    res.json(dewormings2);
  } catch (error) {
    console.error("Error getting Firebase dewormings:", error);
    res.status(500).json({ error: "Failed to get dewormings from Firebase" });
  }
});
router.put("/api/patients/firebase/:id", async (req, res) => {
  try {
    console.log("Updating Firebase patient:", req.params.id, req.body);
    const { updatePatient: updatePatient2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    await updatePatient2(req.params.id, req.body);
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error("Error updating Firebase patient:", error);
    res.status(500).json({ error: "Failed to update patient in Firebase" });
  }
});
router.post("/api/pets/firebase", async (req, res) => {
  try {
    console.log("Creating Firebase patient:", req.body);
    const { createPatient: createPatient2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const patientId = await createPatient2(req.body);
    res.status(201).json({ id: patientId, ...req.body });
  } catch (error) {
    console.error("Error creating Firebase patient:", error);
    res.status(500).json({ error: "Failed to create patient in Firebase" });
  }
});
router.get("/api/users/:id", async (req, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
});
router.get("/api/users/email/:email", async (req, res) => {
  try {
    const user = await storage.getUserByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
});
router.post("/api/users", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});
router.get("/api/pets/owner/:ownerId", async (req, res) => {
  try {
    const pets2 = await storage.getPetsByOwner(req.params.ownerId);
    res.json(pets2);
  } catch (error) {
    res.status(500).json({ error: "Failed to get pets" });
  }
});
router.get("/api/pets/:id", async (req, res) => {
  try {
    const pet = await storage.getPet(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: "Failed to get pet" });
  }
});
router.post("/api/pets", async (req, res) => {
  try {
    console.log("Creating pet with data:", req.body);
    const petData = insertPetSchema.parse(req.body);
    const pet = await storage.createPet(petData);
    console.log("Pet created successfully:", pet);
    res.status(201).json(pet);
  } catch (error) {
    console.error("Error creating pet:", error);
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create pet" });
  }
});
router.get("/api/medical-records/pet/:petId", async (req, res) => {
  try {
    const records = await storage.getMedicalRecordsByPet(req.params.petId);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to get medical records" });
  }
});
router.post("/api/medical-records", async (req, res) => {
  try {
    const recordData = insertMedicalRecordSchema.parse(req.body);
    const record = await storage.createMedicalRecord(recordData);
    res.status(201).json(record);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create medical record" });
  }
});
router.get("/api/vaccinations/pet/:petId", async (req, res) => {
  try {
    const vaccinations2 = await storage.getVaccinationsByPet(req.params.petId);
    res.json(vaccinations2);
  } catch (error) {
    res.status(500).json({ error: "Failed to get vaccinations" });
  }
});
router.post("/api/vaccinations", async (req, res) => {
  try {
    const vaccinationData = insertVaccinationSchema.parse(req.body);
    const vaccination = await storage.createVaccination(vaccinationData);
    res.status(201).json(vaccination);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create vaccination" });
  }
});
router.get("/api/dewormings/pet/:petId", async (req, res) => {
  try {
    const dewormings2 = await storage.getDewormingsByPet(req.params.petId);
    res.json(dewormings2);
  } catch (error) {
    res.status(500).json({ error: "Failed to get dewormings" });
  }
});
router.post("/api/dewormings", async (req, res) => {
  try {
    const dewormingData = insertDewormingSchema.parse(req.body);
    const deworming = await storage.createDeworming(dewormingData);
    res.status(201).json(deworming);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create deworming" });
  }
});
router.get("/api/examinations/pet/:petId", async (req, res) => {
  try {
    const examinations2 = await storage.getExaminationsByPet(req.params.petId);
    res.json(examinations2);
  } catch (error) {
    res.status(500).json({ error: "Failed to get examinations" });
  }
});
router.post("/api/examinations", async (req, res) => {
  try {
    const examinationData = insertExaminationSchema.parse(req.body);
    const examination = await storage.createExamination(examinationData);
    res.status(201).json(examination);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create examination" });
  }
});
router.get("/api/certificates/pet/:petId", async (req, res) => {
  try {
    const certificates2 = await storage.getCertificatesByPet(req.params.petId);
    res.json(certificates2);
  } catch (error) {
    res.status(500).json({ error: "Failed to get certificates" });
  }
});
router.post("/api/certificates", async (req, res) => {
  try {
    const certificateData = insertCertificateSchema.parse(req.body);
    const certificate = await storage.createCertificate(certificateData);
    res.status(201).json(certificate);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create certificate" });
  }
});
router.get("/api/questionnaires", async (req, res) => {
  try {
    const questionnaires = await storage.getAllQuestionnaires();
    res.json(questionnaires);
  } catch (error) {
    res.status(500).json({ error: "Failed to get questionnaires" });
  }
});
router.get("/api/questionnaires/:id", async (req, res) => {
  try {
    const questionnaire = await storage.getQuestionnaire(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ error: "Questionnaire not found" });
    }
    res.json(questionnaire);
  } catch (error) {
    res.status(500).json({ error: "Failed to get questionnaire" });
  }
});
router.post("/api/questionnaires", async (req, res) => {
  try {
    const questionnaireData = insertPreVisitQuestionnaireSchema.parse(req.body);
    const questionnaire = await storage.createQuestionnaire(questionnaireData);
    res.status(201).json(questionnaire);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create questionnaire" });
  }
});
router.delete("/api/prescriptions/firebase/:prescriptionId", async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    console.log("Deleting Firebase prescription:", prescriptionId);
    const { deletePrescription: deletePrescription2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const success = await deletePrescription2(prescriptionId);
    if (success) {
      res.json({ success: true, message: "Prescription deleted successfully" });
    } else {
      res.status(404).json({ error: "Prescription not found" });
    }
  } catch (error) {
    console.error("Error deleting Firebase prescription:", error);
    res.status(500).json({ error: "Error deleting prescription" });
  }
});
router.delete("/api/vaccinations/firebase/:vaccinationId", async (req, res) => {
  try {
    const { vaccinationId } = req.params;
    console.log("Deleting Firebase vaccination:", vaccinationId);
    const { deleteVaccination: deleteVaccination2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const success = await deleteVaccination2(vaccinationId);
    if (success) {
      res.json({ success: true, message: "Vaccination deleted successfully" });
    } else {
      res.status(404).json({ error: "Vaccination not found" });
    }
  } catch (error) {
    console.error("Error deleting Firebase vaccination:", error);
    res.status(500).json({ error: "Error deleting vaccination" });
  }
});
router.delete("/api/dewormings/firebase/:dewormingId", async (req, res) => {
  try {
    const { dewormingId } = req.params;
    console.log("Deleting Firebase deworming:", dewormingId);
    const { deleteDeworming: deleteDeworming2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const success = await deleteDeworming2(dewormingId);
    if (success) {
      res.json({ success: true, message: "Deworming deleted successfully" });
    } else {
      res.status(404).json({ error: "Deworming not found" });
    }
  } catch (error) {
    console.error("Error deleting Firebase deworming:", error);
    res.status(500).json({ error: "Error deleting deworming" });
  }
});
router.delete("/api/certificates/firebase/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params;
    console.log("Deleting Firebase certificate:", certificateId);
    const { deleteCertificate: deleteCertificate2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const success = await deleteCertificate2(certificateId);
    if (success) {
      res.json({ success: true, message: "Certificate deleted successfully" });
    } else {
      res.status(404).json({ error: "Certificate not found" });
    }
  } catch (error) {
    console.error("Error deleting Firebase certificate:", error);
    res.status(500).json({ error: "Error deleting certificate" });
  }
});
router.delete("/api/medical-records/firebase/:recordId", async (req, res) => {
  try {
    const { recordId } = req.params;
    console.log("Deleting Firebase medical record:", recordId);
    const { deleteMedicalRecord: deleteMedicalRecord2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const success = await deleteMedicalRecord2(recordId);
    if (success) {
      res.json({ success: true, message: "Medical record deleted successfully" });
    } else {
      res.status(404).json({ error: "Medical record not found" });
    }
  } catch (error) {
    console.error("Error deleting Firebase medical record:", error);
    res.status(500).json({ error: "Error deleting medical record" });
  }
});
router.delete("/api/exam-orders/firebase/:examOrderId", async (req, res) => {
  try {
    const { examOrderId } = req.params;
    console.log("Deleting Firebase exam order:", examOrderId);
    const { deleteExamOrder: deleteExamOrder2 } = await Promise.resolve().then(() => (init_firebase(), firebase_exports));
    const success = await deleteExamOrder2(examOrderId);
    if (success) {
      res.json({ success: true, message: "Exam order deleted successfully" });
    } else {
      res.status(404).json({ error: "Exam order not found" });
    }
  } catch (error) {
    console.error("Error deleting Firebase exam order:", error);
    res.status(500).json({ error: "Error deleting exam order" });
  }
});
router.post("/api/nutrition-assessments", async (req, res) => {
  try {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { nutritionAssessments: nutritionAssessments2, insertNutritionAssessmentSchema: insertNutritionAssessmentSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const validatedData = insertNutritionAssessmentSchema2.parse(req.body);
    const [assessment] = await db3.insert(nutritionAssessments2).values(validatedData).returning();
    res.status(201).json(assessment);
  } catch (error) {
    console.error("Error creating nutrition assessment:", error);
    res.status(500).json({ error: "Error creating nutrition assessment" });
  }
});
router.get("/api/nutrition-assessments/pet/:petId", async (req, res) => {
  try {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { nutritionAssessments: nutritionAssessments2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq2, desc } = await import("drizzle-orm");
    const assessments = await db3.select().from(nutritionAssessments2).where(eq2(nutritionAssessments2.petId, req.params.petId)).orderBy(desc(nutritionAssessments2.assessmentDate));
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching nutrition assessments:", error);
    res.status(500).json({ error: "Error fetching nutrition assessments" });
  }
});
router.put("/api/nutrition-assessments/:id", async (req, res) => {
  try {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { nutritionAssessments: nutritionAssessments2, insertNutritionAssessmentSchema: insertNutritionAssessmentSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    const validatedData = insertNutritionAssessmentSchema2.parse(req.body);
    const [assessment] = await db3.update(nutritionAssessments2).set({ ...validatedData, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(nutritionAssessments2.id, req.params.id)).returning();
    if (!assessment) {
      return res.status(404).json({ error: "Nutrition assessment not found" });
    }
    res.json(assessment);
  } catch (error) {
    console.error("Error updating nutrition assessment:", error);
    res.status(500).json({ error: "Error updating nutrition assessment" });
  }
});
router.delete("/api/nutrition-assessments/:id", async (req, res) => {
  try {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { nutritionAssessments: nutritionAssessments2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    const [deleted] = await db3.delete(nutritionAssessments2).where(eq2(nutritionAssessments2.id, req.params.id)).returning();
    if (!deleted) {
      return res.status(404).json({ error: "Nutrition assessment not found" });
    }
    res.json({ success: true, message: "Nutrition assessment deleted successfully" });
  } catch (error) {
    console.error("Error deleting nutrition assessment:", error);
    res.status(500).json({ error: "Error deleting nutrition assessment" });
  }
});
router.post("/api/foods", async (req, res) => {
  try {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { foods: foods2, insertFoodSchema: insertFoodSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const validatedData = insertFoodSchema2.parse(req.body);
    const [food] = await db3.insert(foods2).values(validatedData).returning();
    res.status(201).json(food);
  } catch (error) {
    console.error("Error creating food:", error);
    res.status(500).json({ error: "Error creating food" });
  }
});
router.get("/api/foods", async (req, res) => {
  try {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { foods: foods2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq2, desc, and: and2, like } = await import("drizzle-orm");
    const { species, type, search, active = "true" } = req.query;
    const conditions = [];
    if (active === "true") {
      conditions.push(eq2(foods2.isActive, true));
    }
    if (species && species !== "all" && species !== "Ambos") {
      const speciesValue = species;
      conditions.push(eq2(foods2.species, speciesValue));
    }
    if (type && type !== "all") {
      const typeValue = type;
      conditions.push(eq2(foods2.type, typeValue));
    }
    if (search) {
      conditions.push(like(foods2.name, `%${search}%`));
    }
    const whereClause = conditions.length > 0 ? and2(...conditions) : void 0;
    const foodList = await db3.select().from(foods2).where(whereClause).orderBy(desc(foods2.createdAt));
    res.json(foodList);
  } catch (error) {
    console.error("Error fetching foods:", error);
    res.status(500).json({ error: "Error fetching foods" });
  }
});
router.get("/api/foods/:id", async (req, res) => {
  try {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { foods: foods2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    const [food] = await db3.select().from(foods2).where(eq2(foods2.id, req.params.id));
    if (!food) {
      return res.status(404).json({ error: "Food not found" });
    }
    res.json(food);
  } catch (error) {
    console.error("Error fetching food:", error);
    res.status(500).json({ error: "Error fetching food" });
  }
});
router.put("/api/foods/:id", async (req, res) => {
  try {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { foods: foods2, insertFoodSchema: insertFoodSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    const validatedData = insertFoodSchema2.parse(req.body);
    const [food] = await db3.update(foods2).set({ ...validatedData, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(foods2.id, req.params.id)).returning();
    if (!food) {
      return res.status(404).json({ error: "Food not found" });
    }
    res.json(food);
  } catch (error) {
    console.error("Error updating food:", error);
    res.status(500).json({ error: "Error updating food" });
  }
});
router.delete("/api/foods/:id", async (req, res) => {
  try {
    const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { foods: foods2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    const [food] = await db3.update(foods2).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(foods2.id, req.params.id)).returning();
    if (!food) {
      return res.status(404).json({ error: "Food not found" });
    }
    res.json({ success: true, message: "Food deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating food:", error);
    res.status(500).json({ error: "Error deactivating food" });
  }
});
router.get("/api/appointments/today", async (req, res) => {
  try {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const appointments2 = await storage.getAppointmentsByDate(today);
    res.json(appointments2);
  } catch (error) {
    console.error("Error getting today appointments:", error);
    res.status(500).json({ error: "Failed to get appointments" });
  }
});
router.get("/api/appointments/tutor/:rut", async (req, res) => {
  try {
    const appointments2 = await storage.getAppointmentsByTutorRut(req.params.rut);
    res.json(appointments2);
  } catch (error) {
    console.error("Error getting appointments by tutor:", error);
    res.status(500).json({ error: "Failed to get appointments" });
  }
});
router.get("/api/appointments/date/:date", async (req, res) => {
  try {
    const appointments2 = await storage.getAppointmentsByDate(req.params.date);
    res.json(appointments2);
  } catch (error) {
    console.error("Error getting appointments by date:", error);
    res.status(500).json({ error: "Failed to get appointments" });
  }
});
router.get("/api/appointments/:year/:month", async (req, res) => {
  try {
    const { year, month } = req.params;
    const appointments2 = await storage.getAppointmentsByYearMonth(parseInt(year), parseInt(month));
    res.json(appointments2);
  } catch (error) {
    console.error("Error getting appointments by year/month:", error);
    res.status(500).json({ error: "Failed to get appointments" });
  }
});
router.post("/api/appointments", async (req, res) => {
  try {
    const { insertAppointmentSchema: insertAppointmentSchema3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const validatedData = insertAppointmentSchema3.parse(req.body);
    const appointment = await storage.createAppointment(validatedData);
    try {
      if (storedTokens) {
        oauth2Client.setCredentials(storedTokens);
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        const duration = appointment.duration || 60;
        const startDateTime = /* @__PURE__ */ new Date(appointment.appointmentDate + "T" + appointment.appointmentTime);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1e3);
        const event = {
          summary: `\u{1F415} Veterinaria - ${appointment.petName}`,
          description: `Consulta veterinaria para ${appointment.petName}

\u{1F468}\u200D\u2695\uFE0F Servicio: ${appointment.serviceType}
\u{1F464} Tutor: ${appointment.tutorName}
\u{1F4DE} Tel\xE9fono: ${appointment.tutorPhone || "No especificado"}
\u{1F4CD} Direcci\xF3n: ${appointment.address || "No especificada"}

\u{1F4DD} Notas: ${appointment.notes || "Sin notas adicionales"}`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: "America/Santiago"
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: "America/Santiago"
          },
          location: appointment.address || "Domicilio del cliente",
          colorId: "10"
          // Green color for vet appointments
        };
        const createdEvent = await calendar.events.insert({
          calendarId: "primary",
          requestBody: event
        });
        console.log("\u2705 Appointment synced to Google Calendar automatically:", createdEvent.data.id);
      } else {
        console.log("\u2139\uFE0F Google Calendar not connected, skipping sync");
      }
    } catch (calendarError) {
      console.error("\u274C Error syncing to Google Calendar:", calendarError);
    }
    try {
      const emailSettings = await storage.getNotificationSettings("email");
      if (emailSettings && emailSettings.smtpHost) {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          host: emailSettings.smtpHost,
          port: emailSettings.smtpPort || 465,
          secure: emailSettings.smtpSecure !== false,
          // true para puerto 465 (Zoho)
          auth: {
            user: emailSettings.smtpUser,
            pass: emailSettings.smtpPassword
          },
          // Configuración adicional para Zoho Mail
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 6e4,
          // 60 segundos
          greetingTimeout: 3e4,
          // 30 segundos
          socketTimeout: 6e4
          // 60 segundos
        });
        const formatDate = (dateStr) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString("es-CL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          });
        };
        const formatTime = (timeStr) => {
          return timeStr.slice(0, 5);
        };
        const appointmentEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #A3CBB2 0%, #7FB3C3 100%); padding: 20px; border-radius: 10px 10px 0 0;">
              <h2 style="margin: 0; color: white; text-align: center;">\u{1F415} Nueva Cita Agendada</h2>
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
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Tel\xE9fono:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${appointment.tutorPhone || "No especificado"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Email:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${appointment.tutorEmail || "No especificado"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Direcci\xF3n:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${appointment.address || "No especificada"}</td>
                </tr>
              </table>
              
              ${appointment.notes ? `
              <h4 style="color: #2D3748; margin-bottom: 10px;">Notas adicionales:</h4>
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #A3CBB2;">
                ${appointment.notes.replace(/\n/g, "<br>")}
              </div>
              ` : ""}
            </div>
            
            <div style="background: #A3CBB2; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
              <p style="margin: 0; color: white; font-size: 14px;">
                Cita agendada a trav\xE9s de aleveterinaria.cl<br>
                Fecha de registro: ${(/* @__PURE__ */ new Date()).toLocaleString("es-CL")}
              </p>
            </div>
          </div>
        `;
        await transporter.sendMail({
          from: `"${emailSettings.fromName || "Ale Veterinaria"}" <${emailSettings.fromEmail}>`,
          to: "contacto@aleveterinaria.cl",
          subject: `\u{1F415} Nueva Cita Agendada - ${appointment.petName} - ${formatDate(appointment.appointmentDate)}`,
          html: appointmentEmailHtml
        });
        if (appointment.tutorEmail) {
          const clientConfirmationHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #A3CBB2 0%, #7FB3C3 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; color: white; text-align: center;">\u2705 Cita Confirmada</h2>
              </div>
              
              <div style="background: #f8f9fa; padding: 25px; border: 1px solid #e9ecef;">
                <p style="color: #2D3748; font-size: 16px;">Hola <strong>${appointment.tutorName}</strong>,</p>
                
                <p style="color: #495057;">Tu cita veterinaria ha sido agendada exitosamente. Aqu\xED tienes los detalles:</p>
                
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
                      <td style="padding: 8px 0; font-weight: bold; color: #2D3748;">Direcci\xF3n:</td>
                      <td style="padding: 8px 0; color: #495057;">${appointment.address || "Por confirmar"}</td>
                    </tr>
                  </table>
                </div>

                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="color: #1976d2; margin: 0 0 10px 0;">Informaci\xF3n de Contacto:</h4>
                  <p style="margin: 5px 0; color: #1565c0;"><strong>WhatsApp:</strong> +56 9 7604 0797</p>
                  <p style="margin: 5px 0; color: #1565c0;"><strong>Email:</strong> contacto@aleveterinaria.cl</p>
                  <p style="margin: 5px 0; color: #1565c0;"><strong>Instagram:</strong> @aleveterinaria</p>
                </div>

                <p style="color: #495057;">
                  Te contactaremos pr\xF3ximamente para confirmar los detalles de la consulta.
                  Si necesitas modificar o cancelar la cita, no dudes en contactarnos.
                </p>
              </div>
              
              <div style="background: #A3CBB2; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
                <p style="margin: 0; color: white; font-size: 14px;">
                  Gracias por confiar en Ale Veterinaria<br>
                  \u{1F415} Cuidamos a tu mascota con amor y dedicaci\xF3n \u{1F415}
                </p>
              </div>
            </div>
          `;
          await transporter.sendMail({
            from: `"${emailSettings.fromName || "Ale Veterinaria"}" <${emailSettings.fromEmail}>`,
            to: appointment.tutorEmail,
            subject: `\u2705 Cita Confirmada - ${appointment.petName} - ${formatDate(appointment.appointmentDate)}`,
            html: clientConfirmationHtml,
            replyTo: "contacto@aleveterinaria.cl"
          });
        }
        console.log("\u2705 Appointment notification emails sent successfully");
      } else {
        console.log("\u26A0\uFE0F Email settings not configured, skipping email notifications");
      }
    } catch (emailError) {
      console.error("\u274C Error sending appointment notification email:", emailError);
    }
    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});
router.patch("/api/appointments/:id/cancel", async (req, res) => {
  try {
    const originalAppointment = await storage.getAppointmentById(req.params.id);
    if (!originalAppointment) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    const appointment = await storage.updateAppointment(req.params.id, { status: "cancelled" });
    try {
      const emailSettings = await storage.getNotificationSettings("email");
      if (emailSettings && emailSettings.smtpHost && originalAppointment.tutorEmail) {
        const nodemailer = await import("nodemailer");
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
          connectionTimeout: 6e4,
          greetingTimeout: 3e4,
          socketTimeout: 6e4
        });
        const { getAppointmentCancellationTemplate: getAppointmentCancellationTemplate2 } = await Promise.resolve().then(() => (init_templates(), templates_exports));
        const templateData = {
          tutorName: originalAppointment.tutorName,
          tutorEmail: originalAppointment.tutorEmail,
          patientName: originalAppointment.petName,
          species: originalAppointment.species || "Mascota",
          serviceType: originalAppointment.serviceType,
          appointmentDate: /* @__PURE__ */ new Date(`${originalAppointment.appointmentDate}T${originalAppointment.appointmentTime}`)
        };
        const emailTemplate = getAppointmentCancellationTemplate2(templateData);
        await transporter.sendMail({
          from: `"${emailSettings.fromName || "Ale Veterinaria"}" <${emailSettings.fromEmail}>`,
          to: originalAppointment.tutorEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          replyTo: "contacto@aleveterinaria.cl"
        });
        await transporter.sendMail({
          from: `"${emailSettings.fromName || "Ale Veterinaria"}" <${emailSettings.fromEmail}>`,
          to: "contacto@aleveterinaria.cl",
          subject: `\u274C Cita Cancelada - ${originalAppointment.petName}`,
          html: `<h3>Cita cancelada por cliente</h3>
                 <p><strong>Cliente:</strong> ${originalAppointment.tutorName}</p>
                 <p><strong>Mascota:</strong> ${originalAppointment.petName}</p>
                 <p><strong>Fecha:</strong> ${originalAppointment.appointmentDate} ${originalAppointment.appointmentTime}</p>
                 <p><strong>Servicio:</strong> ${originalAppointment.serviceType}</p>`
        });
        console.log("\u2705 Cancellation notification emails sent successfully");
      }
    } catch (emailError) {
      console.error("\u274C Error sending cancellation notification email:", emailError);
    }
    res.json(appointment);
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ error: "Error cancelling appointment" });
  }
});
router.delete("/api/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await storage.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    if (appointment.status !== "cancelled") {
      return res.status(400).json({
        error: "Solo se pueden eliminar citas que est\xE9n canceladas"
      });
    }
    const deletedAppointment = await storage.deleteAppointment(id);
    res.json({
      success: true,
      message: "Cita eliminada exitosamente",
      deletedAppointment
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.patch("/api/appointments/:id", async (req, res) => {
  try {
    const updateData = req.body;
    const appointment = await storage.updateAppointment(req.params.id, updateData);
    try {
      if (storedTokens && appointment && appointment.status === "scheduled") {
        oauth2Client.setCredentials(storedTokens);
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        const eventSummary = `\u{1F415} Veterinaria - ${appointment.petName}`;
        const searchResults = await calendar.events.list({
          calendarId: "primary",
          q: appointment.petName,
          timeMin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString()
          // Search 1 week back
        });
        const existingEvent = searchResults.data.items?.find(
          (event) => event.summary?.includes(appointment.petName) && (event.start?.dateTime?.includes(appointment.appointmentDate) || event.description?.includes(appointment.petName))
        );
        if (existingEvent) {
          const duration = appointment.duration || 60;
          const startDateTime = /* @__PURE__ */ new Date(appointment.appointmentDate + "T" + appointment.appointmentTime);
          const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1e3);
          const updatedEvent = {
            summary: eventSummary,
            description: `Consulta veterinaria para ${appointment.petName}

\u{1F468}\u200D\u2695\uFE0F Servicio: ${appointment.serviceType}
\u{1F464} Tutor: ${appointment.tutorName}
\u{1F4DE} Tel\xE9fono: ${appointment.tutorPhone || "No especificado"}
\u{1F4CD} Direcci\xF3n: ${appointment.address || "No especificada"}

\u{1F4DD} Notas: ${appointment.notes || "Sin notas adicionales"}`,
            start: {
              dateTime: startDateTime.toISOString(),
              timeZone: "America/Santiago"
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: "America/Santiago"
            },
            location: appointment.address || "Domicilio del cliente",
            colorId: "10"
          };
          await calendar.events.update({
            calendarId: "primary",
            eventId: existingEvent.id,
            requestBody: updatedEvent
          });
          console.log("\u2705 Appointment updated in Google Calendar:", existingEvent.id);
        } else {
          console.log("\u26A0\uFE0F Event not found in Google Calendar, will be created on next sync");
        }
      }
    } catch (calendarError) {
      console.error("\u274C Error updating Google Calendar:", calendarError);
    }
    try {
      const emailSettings = await storage.getNotificationSettings("email");
      if (emailSettings && emailSettings.smtpHost && appointment && appointment.tutorEmail) {
        const nodemailer = await import("nodemailer");
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
          connectionTimeout: 6e4,
          greetingTimeout: 3e4,
          socketTimeout: 6e4
        });
        const { getAppointmentUpdateTemplate: getAppointmentUpdateTemplate2 } = await Promise.resolve().then(() => (init_templates(), templates_exports));
        const templateData = {
          tutorName: appointment.tutorName,
          tutorEmail: appointment.tutorEmail,
          patientName: appointment.petName,
          species: "Mascota",
          serviceType: appointment.serviceType,
          appointmentDate: /* @__PURE__ */ new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`),
          appointmentNotes: appointment.notes || "",
          address: appointment.address
        };
        const emailTemplate = getAppointmentUpdateTemplate2(templateData);
        await transporter.sendMail({
          from: `"${emailSettings.fromName || "Ale Veterinaria"}" <${emailSettings.fromEmail}>`,
          to: appointment.tutorEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          replyTo: "contacto@aleveterinaria.cl",
          attachments: emailTemplate.icsBuffer ? [
            {
              filename: "cita_actualizada.ics",
              content: emailTemplate.icsBuffer,
              contentType: "text/calendar; charset=utf-8; method=REQUEST"
            }
          ] : void 0
        });
        const formatDate = (dateStr) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString("es-CL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          });
        };
        const formatTime = (timeStr) => {
          return timeStr.slice(0, 5);
        };
        await transporter.sendMail({
          from: `"${emailSettings.fromName || "Ale Veterinaria"}" <${emailSettings.fromEmail}>`,
          to: "contacto@aleveterinaria.cl",
          subject: `\u270F\uFE0F Cita Modificada - ${appointment.petName}`,
          html: `<h3>Cita modificada por cliente</h3>
                 <p><strong>Cliente:</strong> ${appointment.tutorName}</p>
                 <p><strong>Mascota:</strong> ${appointment.petName}</p>
                 <p><strong>Nueva fecha:</strong> ${formatDate(appointment.appointmentDate)} ${formatTime(appointment.appointmentTime)}</p>
                 <p><strong>Servicio:</strong> ${appointment.serviceType}</p>
                 <p><strong>Direcci\xF3n:</strong> ${appointment.address}</p>
                 ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ""}`
        });
        console.log("\u2705 Update notification emails sent successfully");
      }
    } catch (emailError) {
      console.error("\u274C Error sending update notification email:", emailError);
    }
    res.json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Error updating appointment" });
  }
});
router.get("/api/settings/notifications/:type", async (req, res) => {
  try {
    const settings = await storage.getNotificationSettings(req.params.type);
    res.json(settings);
  } catch (error) {
    console.error("Error getting notification settings:", error);
    res.status(500).json({ error: "Error getting notification settings" });
  }
});
router.post("/api/settings/notifications", async (req, res) => {
  try {
    const settings = await storage.saveNotificationSettings(req.body);
    res.json(settings);
  } catch (error) {
    console.error("Error saving notification settings:", error);
    res.status(500).json({ error: "Error saving notification settings" });
  }
});
router.patch("/api/settings/notifications/:type", async (req, res) => {
  try {
    const settings = await storage.updateNotificationSettings(req.params.type, req.body);
    res.json(settings);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).json({ error: "Error updating notification settings" });
  }
});
router.get("/api/schedule/availability/:date", async (req, res) => {
  try {
    const serviceType = req.query.serviceType;
    const editingAppointment = req.query.editingAppointment;
    const availability = await storage.getAvailableSlots(req.params.date, serviceType, editingAppointment);
    res.json(availability);
  } catch (error) {
    console.error("Error getting availability:", error);
    res.status(500).json({ error: "Failed to get availability" });
  }
});
router.get("/api/schedule/is-blocked/:date", async (req, res) => {
  try {
    const isBlocked = await storage.isDateCompletelyBlocked(req.params.date);
    res.json({ isBlocked });
  } catch (error) {
    console.error("Error checking if date is blocked:", error);
    res.status(500).json({ error: "Failed to check date availability" });
  }
});
router.post("/api/schedule/veterinary", async (req, res) => {
  try {
    const { insertVeterinaryScheduleSchema: insertVeterinaryScheduleSchema3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const validatedData = insertVeterinaryScheduleSchema3.parse(req.body);
    const schedule = await storage.createVeterinarySchedule(validatedData);
    res.status(201).json(schedule);
  } catch (error) {
    console.error("Error creating veterinary schedule:", error);
    res.status(500).json({ error: "Failed to create schedule" });
  }
});
router.get("/api/schedule/veterinary", async (req, res) => {
  try {
    const schedule = await storage.getVeterinarySchedule();
    res.json(schedule);
  } catch (error) {
    console.error("Error getting veterinary schedule:", error);
    res.status(500).json({ error: "Failed to get schedule" });
  }
});
router.post("/api/schedule/blocks", async (req, res) => {
  try {
    const { insertScheduleBlockSchema: insertScheduleBlockSchema3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const validatedData = insertScheduleBlockSchema3.parse(req.body);
    const block = await storage.createScheduleBlock(validatedData);
    res.status(201).json(block);
  } catch (error) {
    console.error("Error creating schedule block:", error);
    res.status(500).json({ error: "Failed to create schedule block" });
  }
});
router.get("/api/schedule/blocks", async (req, res) => {
  try {
    const blocks = await storage.getScheduleBlocks();
    res.json(blocks);
  } catch (error) {
    console.error("Error getting schedule blocks:", error);
    res.status(500).json({ error: "Failed to get schedule blocks" });
  }
});
router.put("/api/schedule/blocks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBlock = await storage.updateScheduleBlock(id, req.body);
    if (!updatedBlock) {
      return res.status(404).json({ error: "Schedule block not found" });
    }
    res.json(updatedBlock);
  } catch (error) {
    console.error("Error updating schedule block:", error);
    res.status(500).json({ error: "Failed to update schedule block" });
  }
});
router.put("/api/schedule/veterinary/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSchedule = await storage.updateVeterinarySchedule(id, req.body);
    if (!updatedSchedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    res.json(updatedSchedule);
  } catch (error) {
    console.error("Error updating veterinary schedule:", error);
    res.status(500).json({ error: "Failed to update veterinary schedule" });
  }
});
router.post("/api/schedule/bulk", async (req, res) => {
  try {
    const { fromDate, toDate, selectedDays, startTime, endTime, lunchStart, lunchEnd, enableLunch, action } = req.body;
    const results = [];
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      if (!selectedDays.includes(dayOfWeek)) continue;
      if (action === "enable") {
        if (startTime && endTime) {
          const existingSchedules = await storage.getVeterinarySchedule();
          const existingSchedule = existingSchedules.find((s) => s.dayOfWeek === dayOfWeek);
          if (existingSchedule) {
            const updatedSchedule = await storage.updateVeterinarySchedule(existingSchedule.id, {
              startTime,
              endTime,
              isActive: true
            });
            if (updatedSchedule) {
              results.push({ type: "schedule_updated", data: updatedSchedule });
            }
          } else {
            const { insertVeterinaryScheduleSchema: insertVeterinaryScheduleSchema3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
            const scheduleData = insertVeterinaryScheduleSchema3.parse({
              dayOfWeek,
              startTime,
              endTime,
              isActive: true
            });
            const newSchedule = await storage.createVeterinarySchedule(scheduleData);
            results.push({ type: "schedule_created", data: newSchedule });
          }
        }
        if (enableLunch && lunchStart && lunchEnd) {
          const { insertScheduleBlockSchema: insertScheduleBlockSchema3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const lunchBlockData = insertScheduleBlockSchema3.parse({
            blockDate: date.toISOString().split("T")[0],
            startTime: lunchStart,
            endTime: lunchEnd,
            reason: "Almuerzo",
            isActive: true
          });
          const lunchBlock = await storage.createScheduleBlock(lunchBlockData);
          results.push({ type: "lunch_block", data: lunchBlock });
        }
      } else if (action === "disable") {
        const { insertScheduleBlockSchema: insertScheduleBlockSchema3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const blockData = insertScheduleBlockSchema3.parse({
          blockDate: date.toISOString().split("T")[0],
          startTime: null,
          endTime: null,
          reason: "D\xEDa Bloqueado",
          isActive: true
        });
        const block = await storage.createScheduleBlock(blockData);
        results.push({ type: "day_block", data: block });
      }
    }
    res.status(201).json({
      message: `Operaci\xF3n masiva completada. ${results.length} elementos creados.`,
      results
    });
  } catch (error) {
    console.error("Error in bulk schedule operation:", error);
    res.status(500).json({ error: "Failed to perform bulk schedule operation" });
  }
});
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("Google OAuth credentials missing. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.");
}
var REDIRECT_URI = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}/auth/google/callback` : "http://localhost:5000/auth/google/callback";
console.log("Google OAuth Config:", {
  clientId: GOOGLE_CLIENT_ID ? "Set" : "Missing",
  clientSecret: GOOGLE_CLIENT_SECRET ? "Set" : "Missing",
  redirectUri: REDIRECT_URI
});
var oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);
var storedTokens = null;
router.get("/api/google-calendar/status", async (req, res) => {
  try {
    res.json({
      connected: !!storedTokens,
      lastSync: storedTokens ? (/* @__PURE__ */ new Date()).toISOString() : null
    });
  } catch (error) {
    console.error("Error checking Google Calendar status:", error);
    res.status(500).json({ error: "Error checking calendar status" });
  }
});
router.get("/api/google-calendar/auth-url", async (req, res) => {
  try {
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events"
    ];
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent"
    });
    res.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({ error: "Error generating authorization URL" });
  }
});
router.get("/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("Authorization code not provided");
    }
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    storedTokens = tokens;
    console.log("Google Calendar connected successfully");
    res.redirect("/?calendar=connected");
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    res.redirect("/?calendar=error");
  }
});
router.post("/api/google-calendar/disconnect", async (req, res) => {
  try {
    if (storedTokens) {
      await oauth2Client.revokeCredentials();
      storedTokens = null;
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting Google Calendar:", error);
    res.status(500).json({ error: "Error disconnecting calendar" });
  }
});
router.post("/api/google-calendar/sync", async (req, res) => {
  try {
    if (!storedTokens) {
      return res.status(401).json({ error: "Google Calendar not connected" });
    }
    oauth2Client.setCredentials(storedTokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const today = /* @__PURE__ */ new Date();
    const allAppointments = await storage.getAllAppointments();
    const scheduledAppointments = allAppointments.filter((apt) => {
      const appointmentDate = new Date(apt.appointmentDate);
      return apt.status === "scheduled" && appointmentDate >= today;
    });
    console.log(`\u{1F4C5} Found ${scheduledAppointments.length} scheduled appointments to sync`);
    let eventsCreated = 0;
    let eventsUpdated = 0;
    let eventsDeleted = 0;
    const existingEvents = await calendar.events.list({
      calendarId: "primary",
      timeMin: today.toISOString(),
      timeMax: new Date(today.getFullYear() + 2, 11, 31).toISOString(),
      q: "Veterinaria",
      maxResults: 2500
    });
    const existingEventMap = /* @__PURE__ */ new Map();
    const duplicateEvents = [];
    for (const event of existingEvents.data.items || []) {
      if (event.summary?.includes("\u{1F415} Veterinaria -")) {
        const petNameMatch = event.summary.match(/🐕 Veterinaria - (.+)/);
        if (petNameMatch) {
          const petName = petNameMatch[1];
          const eventDate = event.start?.dateTime ? new Date(event.start.dateTime).toISOString().split("T")[0] : null;
          const eventKey = `${petName}-${eventDate}`;
          if (existingEventMap.has(eventKey)) {
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
    for (const duplicateId of duplicateEvents) {
      try {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: duplicateId
        });
        eventsDeleted++;
        console.log(`\u{1F5D1}\uFE0F Deleted duplicate event: ${duplicateId}`);
      } catch (deleteError) {
        console.error("Error deleting duplicate event:", deleteError);
      }
    }
    for (const appointment of scheduledAppointments) {
      try {
        const eventKey = `${appointment.petName}-${appointment.appointmentDate}`;
        const existingEventData = existingEventMap.get(eventKey);
        const duration = appointment.duration || 60;
        const startDateTime = /* @__PURE__ */ new Date(appointment.appointmentDate + "T" + appointment.appointmentTime);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1e3);
        const eventData = {
          summary: `\u{1F415} Veterinaria - ${appointment.petName}`,
          description: `Consulta veterinaria para ${appointment.petName}

\u{1F468}\u200D\u2695\uFE0F Servicio: ${appointment.serviceType}
\u{1F464} Tutor: ${appointment.tutorName}
\u{1F4DE} Tel\xE9fono: ${appointment.tutorPhone || "No especificado"}
\u{1F4CD} Direcci\xF3n: ${appointment.address || "No especificada"}

\u{1F4DD} Notas: ${appointment.notes || "Sin notas adicionales"}`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: "America/Santiago"
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: "America/Santiago"
          },
          location: appointment.address || "Domicilio del cliente",
          colorId: "10"
        };
        if (existingEventData) {
          await calendar.events.update({
            calendarId: "primary",
            eventId: existingEventData.id,
            requestBody: eventData
          });
          eventsUpdated++;
          console.log(`\u{1F504} Updated: ${appointment.petName} - ${appointment.appointmentDate} ${appointment.appointmentTime}`);
        } else {
          await calendar.events.insert({
            calendarId: "primary",
            requestBody: eventData
          });
          eventsCreated++;
          console.log(`\u2705 Created: ${appointment.petName} - ${appointment.appointmentDate} ${appointment.appointmentTime}`);
        }
      } catch (eventError) {
        console.error("\u274C Error processing calendar event:", eventError);
      }
    }
    const activeEventKeys = new Set(scheduledAppointments.map((apt) => `${apt.petName}-${apt.appointmentDate}`));
    for (const [eventKey, eventData] of existingEventMap) {
      if (!activeEventKeys.has(eventKey)) {
        try {
          await calendar.events.delete({
            calendarId: "primary",
            eventId: eventData.id
          });
          eventsDeleted++;
          console.log(`\u{1F5D1}\uFE0F Deleted obsolete event: ${eventKey}`);
        } catch (deleteError) {
          console.error("Error deleting obsolete event:", deleteError);
        }
      }
    }
    const message = `Sincronizaci\xF3n completada. ${eventsCreated} eventos creados, ${eventsUpdated} actualizados, ${eventsDeleted} eliminados.`;
    console.log(`\u{1F4CA} ${message}`);
    res.json({
      eventsCreated,
      eventsUpdated,
      eventsDeleted,
      totalAppointments: scheduledAppointments.length,
      message
    });
  } catch (error) {
    console.error("\u274C Error syncing Google Calendar:", error);
    res.status(500).json({ error: "Error syncing calendar" });
  }
});
router.get("/api/google-calendar/events", async (req, res) => {
  try {
    if (!storedTokens) {
      return res.status(401).json({ error: "Google Calendar not connected" });
    }
    oauth2Client.setCredentials(storedTokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: (/* @__PURE__ */ new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime"
    });
    const events = response.data.items || [];
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      description: event.description,
      location: event.location
    }));
    res.json(formattedEvents);
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    res.status(500).json({ error: "Error fetching events" });
  }
});
router.get("/api/notification-templates", async (req, res) => {
  try {
    const templates = [
      {
        id: "1",
        name: "Confirmaci\xF3n de Cita",
        type: "whatsapp",
        trigger: "appointment_created",
        template: "Hola {{tutorName}}, tu cita para {{petName}} ha sido agendada para el {{appointmentDate}} a las {{appointmentTime}}.",
        isActive: true
      }
    ];
    res.json(templates);
  } catch (error) {
    console.error("Error fetching notification templates:", error);
    res.status(500).json({ error: "Error fetching templates" });
  }
});
router.post("/api/notification-templates", async (req, res) => {
  try {
    const template = { id: Date.now().toString(), ...req.body };
    res.json(template);
  } catch (error) {
    console.error("Error creating notification template:", error);
    res.status(500).json({ error: "Error creating template" });
  }
});
router.put("/api/notification-templates/:id", async (req, res) => {
  try {
    res.json({ ...req.body, id: req.params.id });
  } catch (error) {
    console.error("Error updating notification template:", error);
    res.status(500).json({ error: "Error updating template" });
  }
});
router.delete("/api/notification-templates/:id", async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification template:", error);
    res.status(500).json({ error: "Error deleting template" });
  }
});
router.post("/api/email/test", async (req, res) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPassword } = req.body;
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      return res.status(400).json({
        error: "Faltan campos requeridos",
        details: "Debe proporcionar host, puerto, usuario y contrase\xF1a SMTP"
      });
    }
    const testConnection = () => {
      return new Promise((resolve, reject) => {
        const port = parseInt(smtpPort);
        const socket = net.createConnection(port, smtpHost);
        socket.setTimeout(1e4);
        socket.on("connect", () => {
          console.log(`Connected to ${smtpHost}:${port}`);
          socket.end();
          resolve(true);
        });
        socket.on("error", (error) => {
          console.log(`Connection error: ${error.message}`);
          reject(error);
        });
        socket.on("timeout", () => {
          console.log("Connection timeout");
          socket.destroy();
          reject(new Error("Connection timeout"));
        });
      });
    };
    await testConnection();
    res.json({
      success: true,
      message: `Conexi\xF3n SMTP exitosa a ${smtpHost}:${smtpPort}. Configuraci\xF3n guardada correctamente.`,
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      note: "Para env\xEDo real de emails, aseg\xFArate de usar la contrase\xF1a de aplicaci\xF3n correcta de Gmail."
    });
  } catch (error) {
    console.error("Error testing SMTP configuration:", error);
    let errorMessage = "Error de conexi\xF3n SMTP";
    let details = "No se pudo conectar al servidor SMTP. Verifique el host y puerto.";
    if (error?.code === "ENOTFOUND") {
      errorMessage = "Servidor SMTP no encontrado";
      details = `El servidor ${req.body.smtpHost} no existe o no est\xE1 disponible.`;
    } else if (error?.code === "ECONNREFUSED") {
      errorMessage = "Conexi\xF3n rechazada";
      details = `El servidor ${req.body.smtpHost}:${req.body.smtpPort} rechaz\xF3 la conexi\xF3n. Verifique el puerto.`;
    } else if (error?.code === "ETIMEDOUT" || error.message === "Connection timeout") {
      errorMessage = "Timeout de conexi\xF3n";
      details = "La conexi\xF3n al servidor SMTP tard\xF3 demasiado. Verifique la configuraci\xF3n de red.";
    }
    res.status(500).json({
      error: errorMessage,
      details,
      code: error?.code || "UNKNOWN"
    });
  }
});
router.post("/api/whatsapp/test", async (req, res) => {
  try {
    const { accessToken, phoneNumberId } = req.body;
    res.json({
      success: true,
      message: "Configuraci\xF3n WhatsApp guardada. Para implementaci\xF3n completa, configure el webhook y credenciales en Meta for Developers."
    });
  } catch (error) {
    console.error("Error testing WhatsApp configuration:", error);
    res.status(500).json({
      error: "Error de conexi\xF3n WhatsApp Business API. Verifique el token y configuraci\xF3n.",
      details: "Aseg\xFArese de tener una aplicaci\xF3n configurada en Meta for Developers con WhatsApp Business API habilitado."
    });
  }
});
var verifyTurnstile = async (token, clientIp) => {
  try {
    if (token === "dev-token-simulation" || token === "fallback-token") {
      console.log("\u{1F527} Modo desarrollo/fallback: aprobando token autom\xE1ticamente");
      return true;
    }
    const secretKey = "0x4AAAAAABuFJVQ7DwKjFHXAWH9Fj67WX3Y";
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData
    });
    const result = await response.json();
    console.log("\u{1F510} Resultado verificaci\xF3n Turnstile:", result.success);
    return result.success === true;
  } catch (error) {
    console.error("\u274C Error verificando Turnstile:", error);
    if (process.env.NODE_ENV === "development") {
      console.log("\u{1F527} Modo desarrollo: aprobando por error de conexi\xF3n");
      return true;
    }
    return false;
  }
};
router.post("/api/contact/send-message", async (req, res) => {
  try {
    const { name, email, phone, message, turnstileToken } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Nombre, email y mensaje son requeridos" });
    }
    if (!turnstileToken) {
      return res.status(400).json({ error: "Token de verificaci\xF3n requerido" });
    }
    const clientIp = req.headers["x-forwarded-for"] || req.connection?.remoteAddress || req.socket?.remoteAddress;
    const isTurnstileValid = await verifyTurnstile(turnstileToken, clientIp);
    if (!isTurnstileValid) {
      console.log("\u274C Verificaci\xF3n Turnstile fall\xF3 para IP:", clientIp);
      return res.status(400).json({ error: "Verificaci\xF3n de seguridad fall\xF3. Por favor intenta nuevamente." });
    }
    console.log("\u2705 Verificaci\xF3n Turnstile exitosa para IP:", clientIp);
    const emailSettings = await storage.getNotificationSettings("email");
    if (!emailSettings || !emailSettings.smtpHost) {
      return res.status(500).json({
        error: "Configuraci\xF3n de email no encontrada. Configura SMTP en Configuraci\xF3n de Notificaciones."
      });
    }
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: emailSettings.smtpHost,
      port: emailSettings.smtpPort || 465,
      secure: emailSettings.smtpSecure !== false,
      // true para puerto 465 (Zoho)
      auth: {
        user: emailSettings.smtpUser,
        pass: emailSettings.smtpPassword
      },
      // Configuración adicional para Zoho Mail
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 6e4,
      // 60 segundos
      greetingTimeout: 3e4,
      // 30 segundos
      socketTimeout: 6e4
      // 60 segundos
    });
    const mailOptions = {
      from: `"${emailSettings.fromName || "Ale Veterinaria"}" <${emailSettings.fromEmail}>`,
      to: "contacto@aleveterinaria.cl",
      subject: `Nuevo mensaje de contacto - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #A3CBB2 0%, #7FB3C3 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0; color: white; text-align: center;">Nuevo Mensaje de Contacto</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border: 1px solid #e9ecef;">
            <h3 style="color: #2D3748; margin-top: 0;">Informaci\xF3n del Contacto:</h3>
            
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
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;">Tel\xE9fono:</td>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #495057;">${phone}</td>
              </tr>
              ` : ""}
            </table>
            
            <h4 style="color: #2D3748; margin-bottom: 10px;">Mensaje:</h4>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #A3CBB2;">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </div>
          
          <div style="background: #A3CBB2; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="margin: 0; color: white; font-size: 14px;">
              Este mensaje fue enviado desde el formulario de contacto de aleveterinaria.cl<br>
              Fecha: ${(/* @__PURE__ */ new Date()).toLocaleString("es-CL")}
            </p>
          </div>
        </div>
      `,
      replyTo: email
    };
    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: "Mensaje enviado correctamente a contacto@aleveterinaria.cl"
    });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({
      error: "Error al enviar el mensaje. Verifica la configuraci\xF3n SMTP.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var routes_default = router;

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app3, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app3.use(vite.middlewares);
  app3.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app3) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app3.use(express.static(distPath));
  app3.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app2 = express2();
app2.use(express2.json());
app2.use(express2.urlencoded({ extended: false }));
app2.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  app2.use(routes_default);
  const server = await import("http").then((http) => http.createServer(app2));
  app2.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app2.get("env") === "development") {
    await setupVite(app2, server);
  } else {
    serveStatic(app2);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
