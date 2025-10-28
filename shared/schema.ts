import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Use Firebase UID directly, no default
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["veterinarian", "owner"] }).notNull(),
  name: text("name").notNull(),
  rut: text("rut").unique(), // Chilean RUT for owners
  phone: text("phone"),
  address: text("address"),
  commune: text("commune"), // Chilean commune
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pets = pgTable("pets", {
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
  anamnesis: text("anamnesis"), // Remote anamnesis
  // Tutor information stored with pet
  tutorName: text("tutor_name"),
  tutorPhone: text("tutor_phone"),
  tutorEmail: text("tutor_email"),
  tutorCity: text("tutor_city"),
  tutorAddress: text("tutor_address"),
  tutorRegion: text("tutor_region"),
  tutorComuna: text("tutor_comuna"),
  tutorHouseNumber: text("tutor_house_number"),
  tutorApartmentNumber: text("tutor_apartment_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicalRecords = pgTable("medical_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: varchar("pet_id").notNull().references(() => pets.id),
  veterinarianId: varchar("veterinarian_id").notNull().references(() => users.id),
  type: text("type", { enum: ["consultation", "vaccination", "deworming", "examination", "certificate", "prescription"] }).notNull(),
  date: timestamp("date").notNull(),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  notes: text("notes"),
  documents: json("documents").$type<string[]>().default([]),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const vaccinations = pgTable("vaccinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: varchar("pet_id").notNull().references(() => pets.id),
  veterinarianId: varchar("veterinarian_id").notNull().references(() => users.id),
  vaccineName: text("vaccine_name").notNull(),
  laboratory: text("laboratory").notNull(),
  batch: text("batch"),
  expiryDate: timestamp("expiry_date"),
  applicationDate: timestamp("application_date").notNull(),
  pathogens: json("pathogens").$type<string[]>().default([]),
  selectedDiseases: json("selected_diseases").$type<string[]>().default([]),
  vaccineType: text("vaccine_type", { enum: ["viva_modificada", "inactivada", "mixta"] }),
  nextDueDate: timestamp("next_due_date"),
  certificate: text("certificate"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dewormings = pgTable("dewormings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: varchar("pet_id").notNull().references(() => pets.id),
  veterinarianId: varchar("veterinarian_id").notNull().references(() => users.id),
  product: text("product").notNull(),
  dose: text("dose"),
  applicationDate: timestamp("application_date").notNull(),
  nextDueDate: timestamp("next_due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// New table for detailed examination orders and results
export const examinations = pgTable("examinations", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

// Exam documents table for storing uploaded exam results
export const examDocuments = pgTable("exam_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: varchar("pet_id").notNull().references(() => pets.id),
  examType: text("exam_type").notNull(),
  objectPath: text("object_path").notNull(), // Path in object storage
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  uploadDate: timestamp("upload_date").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: varchar("pet_id").notNull().references(() => pets.id),
  veterinarianId: varchar("veterinarian_id").notNull().references(() => users.id),
  type: text("type", { enum: ["health", "export", "vaccination", "deworming", "microchip"] }).notNull(),
  issuedDate: timestamp("issued_date").notNull(),
  validUntil: timestamp("valid_until"),
  content: json("content"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  role: true,
  name: true,
  rut: true,
  phone: true,
  address: true,
  commune: true,
  emergencyContact: true,
  emergencyPhone: true,
});

export const insertPetSchema = createInsertSchema(pets).pick({
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
  tutorAddress: true,
  tutorRegion: true,
  tutorComuna: true,
  tutorHouseNumber: true,
  tutorApartmentNumber: true,
}).extend({
  // Handle date strings and convert them to Date objects
  birthDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  sterilizationDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).pick({
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
  followUp: true,
});

export const insertExaminationSchema = createInsertSchema(examinations).pick({
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
  status: true,
});

export const insertVaccinationSchema = createInsertSchema(vaccinations).pick({
  petId: true,
  veterinarianId: true,
  vaccineName: true,
  laboratory: true,
  batch: true,
  expiryDate: true,
  applicationDate: true,
  pathogens: true,
  selectedDiseases: true,
  vaccineType: true,
  nextDueDate: true,
  certificate: true,
});

export const insertDewormingSchema = createInsertSchema(dewormings).pick({
  petId: true,
  veterinarianId: true,
  product: true,
  dose: true,
  applicationDate: true,
  nextDueDate: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).pick({
  petId: true,
  veterinarianId: true,
  type: true,
  issuedDate: true,
  validUntil: true,
  content: true,
  pdfUrl: true,
}).extend({
  issuedDate: z.string().transform((str) => new Date(str)),
  validUntil: z.string().optional().transform((str) => str ? new Date(str) : undefined),
});

// Nutrition and body condition tables
export const foods = pgTable("foods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand"),
  type: text("type", { enum: ["kibble", "wet", "raw", "treat", "supplement"] }).notNull(),
  species: text("species", { enum: ["Canino", "Felino", "Ambos"] }).notNull(),
  lifeStage: text("life_stage", { enum: ["puppy", "kitten", "adult", "senior", "all"] }).notNull(),
  // Nutritional information per 100g
  calories: text("calories"), // kcal/100g
  protein: text("protein"), // g/100g
  fat: text("fat"), // g/100g
  carbohydrates: text("carbohydrates"), // g/100g
  fiber: text("fiber"), // g/100g
  moisture: text("moisture"), // g/100g
  calcium: text("calcium"), // mg/100g
  phosphorus: text("phosphorus"), // mg/100g
  sodium: text("sodium"), // mg/100g
  ingredients: text("ingredients"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const nutritionAssessments = pgTable("nutrition_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: varchar("pet_id").notNull().references(() => pets.id),
  veterinarianId: varchar("veterinarian_id").notNull().references(() => users.id),
  assessmentDate: timestamp("assessment_date").notNull(),
  
  // Body condition scoring
  bcs: text("bcs"), // Body Condition Score (1-9 for dogs, 1-9 for cats)
  bcsMethod: text("bcs_method", { enum: ["canine_9_point", "feline_9_point"] }),
  currentWeight: text("current_weight"), // kg
  idealWeight: text("ideal_weight"), // kg
  
  // Measurements for PIBW calculations
  thoracicPerimeter: text("thoracic_perimeter"), // cm
  limbLength: text("limb_length"), // cm (posterior limb for dogs)
  calculatedIdealWeight: text("calculated_ideal_weight"), // PIBW for dogs
  
  // Energy requirements
  rer: text("rer"), // Resting Energy Requirement (kcal/day)
  der: text("der"), // Daily Energy Requirement (kcal/day)
  activityFactor: text("activity_factor"), // Multiplier used for DER calculation
  
  // Current diet assessment
  currentFood: text("current_food"),
  currentFoodBrand: text("current_food_brand"),
  dailyAmount: text("daily_amount"), // grams per day
  feedingFrequency: text("feeding_frequency"),
  treats: text("treats"),
  supplements: text("supplements"),
  
  // Nutritional recommendations
  recommendedCalories: text("recommended_calories"), // kcal/day
  recommendedFood: text("recommended_food"),
  recommendedAmount: text("recommended_amount"), // grams per day
  weightGoal: text("weight_goal", { enum: ["maintain", "gain", "lose"] }),
  targetWeight: text("target_weight"), // kg
  
  // Clinical notes
  bodyConditionNotes: text("body_condition_notes"),
  nutritionalConcerns: text("nutritional_concerns"),
  recommendations: text("recommendations"),
  followUpDate: timestamp("follow_up_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for nutrition
export const insertFoodSchema = createInsertSchema(foods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNutritionAssessmentSchema = createInsertSchema(nutritionAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof pets.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertVaccination = z.infer<typeof insertVaccinationSchema>;
export type Vaccination = typeof vaccinations.$inferSelect;
export type InsertDeworming = z.infer<typeof insertDewormingSchema>;
export type Deworming = typeof dewormings.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertExamination = z.infer<typeof insertExaminationSchema>;
export type Examination = typeof examinations.$inferSelect;

export const insertExamDocumentSchema = createInsertSchema(examDocuments).pick({
  petId: true,
  examType: true,
  objectPath: true,
  fileName: true,
  fileSize: true,
  uploadedBy: true,
  notes: true,
});

export type InsertExamDocument = z.infer<typeof insertExamDocumentSchema>;
export type ExamDocument = typeof examDocuments.$inferSelect;
export type Food = typeof foods.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;
export type NutritionAssessment = typeof nutritionAssessments.$inferSelect;
export type InsertNutritionAssessment = z.infer<typeof insertNutritionAssessmentSchema>;

// Pre-visit questionnaire for Fear Free veterinary care
export const preVisitQuestionnaires = pgTable("pre_visit_questionnaires", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  petId: varchar("pet_id").references(() => pets.id),
  clientName: text("client_name").notNull(),
  petName: text("pet_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  appointmentDate: timestamp("appointment_date"),
  
  // Transportation
  travelMethod: text("travel_method"), // How pet travels in car
  travelBehaviors: json("travel_behaviors").$type<string[]>().default([]), // Anxious, drooling, vomiting, etc.
  otherTravelBehavior: text("other_travel_behavior"),
  
  // Veterinary experience dislikes
  dislikes: json("dislikes").$type<string[]>().default([]), // Things pet doesn't like during vet visits
  
  // Social behavior
  behaviorAroundOthers: text("behavior_around_others"), // How pet acts around other animals/people
  
  // Physical sensitivity
  sensitiveBodyAreas: text("sensitive_body_areas"), // Areas pet doesn't like touched
  
  // Past procedures
  difficultProcedures: text("difficult_procedures"), // Procedures pet didn't like
  petReaction: text("pet_reaction"), // How pet reacted to difficult procedures
  
  // Preferences
  favoriteTreats: text("favorite_treats"),
  favoriteToys: text("favorite_toys"),
  
  // Medications
  previousMedications: text("previous_medications"), // Medications for vet visits
  medicationResults: text("medication_results"),
  
  // Additional information
  additionalInfo: text("additional_info"),
  
  // Status
  completed: boolean("completed").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPreVisitQuestionnaireSchema = createInsertSchema(preVisitQuestionnaires).pick({
  appointmentId: true,
  petId: true,
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
  additionalInfo: true,
}).extend({
  // Make appointmentId and petId optional for standalone questionnaires
  appointmentId: z.string().optional(),
  petId: z.string().optional(),
  // Transform date string to Date object if provided
  appointmentDate: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (!val) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }),
  // Ensure arrays are properly handled
  travelBehaviors: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
});

export type InsertPreVisitQuestionnaire = z.infer<typeof insertPreVisitQuestionnaireSchema>;
export type PreVisitQuestionnaire = typeof preVisitQuestionnaires.$inferSelect;

// Agenda y Citas
export const appointments = pgTable('appointments', {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: varchar('pet_id', { length: 255 }).notNull(),
  tutorRut: varchar('tutor_rut', { length: 12 }).notNull(),
  appointmentDate: varchar('appointment_date', { length: 10 }).notNull(), // YYYY-MM-DD format
  appointmentTime: varchar('appointment_time', { length: 5 }).notNull(), // HH:MM format
  duration: integer('duration').default(60).notNull(), // duration in minutes
  serviceType: varchar('service_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).default('scheduled').notNull(), // scheduled, completed, cancelled
  notes: text('notes'),
  vetNotes: text('vet_notes'),
  address: text('address').notNull(),
  tutorPhone: varchar('tutor_phone', { length: 20 }).notNull(),
  tutorName: varchar('tutor_name', { length: 255 }).notNull(),
  tutorEmail: varchar('tutor_email', { length: 255 }),
  petName: varchar('pet_name', { length: 255 }).notNull(),
  // Campo de consentimiento para comunicaciones
  consentEmail: boolean('consent_email').default(false).notNull(),
  consentTimestamp: timestamp('consent_timestamp'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Disponibilidad horaria del veterinario
export const veterinarySchedule = pgTable('veterinary_schedule', {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Sunday, 1=Monday, etc.
  startTime: varchar('start_time', { length: 5 }).notNull(), // HH:MM format
  endTime: varchar('end_time', { length: 5 }).notNull(), // HH:MM format
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bloqueos de horarios (días festivos, vacaciones, etc.)
export const scheduleBlocks = pgTable('schedule_blocks', {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockDate: varchar('block_date', { length: 10 }).notNull(), // YYYY-MM-DD format
  startTime: varchar('start_time', { length: 5 }), // Si es null, bloquea todo el día
  endTime: varchar('end_time', { length: 5 }), // Si es null, bloquea todo el día
  reason: varchar('reason', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Schemas para las nuevas tablas
export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  consentEmail: z.boolean().default(false),
  consentTimestamp: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
});

export const insertVeterinaryScheduleSchema = createInsertSchema(veterinarySchedule).omit({
  id: true,
  createdAt: true,
});

export const insertScheduleBlockSchema = createInsertSchema(scheduleBlocks).omit({
  id: true,
  createdAt: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertVeterinarySchedule = z.infer<typeof insertVeterinaryScheduleSchema>;
export type VeterinarySchedule = typeof veterinarySchedule.$inferSelect;
export type InsertScheduleBlock = z.infer<typeof insertScheduleBlockSchema>;
export type ScheduleBlock = typeof scheduleBlocks.$inferSelect;

// Configuración de notificaciones
export const notificationSettings = pgTable('notification_settings', {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar('type', { length: 20 }).notNull(), // 'email'
  
  // Configuración Email (SMTP)
  smtpHost: varchar('smtp_host', { length: 255 }),
  smtpPort: integer('smtp_port'),
  smtpUser: varchar('smtp_user', { length: 255 }),
  smtpPassword: varchar('smtp_password', { length: 255 }),
  smtpSecure: boolean('smtp_secure').default(true),
  fromEmail: varchar('from_email', { length: 255 }),
  fromName: varchar('from_name', { length: 255 }),
  
  // Estado y configuración general
  isActive: boolean('is_active').default(true),
  isTestMode: boolean('is_test_mode').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
