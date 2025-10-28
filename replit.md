# Overview

Ale Veterinaria is a web application providing home veterinary services in Santiago, Chile. It offers a comprehensive solution for managing veterinary consultations, medical records, vaccinations, and certificates. The platform features a public landing page, a professional portal for veterinarians, and a client portal for pet owners. The core vision is to streamline veterinary operations, enhance client communication through WhatsApp integration, and provide advanced tools like automated certificate generation (e.g., SAG export certificates), nutrition calculators, and a veterinary BMI/BCS system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend

The frontend is built with React 18 and TypeScript, utilizing Wouter for routing, Tailwind CSS with custom color variables for styling, Radix UI components styled with shadcn/ui, TanStack Query for server state management, and React Hook Form with Zod for forms. It adopts a modular structure supporting a public homepage, a veterinarian portal, and a tutor portal with RUT-only access.

## Recent Changes (January 21, 2025)

**Codebase Cleanup and Optimization - COMPLETED:**
- Eliminated Git repository and version control artifacts (git directory removed)
- Removed unused development documentation files (ANALISIS_COMPLETO_PROBLEMAS.md, DEPLOYMENT.md, etc.)
- Deleted unused page components (OwnerPortal.tsx, not-found.tsx) and updated router accordingly
- Cleaned up attached assets, removing development text files and OAuth credentials
- Removed unused UI components while preserving essential shadcn/ui components in use
- Maintained ObjectUploader component for professional portal file management
- Streamlined project structure for better maintainability and deployment efficiency

**Portal Tutor Bug Fixes - COMPLETED:**
- Fixed search functionality by correcting variable conflicts between rutInput and searchInput
- Implemented proper queryFn for certificates and exam documents retrieval from Firebase
- Corrected PDF generation functions with proper argument passing for prescriptions and certificates
- All download functionalities now operational (prescriptions, certificates, vaccination cards)

**Chilean Date Format Standardization - COMPLETED:**
- Implemented comprehensive dateFormatter utility with DD/MM/YYYY format throughout entire application
- Updated all date displays in ProfessionalPortal, TutorPortal, and AppointmentScheduler to use Chilean format
- Standardized date formatting for: prescriptions, certificates, vaccinations, dewormings, exam documents
- Added formatDateToChilean, formatISOToChilean, and formatDateTimeToChilean utility functions
- Patient birth dates now display in DD/MM/YYYY format across all portals

**Admin Appointment Deletion Functionality - COMPLETED:**
- Added secure endpoint DELETE /api/appointments/:id for permanent deletion of cancelled appointments only
- Implemented deleteAppointment method in storage layer with proper validation
- Added administrative delete button in ScheduleManagerAdvanced for cancelled appointments
- Enhanced confirmation dialog showing appointment details before deletion
- Complete integration with proper error handling and user feedback notifications

**Complete Chilean Geographic Database - COMPLETED:**
- Implemented comprehensive database with all 16 Chilean regions and their respective communes
- Created chileanRegions.ts with complete administrative divisions data including all regions from Arica y Parinacota to Magallanes
- Updated AppointmentScheduler to use new geographic database with getAllRegions() and getCommunesByRegion() helper functions
- Enhanced address selection functionality with accurate regional and communal data for appointment scheduling
- Complete coverage of Chilean territory for precise location-based veterinary services

**Contact Form Email Integration - COMPLETED:**
- Implemented contact form email sending to contacto@aleveterinaria.cl
- Integrated with existing SMTP configuration system from notification settings
- Professional HTML email template with contact information and message
- Full error handling and user feedback for successful/failed submissions

**WhatsApp Automation Removal - COMPLETED (September 11, 2025):**
- Complete elimination of automated WhatsApp notification system across all layers (frontend, backend, database, Firebase Functions)
- Removed all WhatsApp Business API integration and Meta-approved message templates
- Eliminated Firebase Functions WhatsApp automation (sendWhatsAppNotification function and templates)
- Removed WhatsApp-related database fields and configuration settings from notification system
- Cleaned up 6 WhatsApp API routes from server (send-test, webhook GET/POST, test, test-whatsapp, send-direct-whatsapp)
- Updated NotificationSettings component to email-only functionality
- Maintained direct WhatsApp contact links (wa.me/56976040797) for manual communication
- System now uses email-only notifications in preparation for future Zoho CRM integration

**Email Updates and Appointment Notifications - COMPLETED:**
- Updated all remaining email references from avmveterinaria@gmail.com to contacto@aleveterinaria.cl
- Fixed HomePage footer contact information
- Implemented automatic email notifications for new appointments
- Dual notification system: veterinarian receives appointment details, client receives confirmation
- Professional HTML email templates with appointment information, formatting, and branding

**Red Compra Payment Method Removal - COMPLETED (September 11, 2025):**
- Eliminated Red Compra from available payment methods in booking interface
- Updated payment options to include only: Tarjetas, Transferencia, and Efectivo
- Booking system simplified for direct payment methods without Red Compra integration

## Previous Changes

