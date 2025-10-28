"use strict";
// Plantillas de correo HTML y texto para diferentes tipos de notificaciones
// Incluye generación de archivos .ics para citas con zona horaria America/Santiago
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWhatsAppTemplate = exports.getQuestionnaireCompletedTemplate = exports.getExamReminderTemplate = exports.getFollowUpTemplate = exports.getExamDocumentTemplate = exports.getAppointmentUpdateTemplate = exports.getAppointmentCancellationTemplate = exports.getDewormingReminderTemplate = exports.getVaccineReminderTemplate = exports.getAppointmentReminderTemplate = exports.getAppointmentConfirmationTemplate = exports.getContactFormTemplate = void 0;
const ics_1 = require("ics");
// Configuración de firma para todos los emails
const SIGNATURE = {
    name: "Alejandra Cautin Bastias",
    title: "Médico Veterinario",
    phone: "+569 76040797",
    whatsapp: "https://wa.me/56976040797",
    instagram: "@aleveterinaria"
};
// CSS inline para emails responsive
const EMAIL_STYLES = `
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
// Generar archivo .ics para citas
const generateICS = (appointmentDate, tutorName, tutorEmail, notes) => {
    try {
        console.log('📅 Generando archivo ICS para cita');
        // Configurar evento de 60 minutos en zona horaria America/Santiago
        const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
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
            title: 'Consulta Veterinaria - Ale Veterinaria',
            description: notes ? `Consulta veterinaria a domicilio.\n\nNotas: ${notes}` : 'Consulta veterinaria a domicilio',
            location: 'Domicilio del tutor',
            status: 'CONFIRMED',
            organizer: { name: SIGNATURE.name, email: 'contacto@aleveterinaria.cl' },
            attendees: [{ name: tutorName, email: tutorEmail, rsvp: true }],
            uid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@aleveterinaria.cl`
        };
        const { error, value } = (0, ics_1.createEvent)(event);
        if (error) {
            console.error('❌ Error generando ICS:', error);
            return undefined;
        }
        console.log('✅ Archivo ICS generado exitosamente');
        return Buffer.from(value, 'utf-8');
    }
    catch (error) {
        console.error('❌ Error en generateICS:', error);
        return undefined;
    }
};
// Plantilla base HTML
const baseTemplate = (title, content) => `
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
      <h1>🐾 Ale Veterinaria</h1>
      <p>Atención veterinaria a domicilio con amor y profesionalismo</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <div class="signature">
        <strong>${SIGNATURE.name}</strong><br>
        ${SIGNATURE.title}<br>
        📱 ${SIGNATURE.phone}<br>
        💬 <a href="${SIGNATURE.whatsapp}">WhatsApp</a> |
        📸 <a href="https://instagram.com/${SIGNATURE.instagram.substring(1)}">${SIGNATURE.instagram}</a>
      </div>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        Este email fue enviado automáticamente por el sistema de Ale Veterinaria.<br>
        Si tienes alguna consulta, responde a este correo o contáctanos por WhatsApp.
      </p>
    </div>
  </div>
</body>
</html>
`;
// 1. Plantilla de formulario de contacto
const getContactFormTemplate = (data) => {
    var _a;
    const subject = `Contacto web: ${data.senderName}`;
    const content = `
    <h2>💬 Nuevo mensaje desde el formulario de contacto</h2>
    <div class="highlight">
      <p><strong>Nombre:</strong> ${data.senderName}</p>
      <p><strong>Email:</strong> ${data.senderEmail}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${(_a = data.contactMessage) === null || _a === void 0 ? void 0 : _a.replace(/\n/g, '<br>')}</p>
    </div>
    <p>Este mensaje fue enviado desde el formulario de contacto del sitio web.</p>
  `;
    return {
        subject,
        text: `Nuevo mensaje de contacto\n\nNombre: ${data.senderName}\nEmail: ${data.senderEmail}\n\nMensaje:\n${data.contactMessage}`,
        html: baseTemplate(subject, content)
    };
};
exports.getContactFormTemplate = getContactFormTemplate;
// 2. Plantilla de confirmación de cita
const getAppointmentConfirmationTemplate = (data) => {
    var _a;
    const subject = '✅ Confirmación de cita - Ale Veterinaria';
    const appointmentDateStr = (_a = data.appointmentDate) === null || _a === void 0 ? void 0 : _a.toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
        dateStyle: 'full',
        timeStyle: 'short'
    });
    const content = `
    <h2>✅ Tu cita ha sido confirmada</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Hemos confirmado tu cita para <strong>${data.patientName}</strong> (${data.species}).</p>
    
    <div class="highlight">
      <h3>📅 Detalles de la cita:</h3>
      <p><strong>Fecha y hora:</strong> ${appointmentDateStr}</p>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p><strong>Tutor:</strong> ${data.tutorName}</p>
      ${data.appointmentNotes ? `<p><strong>Notas:</strong> ${data.appointmentNotes}</p>` : ''}
    </div>

    <p>📍 La consulta será realizada en tu domicilio. Te confirmaremos la hora exacta el día anterior.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">💬 Contactar por WhatsApp</a>
    
    <p><strong>¿Necesitas reagendar?</strong> Contáctanos por WhatsApp o responde a este email.</p>
  `;
    const icsBuffer = data.appointmentDate ? generateICS(data.appointmentDate, data.tutorName, data.tutorEmail, data.appointmentNotes) : undefined;
    return {
        subject,
        text: `Confirmación de cita\n\nHola ${data.tutorName},\n\nTu cita para ${data.patientName} ha sido confirmada para el ${appointmentDateStr}.\n\nNos vemos pronto!`,
        html: baseTemplate(subject, content),
        icsBuffer
    };
};
exports.getAppointmentConfirmationTemplate = getAppointmentConfirmationTemplate;
// 3. Recordatorio de cita (48h, 24h, mismo día)
const getAppointmentReminderTemplate = (data, reminderType) => {
    var _a;
    const titles = {
        '48h': '🔔 Recordatorio: Tu cita es en 2 días',
        '24h': '⏰ Recordatorio: Tu cita es mañana',
        'today': '🚨 Recordatorio: Tu cita es hoy'
    };
    const subject = titles[reminderType];
    const appointmentDateStr = (_a = data.appointmentDate) === null || _a === void 0 ? void 0 : _a.toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
        dateStyle: 'full',
        timeStyle: 'short'
    });
    const content = `
    <h2>${titles[reminderType]}</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Te recordamos que tienes una cita confirmada para <strong>${data.patientName}</strong>.</p>
    
    <div class="highlight">
      <h3>📅 Detalles de la cita:</h3>
      <p><strong>Fecha y hora:</strong> ${appointmentDateStr}</p>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
    </div>

    <p>📍 Nos vemos en tu domicilio a la hora acordada.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">💬 Contactar por WhatsApp</a>
    
    <p>Si necesitas cancelar o reagendar, contáctanos lo antes posible.</p>
  `;
    return {
        subject,
        text: `${titles[reminderType]}\n\nHola ${data.tutorName},\n\nRecordatorio de cita para ${data.patientName} el ${appointmentDateStr}.\n\nNos vemos pronto!`,
        html: baseTemplate(subject, content)
    };
};
exports.getAppointmentReminderTemplate = getAppointmentReminderTemplate;
// 4. Recordatorio de vacuna próxima
const getVaccineReminderTemplate = (data) => {
    var _a;
    const subject = '💉 Recordatorio: Vacuna próxima para ' + data.patientName;
    const nextDoseStr = (_a = data.nextDose) === null || _a === void 0 ? void 0 : _a.toLocaleDateString('es-CL', {
        timeZone: 'America/Santiago',
        dateStyle: 'full'
    });
    const content = `
    <h2>💉 Recordatorio de vacunación</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Te recordamos que <strong>${data.patientName}</strong> tiene una dosis de vacuna próxima.</p>
    
    <div class="highlight">
      <h3>💉 Detalles de la vacuna:</h3>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p><strong>Vacuna:</strong> ${data.vaccineType}</p>
      <p><strong>Fecha programada:</strong> ${nextDoseStr}</p>
    </div>

    <p>Es importante mantener al día las vacunas para proteger la salud de tu mascota.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">💬 Agendar por WhatsApp</a>
    
    <p>Contáctanos para agendar la aplicación de la vacuna a domicilio.</p>
  `;
    return {
        subject,
        text: `Recordatorio de vacuna\n\nHola ${data.tutorName},\n\n${data.patientName} tiene una dosis de ${data.vaccineType} programada para el ${nextDoseStr}.\n\nContáctanos para agendar.`,
        html: baseTemplate(subject, content)
    };
};
exports.getVaccineReminderTemplate = getVaccineReminderTemplate;
// 5. Recordatorio de desparasitación
const getDewormingReminderTemplate = (data) => {
    var _a;
    const subject = '🛡️ Recordatorio: Desparasitación para ' + data.patientName;
    const nextDoseStr = (_a = data.nextDose) === null || _a === void 0 ? void 0 : _a.toLocaleDateString('es-CL', {
        timeZone: 'America/Santiago',
        dateStyle: 'full'
    });
    const content = `
    <h2>🛡️ Recordatorio de desparasitación</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Te recordamos que <strong>${data.patientName}</strong> necesita su próxima desparasitación.</p>
    
    <div class="highlight">
      <h3>🛡️ Detalles:</h3>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p><strong>Producto:</strong> ${data.productName}</p>
      <p><strong>Fecha programada:</strong> ${nextDoseStr}</p>
    </div>

    <p>La desparasitación regular es fundamental para mantener la salud de tu mascota.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">💬 Consultar por WhatsApp</a>
    
    <p>Podemos orientarte sobre el mejor producto y aplicación a domicilio.</p>
  `;
    return {
        subject,
        text: `Recordatorio de desparasitación\n\nHola ${data.tutorName},\n\n${data.patientName} necesita desparasitación programada para el ${nextDoseStr}.\n\nContáctanos para más información.`,
        html: baseTemplate(subject, content)
    };
};
exports.getDewormingReminderTemplate = getDewormingReminderTemplate;
// 6. Plantilla de cancelación de cita
const getAppointmentCancellationTemplate = (data) => {
    var _a;
    const subject = '❌ Cita Cancelada - Ale Veterinaria';
    const appointmentDateStr = (_a = data.appointmentDate) === null || _a === void 0 ? void 0 : _a.toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
        dateStyle: 'full',
        timeStyle: 'short'
    });
    const content = `
    <h2>❌ Tu cita ha sido cancelada</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Te confirmamos que la cita para <strong>${data.patientName}</strong> (${data.species}) ha sido cancelada.</p>
    
    <div class="highlight">
      <h3>📅 Detalles de la cita cancelada:</h3>
      <p><strong>Fecha y hora:</strong> ${appointmentDateStr}</p>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p><strong>Servicio:</strong> ${data.serviceType}</p>
    </div>

    <p>📍 Si deseas reagendar o necesitas una nueva cita, no dudes en contactarnos.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">💬 Contactar por WhatsApp</a>
    
    <p><strong>¿Necesitas otra cita?</strong> Contáctanos por WhatsApp o responde a este email.</p>
  `;
    return {
        subject,
        text: `Cita cancelada\n\nHola ${data.tutorName},\n\nTu cita para ${data.patientName} programada para el ${appointmentDateStr} ha sido cancelada.\n\nContáctanos si necesitas reagendar.`,
        html: baseTemplate(subject, content)
    };
};
exports.getAppointmentCancellationTemplate = getAppointmentCancellationTemplate;
// 7. Plantilla de modificación de cita
const getAppointmentUpdateTemplate = (data) => {
    var _a;
    const subject = '✏️ Cita Modificada - Ale Veterinaria';
    const appointmentDateStr = (_a = data.appointmentDate) === null || _a === void 0 ? void 0 : _a.toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
        dateStyle: 'full',
        timeStyle: 'short'
    });
    const content = `
    <h2>✏️ Tu cita ha sido modificada</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Te confirmamos que la cita para <strong>${data.patientName}</strong> (${data.species}) ha sido actualizada con los nuevos datos.</p>
    
    <div class="highlight">
      <h3>📅 Nuevos detalles de la cita:</h3>
      <p><strong>Fecha y hora:</strong> ${appointmentDateStr}</p>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p><strong>Servicio:</strong> ${data.serviceType}</p>
      <p><strong>Dirección:</strong> ${data.address}</p>
      ${data.appointmentNotes ? `<p><strong>Notas:</strong> ${data.appointmentNotes}</p>` : ''}
    </div>

    <p>📍 La consulta será realizada en tu domicilio a la nueva hora acordada.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">💬 Contactar por WhatsApp</a>
    
    <p><strong>¿Tienes dudas?</strong> Contáctanos por WhatsApp o responde a este email.</p>
  `;
    const icsBuffer = data.appointmentDate ? generateICS(data.appointmentDate, data.tutorName, data.tutorEmail, data.appointmentNotes) : undefined;
    return {
        subject,
        text: `Cita modificada\n\nHola ${data.tutorName},\n\nTu cita para ${data.patientName} ha sido actualizada para el ${appointmentDateStr}.\n\nNos vemos pronto!`,
        html: baseTemplate(subject, content),
        icsBuffer
    };
};
exports.getAppointmentUpdateTemplate = getAppointmentUpdateTemplate;
// 8. Plantilla de envío de documentos/exámenes
const getExamDocumentTemplate = (data) => {
    const subject = `📋 Resultados de Exámenes - ${data.patientName} - Ale Veterinaria`;
    const content = `
    <h2>📋 Resultados de exámenes disponibles</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Los resultados de los exámenes de <strong>${data.patientName}</strong> ya están disponibles.</p>
    
    <div class="highlight">
      <h3>📄 Detalles del documento:</h3>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p><strong>Tipo de examen:</strong> ${data.productName || 'Examen médico'}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CL', {
        timeZone: 'America/Santiago',
        dateStyle: 'full'
    })}</p>
      ${data.appointmentNotes ? `<p><strong>Observaciones:</strong> ${data.appointmentNotes}</p>` : ''}
    </div>

    <p>📁 El documento adjunto contiene todos los resultados detallados.</p>
    <p>📞 Si tienes alguna consulta sobre los resultados, no dudes en contactarnos.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">💬 Consultar por WhatsApp</a>
    
    <p><strong>¿Necesitas una consulta de seguimiento?</strong> Contáctanos para agendar una cita y revisar los resultados juntos.</p>
  `;
    return {
        subject,
        text: `Resultados de exámenes\n\nHola ${data.tutorName},\n\nLos resultados de los exámenes de ${data.patientName} están disponibles en el documento adjunto.\n\nContáctanos si tienes consultas.`,
        html: baseTemplate(subject, content)
    };
};
exports.getExamDocumentTemplate = getExamDocumentTemplate;
// 9. Seguimiento post-consulta (7 días después)
const getFollowUpTemplate = (data) => {
    const subject = '💝 ¿Cómo está ' + data.patientName + '? - Seguimiento';
    const content = `
    <h2>💝 Seguimiento post-consulta</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Ha pasado una semana desde la consulta de <strong>${data.patientName}</strong> y queremos saber cómo está.</p>
    
    <div class="highlight">
      <h3>👩‍⚕️ Nos interesa saber:</h3>
      <ul>
        <li>¿Cómo ha evolucionado ${data.patientName}?</li>
        <li>¿Hay alguna mejoría en su condición?</li>
        <li>¿Tienes alguna consulta sobre el tratamiento?</li>
        <li>¿Necesitas agendar un control de seguimiento?</li>
      </ul>
    </div>

    <p>Tu mascota es importante para nosotros y queremos asegurar su completa recuperación.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">💬 Responder por WhatsApp</a>
    
    <p>No dudes en contactarnos si tienes cualquier duda o inquietud.</p>
  `;
    return {
        subject,
        text: `Seguimiento post-consulta\n\nHola ${data.tutorName},\n\n¿Cómo está ${data.patientName} después de la consulta? Queremos saber su evolución.\n\nContáctanos si tienes dudas.`,
        html: baseTemplate(subject, content)
    };
};
exports.getFollowUpTemplate = getFollowUpTemplate;
// 7. Recordatorio de exámenes pendientes
const getExamReminderTemplate = (data) => {
    const subject = '🔬 Recordatorio: Exámenes pendientes para ' + data.patientName;
    const content = `
    <h2>🔬 Recordatorio de exámenes</h2>
    <p>Hola <strong>${data.tutorName}</strong>,</p>
    <p>Te recordamos que <strong>${data.patientName}</strong> tiene exámenes médicos pendientes.</p>
    
    <div class="highlight">
      <h3>🔬 Información:</h3>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species})</p>
      <p>Han pasado varios días desde que se solicitaron los exámenes y no hemos recibido los resultados.</p>
    </div>

    <p>Los resultados de los exámenes son importantes para el diagnóstico y tratamiento adecuado.</p>
    
    <a href="${SIGNATURE.whatsapp}" class="button">💬 Consultar por WhatsApp</a>
    
    <p>Por favor contáctanos para coordinar la entrega de resultados o resolver cualquier duda.</p>
  `;
    return {
        subject,
        text: `Recordatorio de exámenes\n\nHola ${data.tutorName},\n\n${data.patientName} tiene exámenes pendientes. Contáctanos para coordinar la entrega de resultados.`,
        html: baseTemplate(subject, content)
    };
};
exports.getExamReminderTemplate = getExamReminderTemplate;
// 8. Cuestionario pre-visita completado
const getQuestionnaireCompletedTemplate = (data) => {
    const subject = `📋 Cuestionario pre-visita completado: ${data.patientName}`;
    const appointmentDateStr = data.appointmentDate ? data.appointmentDate.toLocaleDateString('es-CL') : 'Fecha pendiente';
    const content = `
    <h2>📋 Nuevo cuestionario pre-visita</h2>
    <p>Se ha completado un cuestionario pre-visita para la próxima consulta.</p>
    
    <div class="highlight">
      <h3>📝 Información de la consulta:</h3>
      <p><strong>Paciente:</strong> ${data.patientName} (${data.species || 'Especie no especificada'})</p>
      <p><strong>Tutor:</strong> ${data.tutorName}</p>
      <p><strong>Email:</strong> ${data.tutorEmail}</p>
      <p><strong>Fecha de cita:</strong> ${appointmentDateStr}</p>
    </div>

    ${data.questionnaireSummary ? `
    <div class="highlight">
      <h3>📋 Resumen del cuestionario:</h3>
      <p>${data.questionnaireSummary}</p>
    </div>
    ` : ''}

    <p>El cuestionario pre-visita está disponible en el portal profesional para revisar antes de la consulta.</p>
    
    <p>Esto te permitirá:</p>
    <ul>
      <li>✅ Preparar mejor la consulta</li>
      <li>✅ Conocer las preocupaciones específicas del tutor</li>
      <li>✅ Adaptar el enfoque según las necesidades del paciente</li>
    </ul>
    
    <p><strong>Recuerda revisar el cuestionario antes de la cita para brindar la mejor atención Fear Free®.</strong></p>
  `;
    return {
        subject,
        text: `Cuestionario pre-visita completado: ${data.patientName}\n\nSe ha completado un cuestionario pre-visita para la próxima consulta.\n\nPaciente: ${data.patientName} (${data.species || 'Especie no especificada'})\nTutor: ${data.tutorName}\nEmail: ${data.tutorEmail}\nFecha de cita: ${appointmentDateStr}\n\n${data.questionnaireSummary ? `Resumen: ${data.questionnaireSummary}\n\n` : ''}El cuestionario está disponible en el portal profesional.\n\nSaludos,\nSistema Ale Veterinaria`,
        html: baseTemplate(subject, content)
    };
};
exports.getQuestionnaireCompletedTemplate = getQuestionnaireCompletedTemplate;
// ============================================
// PLANTILLAS DE WHATSAPP
// ============================================
const getWhatsAppTemplate = (templateType, data) => {
    const formatDateTime = (date) => {
        if (!date)
            return '';
        return date.toLocaleString('es-CL', {
            timeZone: 'America/Santiago',
            dateStyle: 'short',
            timeStyle: 'short'
        });
    };
    switch (templateType) {
        case 'appointment_created':
            return `🐾 *Cita confirmada* - Ale Veterinaria\n\nHola ${data.tutorName},\n\n✅ Tu cita para ${data.patientName} ha sido agendada exitosamente.\n\n📅 *Detalles:*\n• Fecha: ${formatDateTime(data.appointmentDate)}\n• Paciente: ${data.patientName} (${data.species})\n• Servicio: ${data.serviceType || 'Consulta veterinaria'}\n\nNos vemos pronto! 🏠\n\n📞 ¿Dudas? Responde a este mensaje`;
        case 'reminder_48h':
            return `⏰ *Recordatorio* - Ale Veterinaria\n\nHola ${data.tutorName},\n\n🔔 Te recordamos que tienes una cita para ${data.patientName} en 2 días.\n\n📅 *Detalles:*\n• Fecha: ${formatDateTime(data.appointmentDate)}\n• Paciente: ${data.patientName} (${data.species})\n\nNos vemos pronto! 🐕`;
        case 'reminder_24h':
            return `⏰ *Recordatorio* - Ale Veterinaria\n\nHola ${data.tutorName},\n\n🚨 Te recordamos que tienes una cita para ${data.patientName} *mañana*.\n\n📅 *Detalles:*\n• Fecha: ${formatDateTime(data.appointmentDate)}\n• Paciente: ${data.patientName} (${data.species})\n\n¡Nos vemos mañana! 🏠`;
        case 'reminder_today':
            return `🚨 *Recordatorio* - Ale Veterinaria\n\nHola ${data.tutorName},\n\n⏰ Te recordamos que tienes una cita para ${data.patientName} *HOY*.\n\n📅 *Detalles:*\n• Hora: ${formatDateTime(data.appointmentDate)}\n• Paciente: ${data.patientName} (${data.species})\n\n¡Nos vemos hoy! 🐾`;
        case 'appointment_cancelled':
            return `❌ *Cita cancelada* - Ale Veterinaria\n\nHola ${data.tutorName},\n\nTu cita para ${data.patientName} programada para el ${formatDateTime(data.appointmentDate)} ha sido cancelada.\n\n📞 ¿Necesitas reagendar? Responde a este mensaje.`;
        case 'vaccine_reminder':
            return `💉 *Recordatorio de vacuna* - Ale Veterinaria\n\nHola ${data.tutorName},\n\n🔔 ${data.patientName} necesita su ${data.vaccineType || 'vacuna'} próximamente.\n\n📅 Fecha sugerida: ${formatDateTime(data.nextDose)}\n\n📞 ¿Agendamos la cita? Responde a este mensaje`;
        case 'deworming_reminder':
            return `🪱 *Recordatorio de desparasitación* - Ale Veterinaria\n\nHola ${data.tutorName},\n\n🔔 ${data.patientName} necesita su desparasitación con ${data.productName || 'antiparasitario'}.\n\n📅 Fecha sugerida: ${formatDateTime(data.nextDose)}\n\n📞 ¿Agendamos la cita? Responde a este mensaje`;
        case 'exam_results':
            return `📋 *Resultados disponibles* - Ale Veterinaria\n\nHola ${data.tutorName},\n\nLos resultados de los exámenes de ${data.patientName} ya están listos.\n\n📄 Revisa tu portal del tutor para descargar los documentos.\n\n📞 ¿Tienes consultas? Responde a este mensaje`;
        case 'followup':
            return `🔄 *Seguimiento* - Ale Veterinaria\n\nHola ${data.tutorName},\n\n¿Cómo está ${data.patientName} después de la última consulta?\n\n📞 Si necesitas una consulta de seguimiento o tienes dudas, responde a este mensaje.\n\n¡Nos preocupamos por el bienestar de tu mascota! 🐾`;
        default:
            return `🐾 Ale Veterinaria\n\nHola ${data.tutorName},\n\nTienes una notificación importante sobre ${data.patientName}.\n\n📞 Para más información, contáctanos.`;
    }
};
exports.getWhatsAppTemplate = getWhatsAppTemplate;
//# sourceMappingURL=templates.js.map