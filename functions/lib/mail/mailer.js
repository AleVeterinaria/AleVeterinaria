"use strict";
// Configuración centralizada de Nodemailer para Zoho SMTP
// Maneja envío de emails con archivos .ics adjuntos para citas
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer = __importStar(require("nodemailer"));
// Configuración de email usando variables de entorno
const getEmailConfig = () => {
    return {
        user: process.env.ZOHO_USER || 'contacto@aleveterinaria.cl',
        pass: process.env.ZOHO_APP_PASS || '',
        host: process.env.ZOHO_HOST || 'smtppro.zoho.com',
        port: parseInt(process.env.ZOHO_PORT || '465')
    };
};
// Crear transporter con configuración segura de Zoho
const createTransporter = () => {
    const config = getEmailConfig();
    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: true, // SSL/TLS para puerto 465
        auth: {
            user: config.user,
            pass: config.pass
        },
        // Configuración adicional para Zoho
        tls: {
            rejectUnauthorized: false
        }
    });
};
const sendMail = async (emailData) => {
    try {
        console.log(`📧 Enviando email a: ${emailData.to}`);
        console.log(`📋 Asunto: ${emailData.subject}`);
        const transporter = createTransporter();
        // Configurar mensaje base
        const mailOptions = {
            from: `"Ale Veterinaria" <${getEmailConfig().user}>`,
            to: emailData.to,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html
        };
        // Agregar replyTo si existe (para formulario de contacto)
        if (emailData.replyTo) {
            mailOptions.replyTo = emailData.replyTo;
        }
        // Agregar CC si existe (notificaciones internas)
        if (emailData.cc) {
            mailOptions.cc = emailData.cc;
        }
        // Adjuntar archivo .ics si existe (para citas)
        if (emailData.icsBuffer) {
            mailOptions.attachments = [
                {
                    filename: 'cita.ics',
                    content: emailData.icsBuffer,
                    contentType: 'text/calendar; charset=utf-8; method=REQUEST'
                }
            ];
            console.log('📅 Archivo ICS adjuntado al email');
        }
        // Enviar email
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email enviado exitosamente. MessageId: ${result.messageId}`);
        return true;
    }
    catch (error) {
        console.error('❌ Error enviando email:', error);
        return false;
    }
};
exports.sendMail = sendMail;
//# sourceMappingURL=mailer.js.map