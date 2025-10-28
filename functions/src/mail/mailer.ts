// Configuración centralizada de Nodemailer para Zoho SMTP
// Maneja envío de emails con archivos .ics adjuntos para citas

import * as nodemailer from 'nodemailer';
// Configuración de email usando variables de entorno
const getEmailConfig = () => {
  return {
    user: process.env.ZOHO_USER || 'contacto@aleveterinaria.cl',
    pass: process.env.ZOHO_APP_PASS || '',
    host: process.env.ZOHO_HOST || 'smtppro.zoho.com',
    port: parseInt(process.env.ZOHO_PORT || '465')
  };
};

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
  icsBuffer?: Buffer;
  replyTo?: string;
  cc?: string;
}

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

export const sendMail = async (emailData: EmailData): Promise<boolean> => {
  try {
    console.log(`📧 Enviando email a: ${emailData.to}`);
    console.log(`📋 Asunto: ${emailData.subject}`);

    const transporter = createTransporter();
    
    // Configurar mensaje base
    const mailOptions: any = {
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
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
};