**Google Calendar OAuth Integration - COMPLETED:**
- Successfully configured Google OAuth2 credentials (Client ID: 121042285-9utnp3spa5l1rcnsvnq5v4a9v25tslv4)
- Implemented complete OAuth flow with googleapis and google-auth-library
- URLs de redirección configured for both development and production domains
- All server endpoints operational: /auth/google/callback, /api/google-calendar/* routes
- SMTP testing completed with nodemailer integration
- System ready for full Google Calendar synchronization

**Notification Settings Persistence System - COMPLETED:**
- Implemented persistent notification settings using dedicated database table `notificationSettings`
- Added API routes for CRUD operations: GET/POST/PATCH `/api/settings/notifications`
- Updated NotificationSettings component with React Query for state management
- Email configuration (SMTP) now persists between sessions using database storage
- WhatsApp configuration persistence ready for API key integration
- Real-time form state management with automatic loading of saved configurations

**Cross-Portal Appointment Synchronization - COMPLETED:**
- Fixed appointment synchronization between tutor and professional portals
- Implemented automatic Google Calendar integration for new appointments
- Added `/api/appointments/:year/:month` route for professional portal calendar view
- Enhanced appointment creation with automatic calendar sync when tokens are available
- All appointments now appear immediately in both portals after creation
- Complete integration without manual synchronization steps required

## Backend

The backend uses Express.js with TypeScript, PostgreSQL with Drizzle ORM for database management (including nutrition and food database tables), Firebase for authentication and file storage, and Replit Object Storage for exam document management. The architecture is layered, supporting secure user management via Firebase Authentication with role-based access for veterinarians and RUT-based access for tutors. Complete CRUD operations are implemented for all medical records with secure deletion functionality across all document types.

## Design System

A cohesive design system is implemented, featuring Poppins and Lato fonts, custom brand colors with updated primary green (#5FA98D for better contrast), mint, lavender, turquoise, pale rose, warm beige, reusable UI components, and a mobile-first responsive design approach. The hero section uses an enhanced layout with improved typography hierarchy, professional CTA buttons with animations, and integrated Fear Free certification badge. PDFs generated by the system adhere to a standardized professional layout with consistent typography and logo integration.

## Core Features

- **Medical Record Management**: Comprehensive system for managing pet medical history, vaccinations, and deworming with full CRUD operations including delete functionality across all document types.
- **Certificate Generation**: Automated generation of various professional documents, including medical prescriptions, health certificates, vaccination/deworming certificates, and official SAG export certificates with species-specific annexes.
- **Document Management**: Exam document upload and management system using Replit Object Storage with secure access controls and file type validation.
- **Client Communication**: Integrated WhatsApp notification system for appointment confirmations, exam reminders, results, and vaccination reminders.
- **Nutrition Management**: Complete nutrition assessment system including:
  - Body Condition Score (BCS) evaluation for canines and felines with 9-point scale selector and detailed descriptions
  - Automatic ideal weight calculation using AAHA-validated DEXA formula: BCS >5: Peso ideal = Peso actual ÷ (1 + 0.10 × (BCS−5)); BCS <5: Peso ideal = Peso actual ÷ (1 − 0.10 × (5−BCS))
  - RER/DER calculators with comprehensive species-specific and physiological state factors (84 individual factors: 46 canine, 38 feline) based on official veterinary guidelines
  - Intelligent species filtering showing only relevant DER factors based on selected patient's species
  - Comprehensive food database with full CRUD operations (create, read, update, delete) for nutritional information
  - Automatic weight status determination and recommendation generation based on BCS
  - Professional nutrition reporting and follow-up scheduling
  - Consultation report generation with comprehensive patient information, nutritional findings, and treatment recommendations
- **Tutor Communication**: Integrated tutor report system including:
  - Simplified consultation summaries designed for pet owners
  - Professional PDF report generation with clear, non-technical language
  - WhatsApp integration for direct communication with tutors
  - Comprehensive care instructions and follow-up recommendations
- **Exam Management**: Integration with real laboratory exam lists (e.g., Vetlab 2024) including prices, categories, and preparation instructions.
- **User Portals**: Tutor portal with RUT-only access for viewing records, certificates, vaccines, deworming, and exam results. Professional portal for veterinarians to manage patients, generate documents, upload exam results, and perform nutrition assessments.
- **Authentication & Authorization**: Firebase-based authentication for professionals (account creation managed directly in Firebase), RUT-based access for tutors without account creation.

# External Dependencies

## Firebase Services

- Firebase Auth (user authentication and authorization)
- Firebase Firestore (document storage)
- Firebase Storage (file storage for PDFs, images)

## Database

- PostgreSQL (primary structured data storage)
- Neon Database (serverless PostgreSQL provider)
- Drizzle ORM (type-safe database operations and migrations)

## UI and Styling

- Tailwind CSS (utility-first CSS framework)
- Radix UI (headless UI components)
- shadcn/ui (pre-styled component library)
- Lucide React (icon library)
- Font Awesome (additional icons)

## Development Tools

- Vite (build tool and development server)
- TypeScript (type safety)
- TanStack Query (server state management and caching)
- Wouter (lightweight routing library)

## External Integrations

- **Google Calendar API** (professional agenda management and synchronization) - ✅ FULLY CONFIGURED
- WhatsApp Business API (client communication and notifications)
- **Email/SMTP Services** (alternative notification channel) - ✅ TESTED AND FUNCTIONAL
- Chilean Vaccine Database (autocomplete for local vaccine brands)
- RUT Validation (Chilean tax ID validation)
- PDF Generation Libraries (for certificates and prescriptions)
- SAG (Chilean Agricultural and Livestock Service) official document compliance