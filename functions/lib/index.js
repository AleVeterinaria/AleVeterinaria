"use strict";
// Cloud Functions v2 para Ale Veterinaria
// Maneja formularios de contacto, citas, y recordatorios automáticos
// Zona horaria: America/Santiago | CORS: solo dominios autorizados
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testNotification = exports.createAppointment = exports.contactFormHandler = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const node_fetch_1 = __importDefault(require("node-fetch"));
const mailer_1 = require("./mail/mailer");
const templates_1 = require("./mail/templates");
// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Configuración CORS: solo dominios autorizados
const corsOptions = {
    origin: [
        'https://aleveterinaria.cl',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5000'
    ],
    credentials: true
};
const corsHandler = (0, cors_1.default)(corsOptions);
// Configuración de constantes para recordatorios
const REMINDER_CONFIG = {
    APPOINTMENT_REMINDER_HOURS: [48, 24], // Horas antes para recordatorios
    EXAM_PENDING_DAYS: 5, // Días para recordar exámenes pendientes
    FOLLOWUP_DAYS: 7, // Días para seguimiento post-consulta
    VACCINE_REMINDER_DAYS: 7, // Días antes para recordar vacunas
    TIMEZONE: 'America/Santiago',
    INTERNAL_CC: 'contacto@aleveterinaria.cl' // Copia interna opcional
};
// Rate limiting simple en memoria (por instancia)
const rateLimitMap = new Map();
const isRateLimited = (ip, windowMs = 60000, maxRequests = 5) => {
    const now = Date.now();
    const requests = rateLimitMap.get(ip) || [];
    // Filtrar requests dentro de la ventana de tiempo
    const recentRequests = requests.filter(time => now - time < windowMs);
    if (recentRequests.length >= maxRequests) {
        return true;
    }
    // Agregar request actual y limpiar cache
    recentRequests.push(now);
    rateLimitMap.set(ip, recentRequests);
    return false;
};
// Verificación de Cloudflare Turnstile
const verifyTurnstile = async (token, remoteip) => {
    try {
        const secret = process.env.TURNSTILE_SECRET_KEY;
        if (!secret) {
            console.error('❌ TURNSTILE_SECRET_KEY no configurado');
            return false;
        }
        const formData = new URLSearchParams();
        formData.append('secret', secret);
        formData.append('response', token);
        if (remoteip) {
            formData.append('remoteip', remoteip);
        }
        const response = await (0, node_fetch_1.default)('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
        const data = await response.json();
        console.log('🔐 Resultado verificación Turnstile:', data.success);
        return data.success === true;
    }
    catch (error) {
        console.error('❌ Error verificando Turnstile:', error);
        return false;
    }
};
// Schemas de validación con Zod
const contactFormSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
    email: zod_1.z.string().email('Email inválido'),
    message: zod_1.z.string().min(10, 'Mensaje debe tener al menos 10 caracteres').max(1000),
    phone: zod_1.z.string().optional(),
    consentWhatsapp: zod_1.z.boolean().default(false),
    consentEmail: zod_1.z.boolean().default(false),
    turnstileToken: zod_1.z.string().min(1, 'Token Turnstile requerido')
});
const appointmentSchema = zod_1.z.object({
    tutorName: zod_1.z.string().min(2).max(100),
    tutorRut: zod_1.z.string().min(9).max(12),
    tutorEmail: zod_1.z.string().email(),
    tutorPhone: zod_1.z.string().min(8).max(15),
    tutorCommune: zod_1.z.string().min(2).max(50),
    // Campos opcionales para paciente nuevo
    petName: zod_1.z.string().optional(),
    species: zod_1.z.string().optional(),
    sex: zod_1.z.string().optional(),
    birthDate: zod_1.z.string().optional(),
    desiredSlot: zod_1.z.string().optional(),
    appointmentDate: zod_1.z.string().optional(),
    appointmentTime: zod_1.z.string().optional(),
    serviceType: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    // Campos de consentimiento obligatorios
    consentWhatsapp: zod_1.z.boolean().default(false),
    consentEmail: zod_1.z.boolean().default(false),
    consentTimestamp: zod_1.z.string().optional().nullable().transform(val => val ? new Date(val) : null),
    turnstileToken: zod_1.z.string().min(1, 'Token Turnstile requerido')
});
const testNotificationSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    templateType: zod_1.z.enum(['contact', 'appointment', 'reminder-48h', 'reminder-24h', 'reminder-today', 'vaccine', 'deworming', 'followup', 'exam', 'questionnaire_completed']),
    patientData: zod_1.z.object({
        patientName: zod_1.z.string().optional(),
        tutorName: zod_1.z.string(),
        species: zod_1.z.string().optional(),
        vaccineType: zod_1.z.string().optional(),
        productName: zod_1.z.string().optional(),
        appointmentDate: zod_1.z.string().optional(),
        questionnaireSummary: zod_1.z.string().optional()
    }).optional()
});
// Función para crear hash único para idempotencia (comentada temporalmente)
// const createNotificationHash = (type: string, patientId: string, targetDate: string): string => {
//   return `${type}-${patientId}-${targetDate}`;
// };
// Verificar si ya se envió una notificación (comentada temporalmente)
// const isNotificationSent = async (hash: string): Promise<boolean> => {
//   try {
//     const doc = await db.collection('notifications_log').doc(hash).get();
//     return doc.exists;
//   } catch (error) {
//     console.error('Error verificando log de notificaciones:', error);
//     return false;
//   }
// };
// Marcar notificación como enviada (comentada temporalmente)
// const markNotificationSent = async (hash: string, details: any): Promise<void> => {
//   try {
//     await db.collection('notifications_log').doc(hash).set({
//       sentAt: admin.firestore.FieldValue.serverTimestamp(),
//       details,
//       hash
//     });
//   } catch (error) {
//     console.error('Error guardando log de notificación:', error);
//   }
// };
// Función para enviar WhatsApp con plantillas oficiales
const sendWhatsAppNotification = async (data, templateType) => {
    try {
        // En desarrollo, simular envío exitoso
        if (process.env.NODE_ENV === 'development' || !process.env.WHATSAPP_ACCESS_TOKEN) {
            console.log('🧪 Modo desarrollo: Simulando envío WhatsApp');
            return true;
        }
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (!accessToken || !phoneNumberId) {
            console.error('❌ Credenciales WhatsApp no configuradas');
            return false;
        }
        // Mapear tipos a plantillas oficiales
        const templateMap = {
            'appointment_created': 'confirmacion_cita',
            'reminder_24h': 'recordatorio_24h',
            'vaccine_reminder': 'recordatorio_vacuna',
            'deworming_reminder': 'recordatorio_desparasitacion'
        };
        const templateName = templateMap[templateType];
        if (!templateName) {
            console.log(`⚠️ Plantilla WhatsApp no encontrada para tipo: ${templateType}`);
            return false;
        }
        const phoneNumber = data.tutorPhone.replace(/[^0-9]/g, '');
        const fullPhone = phoneNumber.startsWith('56') ? phoneNumber : `56${phoneNumber}`;
        // Construir mensaje según plantilla
        const templateData = {
            name: templateName,
            language: { code: 'es' },
            components: [
                {
                    type: 'body',
                    parameters: [
                        { type: 'text', text: data.tutorName },
                        { type: 'text', text: data.petName || 'su mascota' },
                        { type: 'text', text: data.appointmentDate || 'próxima' }
                    ]
                }
            ]
        };
        // Agregar botones interactivos según plantilla
        if (['confirmacion_cita', 'recordatorio_24h'].includes(templateName)) {
            templateData.components.push({
                type: 'button',
                // sub_type: 'quick_reply',
                // index: '0',
                parameters: [{ type: 'text', text: 'CONFIRM_APPOINTMENT' }]
            });
        }
        const payload = {
            messaging_product: 'whatsapp',
            to: fullPhone,
            type: 'template',
            template: templateData
        };
        const response = await (0, node_fetch_1.default)(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (response.ok && result.messages) {
            console.log(`✅ WhatsApp enviado: ${templateName} a ${fullPhone}`);
            return true;
        }
        else {
            console.error('❌ Error enviando WhatsApp:', result);
            return false;
        }
    }
    catch (error) {
        console.error('❌ Error en sendWhatsAppNotification:', error);
        return false;
    }
};
// 1. ENDPOINT: Formulario de contacto
exports.contactFormHandler = functions.https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            // Solo permitir POST
            if (req.method !== 'POST') {
                return res.status(405).json({ ok: false, error: 'Método no permitido' });
            }
            const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            console.log(`📬 Solicitud de contacto desde IP: ${clientIp}`);
            // Rate limiting
            if (isRateLimited(clientIp, 60000, 3)) {
                console.log(`⚠️ Rate limit excedido para IP: ${clientIp}`);
                return res.status(429).json({ ok: false, error: 'Demasiadas solicitudes, intenta en un minuto' });
            }
            // Validar datos con Zod
            const validationResult = contactFormSchema.safeParse(req.body);
            if (!validationResult.success) {
                console.log('❌ Datos inválidos:', validationResult.error.issues);
                return res.status(400).json({
                    ok: false,
                    error: 'Datos inválidos',
                    details: validationResult.error.issues
                });
            }
            const { name, email, message, turnstileToken } = validationResult.data;
            // Verificar Turnstile
            const isTurnstileValid = await verifyTurnstile(turnstileToken, clientIp);
            if (!isTurnstileValid) {
                console.log('❌ Verificación Turnstile falló');
                return res.status(400).json({ ok: false, error: 'Verificación de seguridad falló' });
            }
            // Generar template de contacto
            const templateData = {
                senderName: name,
                senderEmail: email,
                contactMessage: message,
                tutorName: name,
                tutorEmail: email
            };
            const emailTemplate = (0, templates_1.getContactFormTemplate)(templateData);
            // Enviar email
            const emailSent = await (0, mailer_1.sendMail)({
                to: REMINDER_CONFIG.INTERNAL_CC,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text,
                replyTo: email
            });
            if (emailSent) {
                console.log('✅ Email de contacto enviado exitosamente');
                return res.json({ ok: true });
            }
            else {
                console.log('❌ Error enviando email de contacto');
                return res.status(500).json({ ok: false, error: 'Error enviando email' });
            }
        }
        catch (error) {
            console.error('❌ Error en contactFormHandler function:', error);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
        }
    });
});
// 2. ENDPOINT: Crear cita
exports.createAppointment = functions.https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        var _a, _b;
        try {
            if (req.method !== 'POST') {
                return res.status(405).json({ ok: false, error: 'Método no permitido' });
            }
            const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            console.log(`📅 Solicitud de cita desde IP: ${clientIp}`);
            // Rate limiting
            if (isRateLimited(clientIp, 300000, 2)) { // 2 citas por 5 minutos
                return res.status(429).json({ ok: false, error: 'Demasiadas solicitudes de cita, intenta más tarde' });
            }
            // Validar datos
            const validationResult = appointmentSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    ok: false,
                    error: 'Datos inválidos',
                    details: validationResult.error.issues
                });
            }
            const appointmentData = validationResult.data;
            // Verificar Turnstile
            const isTurnstileValid = await verifyTurnstile(appointmentData.turnstileToken, clientIp);
            if (!isTurnstileValid) {
                return res.status(400).json({ ok: false, error: 'Verificación de seguridad falló' });
            }
            // Buscar paciente existente por RUT
            const cleanRut = appointmentData.tutorRut.replace(/[.-]/g, '');
            const patientsQuery = await db.collection('patients')
                .where('tutorRut', '==', cleanRut)
                .limit(1)
                .get();
            let patientId;
            let isNewPatient = false;
            if (!patientsQuery.empty) {
                // Paciente existente
                patientId = patientsQuery.docs[0].id;
                console.log('👤 Paciente existente encontrado:', patientId);
            }
            else {
                // Crear nuevo paciente si se proporcionaron datos
                if (appointmentData.petName) {
                    isNewPatient = true;
                    // Obtener siguiente número de paciente
                    const counterRef = db.collection('counters').doc('patientCounter');
                    const result = await db.runTransaction(async (transaction) => {
                        var _a;
                        const counterDoc = await transaction.get(counterRef);
                        const lastNumber = counterDoc.exists ? ((_a = counterDoc.data()) === null || _a === void 0 ? void 0 : _a.lastNumber) || 0 : 0;
                        const newNumber = lastNumber + 1;
                        transaction.set(counterRef, { lastNumber: newNumber }, { merge: true });
                        return newNumber.toString();
                    });
                    patientId = result;
                    // Crear documento del paciente
                    const patientData = {
                        name: appointmentData.petName.toLowerCase(),
                        species: ((_a = appointmentData.species) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'unknown',
                        sex: ((_b = appointmentData.sex) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || 'unknown',
                        birthDate: appointmentData.birthDate || null,
                        tutorName: appointmentData.tutorName,
                        tutorEmail: appointmentData.tutorEmail,
                        tutorPhone: appointmentData.tutorPhone,
                        tutorRut: cleanRut,
                        tutorCity: appointmentData.tutorCommune,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                    };
                    await db.collection('patients').doc(patientId).set(patientData);
                    console.log('🆕 Nuevo paciente creado:', patientId);
                }
                else {
                    return res.status(400).json({
                        ok: false,
                        error: 'Paciente no encontrado. Proporciona datos de la mascota para crear un nuevo registro.'
                    });
                }
            }
            // Crear documento de cita
            const appointmentDoc = {
                tutorName: appointmentData.tutorName,
                tutorEmail: appointmentData.tutorEmail,
                tutorPhone: appointmentData.tutorPhone,
                tutorRut: cleanRut,
                commune: appointmentData.tutorCommune,
                patientId: patientId,
                patientName: appointmentData.petName || null,
                species: appointmentData.species || null,
                desiredSlot: appointmentData.desiredSlot || null,
                status: 'pending',
                consentWhatsapp: appointmentData.consentWhatsapp || false,
                consentEmail: appointmentData.consentEmail || false,
                consentTimestamp: appointmentData.consentTimestamp || null,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };
            const appointmentRef = await db.collection('appointments').add(appointmentDoc);
            console.log('📝 Cita creada:', appointmentRef.id);
            // Preparar datos para email de confirmación
            const templateData = {
                tutorName: appointmentData.tutorName,
                tutorEmail: appointmentData.tutorEmail,
                patientName: appointmentData.petName || 'mascota',
                species: appointmentData.species || 'mascota',
                appointmentNotes: `Cita solicitada para ${appointmentData.tutorCommune}. ${appointmentData.desiredSlot ? `Horario preferido: ${appointmentData.desiredSlot}` : ''}`
            };
            // Generar template de confirmación
            const confirmationTemplate = (0, templates_1.getAppointmentConfirmationTemplate)(templateData);
            // Enviar email de confirmación al tutor (solo si tiene consentimiento)
            let tutorEmailSent = true; // Default true si no se requiere enviar email
            if (appointmentData.consentEmail) {
                tutorEmailSent = await (0, mailer_1.sendMail)({
                    to: appointmentData.tutorEmail,
                    subject: confirmationTemplate.subject,
                    html: confirmationTemplate.html,
                    text: confirmationTemplate.text,
                    icsBuffer: confirmationTemplate.icsBuffer
                });
                console.log(`📧 Email de confirmación al tutor ${tutorEmailSent ? 'enviado' : 'falló'}`);
            }
            else {
                console.log('📧 Email de confirmación al tutor omitido - sin consentimiento');
            }
            // Enviar notificación interna
            const internalEmailSent = await (0, mailer_1.sendMail)({
                to: REMINDER_CONFIG.INTERNAL_CC,
                subject: `Nueva cita: ${appointmentData.tutorName} - ${appointmentData.tutorCommune}`,
                html: `
            <h2>Nueva solicitud de cita</h2>
            <p><strong>Tutor:</strong> ${appointmentData.tutorName}</p>
            <p><strong>Email:</strong> ${appointmentData.tutorEmail}</p>
            <p><strong>Teléfono:</strong> ${appointmentData.tutorPhone}</p>
            <p><strong>Comuna:</strong> ${appointmentData.tutorCommune}</p>
            ${appointmentData.petName ? `<p><strong>Mascota:</strong> ${appointmentData.petName} (${appointmentData.species})</p>` : ''}
            <p><strong>Horario preferido:</strong> ${appointmentData.desiredSlot || 'No especificado'}</p>
            <p><strong>Paciente ${isNewPatient ? 'nuevo' : 'existente'}:</strong> ID ${patientId}</p>
            <p><strong>Consentimientos:</strong> WhatsApp: ${appointmentData.consentWhatsapp ? 'SÍ' : 'NO'}, Email: ${appointmentData.consentEmail ? 'SÍ' : 'NO'}</p>
          `,
                text: `Nueva cita de ${appointmentData.tutorName} (${appointmentData.tutorCommune})`
            });
            // Enviar notificación WhatsApp al tutor (solo si tiene consentimiento)
            let whatsappSent = true; // Default true si no se requiere enviar WhatsApp
            if (appointmentData.consentWhatsapp) {
                try {
                    // Llamar función de envío WhatsApp con datos de la cita
                    const whatsappData = {
                        tutorName: appointmentData.tutorName,
                        tutorPhone: appointmentData.tutorPhone,
                        appointmentDate: appointmentData.appointmentDate || new Date().toISOString().split('T')[0],
                        appointmentTime: appointmentData.appointmentTime || appointmentData.desiredSlot || 'Por confirmar',
                        petName: appointmentData.petName || 'su mascota',
                        serviceType: appointmentData.serviceType || 'Consulta veterinaria',
                        address: appointmentData.address || `${appointmentData.tutorCommune}, Chile`
                    };
                    whatsappSent = await sendWhatsAppNotification(whatsappData, 'appointment_created');
                    console.log(`📱 WhatsApp de confirmación al tutor ${whatsappSent ? 'enviado' : 'falló'}`);
                }
                catch (error) {
                    console.log('📱 Error enviando WhatsApp de confirmación:', error);
                    whatsappSent = false;
                }
            }
            else {
                console.log('📱 WhatsApp de confirmación al tutor omitido - sin consentimiento');
            }
            if (tutorEmailSent && internalEmailSent) {
                console.log('✅ Emails de confirmación enviados');
                return res.json({
                    ok: true,
                    appointmentId: appointmentRef.id,
                    patientId: patientId,
                    isNewPatient: isNewPatient
                });
            }
            else {
                console.log('⚠️ Cita creada pero algunos emails fallaron');
                return res.json({
                    ok: true,
                    appointmentId: appointmentRef.id,
                    warning: 'Cita creada pero algunos emails no se enviaron'
                });
            }
        }
        catch (error) {
            console.error('❌ Error en createAppointment:', error);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
        }
    });
});
// 3. ENDPOINT: Probar notificaciones (solo admin)
exports.testNotification = functions.https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).json({ ok: false, error: 'Método no permitido' });
            }
            // Validación básica (en producción agregar autenticación admin)
            const validationResult = testNotificationSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    ok: false,
                    error: 'Datos inválidos',
                    details: validationResult.error.issues
                });
            }
            const { email, templateType, patientData } = validationResult.data;
            // Datos de prueba
            const testData = {
                tutorName: (patientData === null || patientData === void 0 ? void 0 : patientData.tutorName) || 'Tutor de Prueba',
                tutorEmail: email,
                patientName: (patientData === null || patientData === void 0 ? void 0 : patientData.patientName) || 'Mascota de Prueba',
                species: (patientData === null || patientData === void 0 ? void 0 : patientData.species) || 'perro',
                vaccineType: (patientData === null || patientData === void 0 ? void 0 : patientData.vaccineType) || 'Óctuple',
                productName: (patientData === null || patientData === void 0 ? void 0 : patientData.productName) || 'Antiparasitario',
                appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
                nextDose: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 7 días
                senderName: 'Usuario de Prueba',
                senderEmail: email,
                contactMessage: 'Este es un mensaje de prueba del sistema de notificaciones.'
            };
            let template;
            switch (templateType) {
                case 'contact':
                    template = (0, templates_1.getContactFormTemplate)(testData);
                    break;
                case 'appointment':
                    template = (0, templates_1.getAppointmentConfirmationTemplate)(testData);
                    break;
                case 'reminder-48h':
                    template = (0, templates_1.getAppointmentReminderTemplate)(testData, '48h');
                    break;
                case 'reminder-24h':
                    template = (0, templates_1.getAppointmentReminderTemplate)(testData, '24h');
                    break;
                case 'reminder-today':
                    template = (0, templates_1.getAppointmentReminderTemplate)(testData, 'today');
                    break;
                case 'vaccine':
                    template = (0, templates_1.getVaccineReminderTemplate)(testData);
                    break;
                case 'deworming':
                    template = (0, templates_1.getDewormingReminderTemplate)(testData);
                    break;
                case 'followup':
                    template = (0, templates_1.getFollowUpTemplate)(testData);
                    break;
                case 'exam':
                    template = (0, templates_1.getExamReminderTemplate)(testData);
                    break;
                case 'questionnaire_completed':
                    template = (0, templates_1.getQuestionnaireCompletedTemplate)(testData);
                    break;
                default:
                    return res.status(400).json({ ok: false, error: 'Tipo de plantilla inválido' });
            }
            const emailSent = await (0, mailer_1.sendMail)({
                to: email,
                subject: `[PRUEBA] ${template.subject}`,
                html: template.html,
                text: template.text,
                icsBuffer: template.icsBuffer
            });
            if (emailSent) {
                console.log(`✅ Email de prueba enviado: ${templateType} a ${email}`);
                return res.json({ ok: true, message: `Plantilla ${templateType} enviada a ${email}` });
            }
            else {
                return res.status(500).json({ ok: false, error: 'Error enviando email de prueba' });
            }
        }
        catch (error) {
            console.error('❌ Error en testNotification:', error);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
        }
    });
});
// 4. FUNCIÓN PROGRAMADA: Recordatorios diarios (09:00 Chile)
// Función programada comentada temporalmente para evitar errores de compilación
// export const scheduleDailyReminders = functions.pubsub.schedule('0 9 * * *').timeZone('America/Santiago').onRun(
//   async (event: any) => {
//     console.log('🕐 Iniciando recordatorios diarios...');
//     
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
//     const in48Hours = new Date(today.getTime() + 48 * 60 * 60 * 1000);
// 
//     try {
//       // Procesar recordatorios de citas (48h y 24h)
//       await processAppointmentReminders(today, tomorrow, in48Hours);
//       
//       console.log('✅ Recordatorios diarios completados');
//     } catch (error) {
//       console.error('❌ Error en recordatorios diarios:', error);
//     }
//   }
// );
// 5. FUNCIÓN PROGRAMADA: Recordatorios semanales (lunes 09:00 Chile)
// Función programada comentada temporalmente para evitar errores de compilación
// export const scheduleWeeklyReminders = functions.pubsub.schedule('0 9 * * 1').timeZone('America/Santiago').onRun(
//   async (event: any) => {
//     console.log('📅 Iniciando recordatorios semanales...');
//     
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
// 
//     try {
//       // Procesar recordatorios de vacunas y desparasitación
//       await processVaccineReminders(today, in7Days);
//       await processDewormingReminders(today, in7Days);
//       
//       console.log('✅ Recordatorios semanales completados');
//     } catch (error) {
//       console.error('❌ Error en recordatorios semanales:', error);
//     }
//   }
// );
// Funciones auxiliares comentadas temporalmente para evitar errores de compilación
// Todas las funciones auxiliares han sido comentadas temporalmente
//# sourceMappingURL=index.js.map