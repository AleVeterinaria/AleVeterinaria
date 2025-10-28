// PDF generation utilities for prescriptions and certificates
import logoPath from '@assets/logo1_1757617141709.png';
import { formatDateToChilean } from './dateFormatter';

// Function to format RUT with dots and dash
const formatRut = (rut: string) => {
  if (!rut) return '';
  // Remove any existing dots and dashes
  const cleanRut = rut.replace(/[.-]/g, '');
  // Format as xx.xxx.xxx-xmucho mejor p
  if (cleanRut.length >= 8) {
    const body = cleanRut.slice(0, -1);
    const verifier = cleanRut.slice(-1);
    return body.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + verifier;
  }
  return rut;
};

// Function to generate vaccination and deworming card in table format
export const generateVaccinationDewormerCard = async (pet: any, petVaccinations: any[], petDewormings: any[]) => {
  const currentDate = formatDateToChilean(new Date());
  
  // Create vaccination table
  const createVaccinationTable = () => {
    if (petVaccinations.length === 0) {
      return `
        <div style="text-align: center; padding: 20px; color: #666; background: #f8f9fa; border-radius: 8px; margin: 10px 0;">
          No hay registros de vacunación disponibles
        </div>
      `;
    }

    const vaccineRows = petVaccinations.map(vac => {
      const applicationDate = vac.applicationDate ? formatDateToChilean(vac.applicationDate) : '-';
      const nextDueDate = vac.nextDueDate ? formatDateToChilean(vac.nextDueDate) : '-';
      const laboratory = vac.laboratory || '-';
      const isUpToDate = vac.nextDueDate ? new Date(vac.nextDueDate) > new Date() : false;
      const status = isUpToDate ? 'VIGENTE' : 'PENDIENTE';
      const statusColor = isUpToDate ? '#22c55e' : '#f59e0b';
      
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb;">${vac.vaccineName || '-'}</td>
          <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb; text-align: center;">${applicationDate}</td>
          <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb; text-align: center;">${laboratory}</td>
          <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb; text-align: center;">${nextDueDate}</td>
          <td style="padding: 12px 8px; text-align: center;">
            <span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
              ${status}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: linear-gradient(135deg, #5FA98D, #7FB3A3); color: white;">
            <th style="padding: 15px 8px; text-align: left; font-weight: 600; font-size: 13px;">VACUNA</th>
            <th style="padding: 15px 8px; text-align: center; font-weight: 600; font-size: 13px;">FECHA APLICACIÓN</th>
            <th style="padding: 15px 8px; text-align: center; font-weight: 600; font-size: 13px;">LABORATORIO</th>
            <th style="padding: 15px 8px; text-align: center; font-weight: 600; font-size: 13px;">PRÓXIMA DOSIS</th>
            <th style="padding: 15px 8px; text-align: center; font-weight: 600; font-size: 13px;">ESTADO</th>
          </tr>
        </thead>
        <tbody>
          ${vaccineRows}
        </tbody>
      </table>
    `;
  };

  // Create deworming table
  const createDewormingTable = () => {
    if (petDewormings.length === 0) {
      return `
        <div style="text-align: center; padding: 20px; color: #666; background: #f8f9fa; border-radius: 8px; margin: 10px 0;">
          No hay registros de desparasitación disponibles
        </div>
      `;
    }

    const dewormingRows = petDewormings.map(dew => {
      const applicationDate = dew.applicationDate ? formatDateToChilean(dew.applicationDate) : '-';
      const nextDueDate = dew.nextDueDate ? formatDateToChilean(dew.nextDueDate) : '-';
      const laboratory = dew.laboratory || '-';
      const product = dew.product || '-';
      const isUpToDate = dew.nextDueDate ? new Date(dew.nextDueDate) > new Date() : false;
      const status = isUpToDate ? 'VIGENTE' : 'PENDIENTE';
      const statusColor = isUpToDate ? '#22c55e' : '#f59e0b';
      
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb;">${product}</td>
          <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb; text-align: center;">${applicationDate}</td>
          <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb; text-align: center;">${laboratory}</td>
          <td style="padding: 12px 8px; border-right: 1px solid #e5e7eb; text-align: center;">${nextDueDate}</td>
          <td style="padding: 12px 8px; text-align: center;">
            <span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
              ${status}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: linear-gradient(135deg, #9B59B6, #8E44AD); color: white;">
            <th style="padding: 15px 8px; text-align: left; font-weight: 600; font-size: 13px;">PRODUCTO</th>
            <th style="padding: 15px 8px; text-align: center; font-weight: 600; font-size: 13px;">FECHA APLICACIÓN</th>
            <th style="padding: 15px 8px; text-align: center; font-weight: 600; font-size: 13px;">LABORATORIO</th>
            <th style="padding: 15px 8px; text-align: center; font-weight: 600; font-size: 13px;">PRÓXIMA DOSIS</th>
            <th style="padding: 15px 8px; text-align: center; font-weight: 600; font-size: 13px;">ESTADO</th>
          </tr>
        </thead>
        <tbody>
          ${dewormingRows}
        </tbody>
      </table>
    `;
  };

  const cardHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Carnet de Vacunación y Desparasitación</title>
      <style>
        @page {
          size: Letter;
          margin: 15mm;
        }
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 0;
          padding: 20px;
          line-height: 1.6;
          color: #333;
          background: #f8f9fa;
        }
        
        .container {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 6px 25px rgba(0,0,0,0.12);
          max-width: 800px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 3px solid #5FA98D;
          padding-bottom: 20px;
          margin-bottom: 25px;
          gap: 20px;
        }
        
        .logo {
          width: 70px;
          height: 70px;
          object-fit: contain;
        }
        
        .clinic-info {
          text-align: center;
          flex: 1;
        }
        
        .clinic-name {
          font-size: 28px;
          font-weight: bold;
          margin: 0;
          color: #333;
        }
        
        .clinic-name .ale {
          color: #5FA98D;
        }
        
        .subtitle {
          font-size: 18px;
          color: #5FA98D;
          margin: 5px 0 0 0;
          font-weight: 600;
        }

        .card-title {
          background: linear-gradient(135deg, #5FA98D, #7FB3A3);
          color: white;
          padding: 15px 20px;
          border-radius: 10px;
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          margin: 20px 0;
          box-shadow: 0 4px 8px rgba(95, 169, 141, 0.3);
        }

        .pet-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          border-left: 5px solid #5FA98D;
        }
        
        .pet-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 10px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dotted #ddd;
        }
        
        .info-label {
          font-weight: 600;
          color: #5FA98D;
        }
        
        .info-value {
          color: #333;
        }

        .section-title {
          color: #2D3748;
          font-size: 18px;
          font-weight: bold;
          margin: 30px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #5FA98D;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
        }

        .contact-info {
          font-size: 12px;
          color: #666;
          text-align: center;
          margin-top: 15px;
        }

        @media print {
          body { 
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .container {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 20px !important;
            margin: 0 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <img src="${logoPath}" alt="Logo Veterinaria" class="logo">
          <div class="clinic-info">
            <h1 class="clinic-name"><span class="ale">Ale</span> Veterinaria</h1>
            <div class="subtitle">Carnet de Vacunación y Desparasitación</div>
          </div>
        </div>

        <div class="card-title">
          🏥 CARNET SANITARIO DIGITAL
        </div>

        <!-- Pet Information -->
        <div class="pet-info">
          <h3 style="margin: 0 0 15px 0; color: #5FA98D; font-size: 16px;">📋 Información del Paciente</h3>
          <div class="pet-info-grid">
            <div class="info-item">
              <span class="info-label">Nombre:</span>
              <span class="info-value">${pet.name || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Especie:</span>
              <span class="info-value">${pet.species || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Raza:</span>
              <span class="info-value">${pet.breed || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Sexo:</span>
              <span class="info-value">${pet.sex || pet.gender || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha Nacimiento:</span>
              <span class="info-value">${pet.birthDate ? formatDateToChilean(pet.birthDate) : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Microchip:</span>
              <span class="info-value">${pet.microchip || 'No registrado'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tutor:</span>
              <span class="info-value">${pet.tutorName || pet.ownerName || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">RUT Tutor:</span>
              <span class="info-value">${formatRut(pet.tutorRut || pet.ownerId || pet.ownerRut) || '-'}</span>
            </div>
          </div>
        </div>

        <!-- Vaccination Section -->
        <div class="section-title">
          💉 ESTADO DE VACUNACIÓN
        </div>
        ${createVaccinationTable()}

        <!-- Deworming Section -->
        <div class="section-title">
          🐛 ESTADO DE DESPARASITACIÓN
        </div>
        ${createDewormingTable()}

        <!-- Footer -->
        <div class="footer">
          <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; max-width: 400px; margin: 0 auto;">
            <div style="font-weight: bold; color: #5FA98D; margin-bottom: 5px; font-size: 16px;">Alejandra Cautín Bastías</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Médico Veterinario | RUT: 19.463.420-K</div>
            <div style="font-size: 12px; color: #666;">
              📞 +56 9 7604 0797 | 📧 contacto@aleveterinaria.cl
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create and download PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(cardHTML);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  }
};

export const generatePrescriptionPDF = (patient: any, prescription: any, veterinarian: any) => {
  const issueDate = prescription.issueDate ? formatDateToChilean(prescription.issueDate) : formatDateToChilean(new Date());
  const currentDate = issueDate; // Para compatibilidad
  
  const prescriptionHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receta Médica Veterinaria</title>
      <style>
        @page {
          size: Letter;
          margin: 15mm;
        }
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 0;
          padding: 20px;
          line-height: 1.6;
          color: #333;
          background: white;
          position: relative;
          min-height: calc(100vh - 40px);
          width: calc(100% - 40px);
          background: linear-gradient(135deg, #5FA98D 0%, #5FA98D 30%, transparent 30%);
        }
        
        /* Curved decorative elements */
        body::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #5FA98D, #7FB3A3);
          border-radius: 0 0 0 100%;
          opacity: 0.3;
          z-index: -1;
        }
        
        body::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100px;
          height: 100px;
          background: linear-gradient(45deg, #5FA98D, #7FB3A3);
          border-radius: 0 100% 0 0;
          opacity: 0.2;
          z-index: -1;
        }

        /* MARCA DE AGUA DIRECTA EN EL BODY */
        body::before {
          content: '';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 400px;
          background-image: url('${logoPath}');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          opacity: 0.3;
          z-index: -1;
          pointer-events: none;
        }

        .container {
          width: calc(100% - 50px);
          margin: 0 auto;
          position: relative;
          z-index: 2;
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 6px 25px rgba(0,0,0,0.12);
          min-height: calc(100vh - 120px);
          margin-bottom: 60px;
        }

        /* Header - COMPACTO vertical */
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          width: 100%;
        }
        
        .logo-section {
          flex-shrink: 0;
          margin-right: 25px;
        }
        
        .clinic-logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }

        .header-info {
          flex: 1;
          line-height: 1.2;
        }
        
        .clinic-name {
          font-size: 36px;
          font-weight: bold;
          margin: 0 0 5px 0;
          color: #333;
        }
        
        .clinic-name .ale {
          color: #5FA98D;
        }
        
        .vet-name {
          font-size: 18px;
          color: #5FA98D;
          margin: 0 0 3px 0;
          font-weight: 600;
        }
        
        .vet-credentials {
          font-size: 14px;
          color: #9B59B6;
          margin: 0;
          font-style: italic;
        }

        /* Patient info - COMPACTO vertical */
        .patient-section {
          margin: 15px 0;
          width: 100%;
        }
        
        .patient-row {
          display: flex;
          margin-bottom: 12px;
          align-items: center;
          width: 100%;
          justify-content: center;
          gap: 25px;
        }
        
        .field-group {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex: 1;
        }
        
        .field-label {
          color: #5FA98D;
          font-weight: 600;
          font-size: 14px;
          margin-right: 8px;
          white-space: nowrap;
        }
        
        .field-value {
          border-bottom: 1px solid #5FA98D;
          padding-bottom: 2px;
          font-size: 14px;
          min-width: 100px;
          min-height: 18px;
          text-align: center;
          flex: 1;
        }

        /* Rp section - ALINEADO con prescripción */
        .prescription-section {
          margin: 20px 0 100px 0;
          min-height: 200px;
          position: relative;
          width: 100%;
          display: flex;
          align-items: start;
        }
        
        .rp-header {
          font-size: 20px;
          color: #5FA98D;
          font-weight: bold;
          margin: 0 15px 0 0;
          line-height: 1.2;
          flex-shrink: 0;
        }
        
        .prescription-content {
          font-size: 20px;
          line-height: 1.8;
          flex: 1;
          margin: 0;
        }

        /* Footer - PIE DE PÁGINA FIJO */
        .footer {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          width: 100%;
          background: white;
          padding: 15px 0;
          z-index: 10;
        }
        
        .signature-lines {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        
        .signature-line {
          text-align: center;
          width: 180px;
        }
        
        .line {
          border-bottom: 2px solid #5FA98D;
          margin-bottom: 5px;
          height: 25px;
        }
        
        .label {
          color: #5FA98D;
          font-size: 14px;
          font-weight: 600;
        }
        
        .contact-info-horizontal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          font-size: 12px;
          color: #666;
        }
        
        .contact-icon {
          color: #5FA98D;
          margin-right: 3px;
        }

        @media print {
          body { 
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background: white !important;
          }
          .no-print { display: none; }
          .container {
            width: calc(100% - 30mm) !important;
            margin: 15mm auto !important;
            padding: 20px !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin-bottom: 15mm !important;
            background: white !important;
            min-height: calc(100vh - 30mm) !important;
          }
          .footer {
            position: absolute !important;
            bottom: 10px !important;
            left: 0 !important;
            right: 0 !important;
            background: white !important;
          }
          .watermark {
            opacity: 0.4 !important;
            z-index: 1 !important;
            position: absolute !important;
          }
        }
      </style>
    </head>
    <body>
      <!-- Large watermark logo -->
      <div class="watermark"></div>
      
      <div class="container">
        <!-- Header with logo and clinic info -->
        <div class="header">
          <div class="logo-section">
            <img src="${logoPath}" alt="Logo Veterinaria" class="clinic-logo">
          </div>
          <div class="header-info">
            <h1 class="clinic-name"><span class="ale">Ale</span> <span style="color: #333;">Veterinaria</span></h1>
            <div class="vet-name">Alejandra Cautín Bastías</div>
            <div class="vet-credentials">Médico Veterinario | 19.463.420-K</div>
          </div>
        </div>

        <!-- Patient information in organized rows -->
        <div class="patient-section">
          <div class="patient-row">
            <div class="field-group">
              <div class="field-label">Paciente:</div>
              <div class="field-value">${patient.name || ''}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Fecha:</div>
              <div class="field-value">${currentDate}</div>
            </div>
          </div>
          
          <div class="patient-row">
            <div class="field-group">
              <div class="field-label">Edad:</div>
              <div class="field-value">${patient.age || ''}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Peso:</div>
              <div class="field-value">${patient.weight || ''}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Especie:</div>
              <div class="field-value">${patient.species || ''}</div>
            </div>
          </div>
          
          <div class="patient-row">
            <div class="field-group">
              <div class="field-label">Tutor:</div>
              <div class="field-value">${patient.tutorName || patient.ownerName || ''}</div>
            </div>
            <div class="field-group">
              <div class="field-label">RUT:</div>
              <div class="field-value">${formatRut(patient.tutorRut || patient.ownerId || patient.ownerRut) || ''}</div>
            </div>
          </div>
        </div>

        <!-- Large Rp section for prescription -->
        <div class="prescription-section">
          <div class="rp-header">Rp:</div>
          <div class="prescription-content">
            ${(() => {
              console.log('DEBUG - Full prescription object:', prescription);
              console.log('DEBUG - medications:', prescription.medications);
              console.log('DEBUG - treatment:', prescription.treatment);
              
              // PRIORIZAR: Si hay medications array, usar eso
              if (prescription.medications && Array.isArray(prescription.medications) && prescription.medications.length > 0) {
                console.log('DEBUG - Using medications array format');
                return prescription.medications.map((medication: any) => {
                  console.log('DEBUG - Processing medication:', medication);
                  
                  // Crear una frase natural en formato horizontal
                  let medicationText = `<strong>${medication.name}:</strong> `;
                  
                  // Agregar "Dar" como verbo inicial
                  medicationText += 'Dar ';
                  
                  // Agregar dosis
                  if (medication.dosage) {
                    medicationText += `${medication.dosage} `;
                  }
                  
                  // Agregar vía de administración
                  if (medication.administrationRoute) {
                    medicationText += `por vía ${medication.administrationRoute.toLowerCase()} `;
                  }
                  
                  // Agregar frecuencia
                  if (medication.frequency) {
                    medicationText += `${medication.frequency} `;
                  }
                  
                  // Agregar duración
                  if (medication.duration) {
                    medicationText += `durante ${medication.duration}`;
                  }
                  
                  // Terminar con punto
                  medicationText += '.';
                  
                  // Agregar instrucciones especiales si las hay
                  if (medication.specialInstructions) {
                    medicationText += ` <em>${medication.specialInstructions}</em>`;
                  }
                  
                  return `
                    <div style="margin-bottom: 15px; font-size: 18px; line-height: 1.6;">
                      ${medicationText}
                    </div>
                  `;
                }).join('');
              }
              
              // FALLBACK: usar treatment string
              console.log('DEBUG - Using treatment fallback');
              if (prescription.treatment) {
                return prescription.treatment.split('\n').map((medication: string) => {
                  if (medication.trim()) {
                    return `<div style="margin-bottom: 10px;">${medication.trim()}</div>`;
                  }
                  return '';
                }).join('');
              }
              
              return '<div style="color: #666; font-style: italic;">Prescripción médica</div>';
            })()}
            
            ${prescription.indications ? `
              <div style="margin-top: 20px;">
                <strong>Indicaciones:</strong><br>
                ${prescription.indications}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Footer PIE DE PÁGINA FIJO -->
        <div class="footer">
          <div class="signature-lines">
            <div class="signature-line">
              <div class="line"></div>
              <div class="label">Fecha</div>
            </div>
            <div class="signature-line">
              <div class="line"></div>
              <div class="label">Firma</div>
            </div>
          </div>
          <div class="contact-info-horizontal">
            <div>📱 +56 9 7604 0797</div>
            <div>📷 @aleveterinaria</div>
            <div>📧 contacto@aleveterinaria.cl</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(prescriptionHTML);
    printWindow.document.close();
    printWindow.focus();
  }
};

// Function to generate microchip certificate content
const generateMicrochipCertificateContent = (patient: any, certificate: any) => {
  const currentDate = new Date().toLocaleDateString('es-CL');
  const microchipType = certificate.microchipType || certificate.content?.microchipType || 'implantation';
  
  // Base certification items
  const baseCertificationItems = microchipType === 'verification' ? [
    'El microchip ha sido verificado correctamente',
    'El número de identificación es único e irrepetible', 
    'El dispositivo se encuentra funcionando correctamente',
    'El animal se encuentra en buen estado de salud'
  ] : [
    'El microchip ha sido implantado correctamente',
    'El número de identificación es único e irrepetible',
    'El dispositivo se encuentra funcionando correctamente', 
    'La implantación se realizó bajo estrictas medidas de asepsia',
    'El animal se encuentra en buen estado de salud'
  ];
  
  // Add registration status if verification type
  const certificationItems = [...baseCertificationItems];
  if (microchipType === 'verification') {
    const isRegistered = certificate.content?.isRegisteredInNationalDB !== false;
    if (isRegistered) {
      certificationItems.push('Se encuentra registrado en la base de datos registro nacional de mascota');
    } else {
      certificationItems.push('No se encuentra registrado en la base de datos registro nacional de mascota');
    }
  }
  
  return `
    ${generatePatientAndOwnerTables(patient)}

    <div class="microchip-section">
      <h3 style="color: #2D3748; font-size: 16px; margin: 20px 0 15px 0; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">
        III. INFORMACIÓN DEL MICROCHIP
      </h3>
      <div style="background: #F7F9FC; padding: 20px; border-radius: 8px; border-left: 5px solid #5FA98D; margin-bottom: 20px;">
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 30%;">Número de Microchip:</td>
            <td style="padding: 8px; font-size: 18px; font-weight: bold; color: #2D3748; background: white; border: 2px solid #5FA98D; border-radius: 4px;">
              ${patient.microchip || 'NO REGISTRADO'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Fecha de ${microchipType === 'verification' ? 'Verificación' : 'Implantación'}:</td>
            <td style="padding: 8px;">${certificate.issueDate ? formatDateToChilean(certificate.issueDate) : (certificate.issuedDate ? formatDateToChilean(certificate.issuedDate) : currentDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Sitio de Implantación:</td>
            <td style="padding: 8px;">Región dorsal del cuello (subcutáneo)</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Tipo de Microchip:</td>
            <td style="padding: 8px;">ISO 11784/11785 compatible (134.2 kHz)</td>
          </tr>
        </table>
      </div>
    </div>

    <div class="microchip-section">
      <h3 style="color: #2D3748; font-size: 16px; margin: 20px 0 15px 0; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">
        IV. CERTIFICACIÓN PROFESIONAL
      </h3>
      <div style="background: #F7F9FC; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 15px 0; line-height: 1.6;">
          El suscrito Médico Veterinario <strong>CERTIFICA</strong> que:
        </p>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
          ${certificationItems.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      
      ${certificate.observations ? `
        <div style="margin-top: 20px;">
          <h4 style="color: #2D3748; font-size: 14px; margin-bottom: 10px;">Observaciones:</h4>
          <p style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 4px; margin: 0;">
            ${certificate.observations}
          </p>
        </div>
      ` : ''}
    </div>

    <div style="margin-top: 30px; padding: 15px; background: #E6F7FF; border-radius: 8px; border-left: 5px solid #1890FF;">
      <h4 style="color: #1890FF; margin: 0 0 10px 0; font-size: 14px;">Información Importante:</h4>
      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #666;">
        Este microchip cumple con estándares ISO 11784/11785. Se recomienda verificar la legibilidad 
        del microchip anualmente. En caso de pérdida del animal, contactar inmediatamente al registro 
        nacional de mascotas con el número de microchip.
      </p>
    </div>
  `;
};

// Helper function to generate standardized patient and owner identification sections
const generatePatientAndOwnerTables = (patient: any) => {
  return `
    <div class="identification-section">
      <h3 style="color: #2D3748; font-size: 16px; margin: 20px 0 15px 0; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">
        I. IDENTIFICACIÓN DEL ANIMAL
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd;">
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold; width: 15%;">Nombre:</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd; width: 35%;">${patient.name}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold; width: 15%;">Especie:</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd; width: 35%;">${patient.species}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Raza:</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${patient.breed}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Sexo:</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${patient.sex}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Edad:</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${patient.age || 'No especificada'}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Peso:</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${patient.weight || 'No especificado'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Microchip:</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${patient.microchip || 'No tiene'}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Color/Señas:</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${patient.colorMarkings || 'No especificadas'}</td>
        </tr>
      </table>
    </div>

    <div class="identification-section">
      <h3 style="color: #2D3748; font-size: 16px; margin: 20px 0 15px 0; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">
        II. IDENTIFICACIÓN DEL PROPIETARIO
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd;">
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold; width: 15%;">Nombre:</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd; width: 35%;">${patient.tutorName || 'No especificado'}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold; width: 15%;">RUT:</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd; width: 35%;">${formatRut(patient.tutorRut || patient.ownerId) || 'No especificado'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Dirección:</td>
          <td colspan="3" style="padding: 8px 12px; border: 1px solid #ddd;">${[patient.tutorAddress, patient.tutorHouseNumber, patient.tutorComuna, patient.tutorRegion].filter(Boolean).join(', ') || 'No especificada'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Ciudad:</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${patient.tutorCity || patient.tutorComuna || 'No especificada'}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Teléfono:</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${patient.tutorPhone || 'No especificado'}</td>
        </tr>
      </table>
    </div>
  `;
};

// Helper function to determine vaccine display type from selectedDiseases array
const getVaccineDisplayType = (vaccination: any): string => {
  // If no selectedDiseases array, fall back to vaccineName
  if (!vaccination.selectedDiseases || !Array.isArray(vaccination.selectedDiseases) || vaccination.selectedDiseases.length === 0) {
    return vaccination.vaccineName || vaccination.name || 'Vacuna no especificada';
  }

  const diseases = vaccination.selectedDiseases.map((d: string) => d.toLowerCase());
  
  // Check for antirrabica (rabies) vaccine
  if (diseases.includes('rabia') || diseases.includes('antirrabica') || diseases.includes('rabies')) {
    // If it only contains rabies, it's an antirabica vaccine
    if (diseases.length === 1 || (diseases.length <= 2 && diseases.some((d: string) => d.includes('rabia') || d.includes('rabies')))) {
      return 'Antirrábica';
    }
  }

  // Check for octuple vaccine (8 diseases for dogs)
  const octupleCanineDiseases = ['distemper', 'adenovirus', 'parvovirus', 'parainfluenza', 'leptospira', 'coronavirus'];
  const hasOctupleCanine = octupleCanineDiseases.filter(disease => 
    diseases.some((d: string) => d.includes(disease.toLowerCase()))
  ).length >= 6;

  if (hasOctupleCanine) {
    return 'Óctuple';
  }

  // Check for sextuple vaccine (6 diseases for dogs)
  const sextupleCanineDiseases = ['distemper', 'adenovirus', 'parvovirus', 'parainfluenza'];
  const hasSextupleCanine = sextupleCanineDiseases.filter(disease => 
    diseases.some((d: string) => d.includes(disease.toLowerCase()))
  ).length >= 4;

  if (hasSextupleCanine) {
    return 'Séxtuple';
  }

  // Check for triple felina (3 diseases for cats)
  const tripleFelineDiseases = ['panleucopenia', 'rinotraqueitis', 'calicivirus'];
  const hasTripleFelina = tripleFelineDiseases.filter(disease => 
    diseases.some((d: string) => d.includes(disease.toLowerCase()))
  ).length >= 3;

  if (hasTripleFelina) {
    return 'Triple Felina';
  }

  // Check for leucemia felina
  if (diseases.some((d: string) => d.includes('leucemia') || d.includes('leukemia'))) {
    return 'Leucemia Felina';
  }

  // If we can't determine the type, fall back to vaccine name
  return vaccination.vaccineName || vaccination.name || 'Otra vacuna';
};

// Helper function to get vaccine data for specific disease
const getVaccineData = (vaccinations: any[], disease: string) => {
  const vaccine = vaccinations.find(v => 
    v.selectedDiseases?.includes(disease) || 
    v.name?.toLowerCase().includes(disease.toLowerCase()) ||
    (disease === 'antirrabica' && (v.name?.toLowerCase().includes('antirrábica') || v.name?.toLowerCase().includes('rabies')))
  );
  
  if (vaccine) {
    const typeMapping = {
      'viva_modificada': 'Viva modificada',
      'inactivada': 'Inactivada', 
      'mixta': 'Mixta'
    };
    
    return {
      name: getVaccineDisplayType(vaccine), // Use the new helper function
      type: typeMapping[vaccine.vaccineSubType] || vaccine.vaccineSubType || '',
      laboratory: vaccine.laboratory || vaccine.vaccineBrand || 'No especificado',
      serialNumber: vaccine.serialNumber || vaccine.batchNumber || '',
      applicationDate: vaccine.applicationDate ? new Date(vaccine.applicationDate).toLocaleDateString('es-CL') : '',
      validityDate: vaccine.validityDate ? new Date(vaccine.validityDate).toLocaleDateString('es-CL') : ''
    };
  }
  
  return {
    name: '',
    type: 'No especificado', 
    laboratory: 'No especificado',
    serialNumber: 'No especificado',
    applicationDate: '',
    validityDate: ''
  };
};

// Helper function to get deworming data for specific type
const getDeworming = (dewormings: any[], type: string) => {
  console.log(`🔍 getDeworming: Looking for type "${type}" in ${dewormings.length} records`);
  console.log('🔍 Available dewormings:', dewormings.map(d => ({ id: d.id, type: d.type, product: d.product })));
  
  // Sort by most recent application date first to get the latest deworming of each type
  const sortedDewormings = [...dewormings].sort((a: any, b: any) => {
    const dateA = new Date(a.applicationDate || a.date || a.createdAt || 0);
    const dateB = new Date(b.applicationDate || b.date || b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });
  
  const deworming = sortedDewormings.find(d => {
    const matches = d.type?.toLowerCase() === type ||
      (type === 'internal' && (d.type === 'interna' || d.type?.toLowerCase() === 'internal')) ||
      (type === 'external' && (d.type === 'externa' || d.type?.toLowerCase() === 'external'));
    console.log(`🔍 Checking deworming ${d.id}: type="${d.type}", matches=${matches}`);
    return matches;
  });
  
  if (deworming) {
    console.log(`✅ Found ${type} deworming:`, deworming);
    
    const applicationDate = deworming.applicationDate || deworming.date;
    
    // Safe date formatting to avoid UTC parsing issues for YYYY-MM-DD format
    let formattedDate = 'No especificada';
    if (applicationDate) {
      if (typeof applicationDate === 'string' && applicationDate.includes('-') && !applicationDate.includes('T')) {
        // For YYYY-MM-DD format, parse manually to avoid UTC issues
        const [year, month, day] = applicationDate.split('-');
        formattedDate = `${day}/${month}/${year}`;
      } else {
        // For full timestamp, use normal parsing
        const parsedDate = new Date(applicationDate);
        formattedDate = parsedDate.toLocaleDateString('es-CL');
      }
    }
    
    const result = {
      product: deworming.product || 'No especificado',
      laboratory: deworming.laboratory || 'No especificado',
      activeIngredient: deworming.activeIngredient || 'No especificado',
      batchNumber: deworming.batchNumber || deworming.batch || 'No especificado',
      applicationDate: formattedDate,
      applicationTime: deworming.applicationTime || '09:00'
    };
    
    console.log(`✅ Processed ${type} deworming result:`, result);
    return result;
  }
  
  console.log(`❌ No ${type} deworming found, returning empty values`);
  return {
    product: 'No aplicado',
    laboratory: '',
    activeIngredient: '',
    batchNumber: '',
    applicationDate: '',
    applicationTime: ''
  };
};

// Test function to verify SAG format works with mock data (development only)
const testSAGCertificateGeneration = () => {
  console.log('🧪 Testing SAG certificate generation with mock data...');
  
  const mockVaccinations = [
    {
      id: 'mock-vacc-1',
      name: 'Vacuna Múltiple Canina',
      vaccineName: 'Vacuna Múltiple Canina',
      laboratory: 'Laboratorio Veterinario',
      serialNumber: 'SN789012',
      applicationDate: '2024-01-15T10:00:00.000Z',
      validityDate: '2025-01-15T10:00:00.000Z',
      selectedDiseases: ['distemper', 'parvovirus', 'adenovirus'],
      vaccineType: 'viva_modificada'
    },
    {
      id: 'mock-vacc-2',
      name: 'Vacuna Antirrábica',
      vaccineName: 'Vacuna Antirrábica',
      laboratory: 'Laboratorio Nacional',
      serialNumber: 'SN456789',
      applicationDate: '2024-02-01T14:00:00.000Z',
      validityDate: '2027-02-01T14:00:00.000Z',
      selectedDiseases: ['antirrabica'],
      vaccineType: 'inactivada'
    }
  ];
  
  const mockDewormings = [
    {
      product: 'Drontal Plus',
      type: 'internal',
      laboratory: 'Bayer',
      activeIngredient: 'Praziquantel + Pyrantel',
      batchNumber: 'DT789',
      applicationDate: '2024-01-20',
      applicationTime: '14:30'
    },
    {
      product: 'Frontline',
      type: 'external',
      laboratory: 'Merial',
      activeIngredient: 'Fipronil',
      batchNumber: 'FL456',
      applicationDate: '2024-01-25',
      applicationTime: '10:15'
    }
  ];
  
  // Test getVaccineData function
  console.log('Testing getVaccineData function:');
  const distemperData = getVaccineData(mockVaccinations, 'distemper');
  console.log('Distemper vaccine data:', distemperData);
  
  const antirrábicaData = getVaccineData(mockVaccinations, 'antirrabica');
  console.log('Antirrábica vaccine data:', antirrábicaData);
  
  const nonExistentData = getVaccineData(mockVaccinations, 'coronavirus');
  console.log('Non-existent vaccine data:', nonExistentData);
  
  // Test getDeworming function
  console.log('Testing getDeworming function:');
  const internalDeworming = getDeworming(mockDewormings, 'internal');
  console.log('Internal deworming data:', internalDeworming);
  
  const externalDeworming = getDeworming(mockDewormings, 'external');
  console.log('External deworming data:', externalDeworming);
  
  console.log('✅ SAG certificate generation test completed!');
  
  return {
    vaccinations: mockVaccinations,
    dewormings: mockDewormings,
    testResults: {
      distemperData,
      antirrábicaData,
      internalDeworming,
      externalDeworming
    }
  };
};

// Complete end-to-end test function for SAG certificate flow
const testSAGCertificateEndToEnd = async () => {
  console.log('🧪 Starting complete SAG certificate end-to-end test...');
  
  // Mock patient data
  const mockPatient = {
    id: 'test-patient-123',
    name: 'Firulais',
    species: 'Canino',
    tutorName: 'Juan Pérez',
    tutorRut: '12345678-9'
  };
  
  // Mock certificate data
  const mockCertificate = {
    type: 'export',
    issuedDate: new Date().toISOString()
  };
  
  try {
    // Test the complete certificate generation flow
    console.log('1️⃣ Testing data fetching with mock routes...');
    const certificateContent = await generateExportCertificateContent(mockPatient, mockCertificate);
    
    console.log('2️⃣ Certificate content generated successfully');
    console.log('Certificate HTML content length:', certificateContent.length);
    
    // Extract key SAG elements from generated content
    const hasVaccinationTable = certificateContent.includes('1. Vacunación');
    const hasDewormingTable = certificateContent.includes('2. Desparasitación');
    const hasDistemperCheckbox = certificateContent.includes('Distemper');
    const hasParvovirus = certificateContent.includes('Parvovirus');
    const hasAntirabica = certificateContent.includes('Antirrábica');
    const hasVaccineTypeInfo = certificateContent.includes('Viva modificada') || certificateContent.includes('Inactivada');
    
    console.log('3️⃣ SAG Format Validation Results:');
    console.log('✅ Vaccination table (1. Vacunación):', hasVaccinationTable);
    console.log('✅ Deworming table (2. Desparasitación):', hasDewormingTable);
    console.log('✅ Disease checkboxes present:', hasDistemperCheckbox && hasParvovirus);
    console.log('✅ Antirabica checkbox:', hasAntirabica);
    console.log('✅ Vaccine type information:', hasVaccineTypeInfo);
    
    // Generate test results summary
    const testResults = {
      success: true,
      mockDataFetched: true,
      sagFormatCorrect: hasVaccinationTable && hasDewormingTable,
      diseaseCheckboxes: hasDistemperCheckbox && hasParvovirus,
      vaccineTypeMapping: hasVaccineTypeInfo,
      certificateLength: certificateContent.length,
      timestamp: new Date().toISOString()
    };
    
    console.log('4️⃣ Final Test Results:', testResults);
    
    if (testResults.sagFormatCorrect && testResults.diseaseCheckboxes) {
      console.log('🎉 SAG Certificate End-to-End Test PASSED! ✅');
    } else {
      console.log('❌ SAG Certificate End-to-End Test FAILED!');
    }
    
    return testResults;
    
  } catch (error) {
    console.error('❌ SAG Certificate End-to-End Test FAILED with error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Debug function specifically for deworming data issues
const debugDewormingData = async () => {
  console.log('🐛 DEBUG: Investigating deworming data issues...');
  
  const testPatientId = '01'; // Using the patient ID from logs
  const isDevelopment = import.meta.env?.DEV || process.env.NODE_ENV === 'development';
  
  const dewormingsUrl = isDevelopment 
    ? `/api/dev/mock/dewormings/${testPatientId}`
    : `/api/dewormings/firebase/pet/${testPatientId}`;
  
  try {
    console.log(`🔍 Fetching dewormings from: ${dewormingsUrl}`);
    const response = await fetch(dewormingsUrl);
    
    if (response.ok) {
      const dewormingData = await response.json();
      console.log('📦 Raw deworming data:', dewormingData);
      console.log('📦 Number of deworming records:', dewormingData.length);
      
      if (dewormingData.length > 0) {
        console.log('📦 First deworming record structure:', Object.keys(dewormingData[0]));
        
        // Test processing with getDeworming function
        const processedData = dewormingData.map((dew: any) => ({
          product: dew.product || 'Desparasitante',
          activeIngredient: dew.activeIngredient || 'No especificado',
          applicationDate: dew.applicationDate,
          laboratory: dew.laboratory || 'No especificado',
          type: dew.type
        }));
        
        console.log('🔧 Processed data:', processedData);
        
        // Test getDeworming function specifically
        console.log('🎯 Testing getDeworming function...');
        const internalResult = getDeworming(dewormingData, 'internal');
        const externalResult = getDeworming(dewormingData, 'external');
        
        console.log('🔍 getDeworming(data, "internal"):', internalResult);
        console.log('🔍 getDeworming(data, "external"):', externalResult);
        
        // Check what types are actually present
        const typesPresent = dewormingData.map((d: any) => d.type);
        console.log('📋 Types present in data:', typesPresent);
        
      } else {
        console.log('❌ No deworming records found');
      }
      
    } else {
      console.error('❌ Failed to fetch dewormings:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error debugging deworming data:', error);
  }
};

// Export test functions for development use
if (import.meta.env?.DEV) {
  (window as any).testSAGCertificate = testSAGCertificateGeneration;
  (window as any).testSAGCertificateComplete = testSAGCertificateEndToEnd;
  (window as any).debugDewormingData = debugDewormingData;
  console.log('🔧 SAG Certificate test functions available:');
  console.log('- window.testSAGCertificate() - Test helper functions');
  console.log('- window.testSAGCertificateComplete() - Complete end-to-end test');
  console.log('- window.debugDewormingData() - Debug deworming data processing');
}

// Function to generate export certificate content with SAG format
const generateExportCertificateContent = async (patient: any, certificate: any) => {
  // Fetch vaccination and deworming data
  let vaccinations = [];
  let dewormings = [];
  
  try {
    // Always use real Firebase data for accurate SAG certificates
    const vaccinationsUrl = `/api/vaccinations/firebase/pet/${patient.id}`;
    
    console.log(`🔍 Fetching vaccinations from: ${vaccinationsUrl}`);
    const vaccinationResponse = await fetch(vaccinationsUrl);
    if (vaccinationResponse.ok) {
      const vaccinationData = await vaccinationResponse.json();
      vaccinations = vaccinationData;
      console.log('✅ Vaccinations fetched for certificate:', vaccinations);
    } else {
      console.error('❌ Failed to fetch vaccinations:', vaccinationResponse.status);
    }
  } catch (error) {
    console.error('Error fetching vaccinations for export certificate:', error);
  }

  try {
    // Always use real Firebase data for accurate SAG certificates
    const dewormingsUrl = `/api/dewormings/firebase/pet/${patient.id}`;
      
    console.log(`🔍 Fetching dewormings from: ${dewormingsUrl}`);
    const dewormingResponse = await fetch(dewormingsUrl);
    if (dewormingResponse.ok) {
      const dewormingData = await dewormingResponse.json();
      dewormings = dewormingData; // Preserve all fields including 'type' for getDeworming function
      console.log('✅ Dewormings fetched for certificate:', dewormings);
    }
  } catch (error) {
    console.error('Error fetching dewormings for export certificate:', error);
  }
  return `
    ${generatePatientAndOwnerTables(patient)}

    <div class="export-section">
      <h3>III. ESTADO SANITARIO</h3>
      <p>El suscrito Médico Veterinario CERTIFICA que el animal descrito:</p>
      <ul class="certification-list">
        <li>Ha sido examinado clínicamente y se encuentra en buen estado de salud</li>
        <li>No presenta síntomas ni signos de enfermedades transmisibles</li>
        <li>Procede de un área libre de enfermedades cuarentenarias</li>
        <li>Cumple con los requisitos sanitarios para exportación</li>
        <li>Ha sido vacunado según el esquema adjunto (Anexo)</li>
        <li>Se encuentra apto para el transporte internacional</li>
      </ul>
    </div>

    <div class="export-section">
      <h3>1. Vacunación</h3>
      <table class="vaccine-table">
        <thead>
          <tr>
            <th style="width: 120px;"></th>
            <th>Nombre vacuna</th>
            <th>Tipo vacuna**</th>
            <th>Laboratorio</th>
            <th>N° de serie vacuna</th>
            <th>Fecha vacunación</th>
            <th>Vigencia vacuna</th>
          </tr>
        </thead>
        <tbody>
          ${patient.species?.toLowerCase().includes('canin') ? `
            <tr>
              <td><input type="checkbox" ${vaccinations.some(v => v.selectedDiseases?.includes('distemper') || v.name?.toLowerCase().includes('distemper')) ? 'checked' : ''}> Distemper</td>
              <td>${getVaccineData(vaccinations, 'distemper').name}</td>
              <td>${getVaccineData(vaccinations, 'distemper').type}</td>
              <td>${getVaccineData(vaccinations, 'distemper').laboratory}</td>
              <td>${getVaccineData(vaccinations, 'distemper').serialNumber}</td>
              <td>${getVaccineData(vaccinations, 'distemper').applicationDate}</td>
              <td>${getVaccineData(vaccinations, 'distemper').validityDate}</td>
            </tr>
            <tr>
              <td><input type="checkbox" ${vaccinations.some(v => v.selectedDiseases?.includes('adenovirus') || v.name?.toLowerCase().includes('adenovirus')) ? 'checked' : ''}> Adenovirus (Hepatitis)</td>
              <td>${getVaccineData(vaccinations, 'adenovirus').name}</td>
              <td>${getVaccineData(vaccinations, 'adenovirus').type}</td>
              <td>${getVaccineData(vaccinations, 'adenovirus').laboratory}</td>
              <td>${getVaccineData(vaccinations, 'adenovirus').serialNumber}</td>
              <td>${getVaccineData(vaccinations, 'adenovirus').applicationDate}</td>
              <td>${getVaccineData(vaccinations, 'adenovirus').validityDate}</td>
            </tr>
            <tr>
              <td><input type="checkbox" ${vaccinations.some(v => v.selectedDiseases?.includes('leptospira') || v.name?.toLowerCase().includes('leptospira')) ? 'checked' : ''}> Leptospira (L. canicola e icterohaemorrhagiae)</td>
              <td>${getVaccineData(vaccinations, 'leptospira').name}</td>
              <td>${getVaccineData(vaccinations, 'leptospira').type}</td>
              <td>${getVaccineData(vaccinations, 'leptospira').laboratory}</td>
              <td>${getVaccineData(vaccinations, 'leptospira').serialNumber}</td>
              <td>${getVaccineData(vaccinations, 'leptospira').applicationDate}</td>
              <td>${getVaccineData(vaccinations, 'leptospira').validityDate}</td>
            </tr>
            <tr>
              <td><input type="checkbox" ${vaccinations.some(v => v.selectedDiseases?.includes('parvovirus') || v.name?.toLowerCase().includes('parvovirus')) ? 'checked' : ''}> Parvovirus</td>
              <td>${getVaccineData(vaccinations, 'parvovirus').name}</td>
              <td>${getVaccineData(vaccinations, 'parvovirus').type}</td>
              <td>${getVaccineData(vaccinations, 'parvovirus').laboratory}</td>
              <td>${getVaccineData(vaccinations, 'parvovirus').serialNumber}</td>
              <td>${getVaccineData(vaccinations, 'parvovirus').applicationDate}</td>
              <td>${getVaccineData(vaccinations, 'parvovirus').validityDate}</td>
            </tr>
            <tr>
              <td><input type="checkbox" ${vaccinations.some(v => v.selectedDiseases?.includes('parainfluenza') || v.name?.toLowerCase().includes('parainfluenza')) ? 'checked' : ''}> Parainfluenza</td>
              <td>${getVaccineData(vaccinations, 'parainfluenza').name}</td>
              <td>${getVaccineData(vaccinations, 'parainfluenza').type}</td>
              <td>${getVaccineData(vaccinations, 'parainfluenza').laboratory}</td>
              <td>${getVaccineData(vaccinations, 'parainfluenza').serialNumber}</td>
              <td>${getVaccineData(vaccinations, 'parainfluenza').applicationDate}</td>
              <td>${getVaccineData(vaccinations, 'parainfluenza').validityDate}</td>
            </tr>
            <tr>
              <td><input type="checkbox" ${vaccinations.some(v => v.selectedDiseases?.includes('coronavirus') || v.name?.toLowerCase().includes('coronavirus')) ? 'checked' : ''}> Coronavirus</td>
              <td>${getVaccineData(vaccinations, 'coronavirus').name}</td>
              <td>${getVaccineData(vaccinations, 'coronavirus').type}</td>
              <td>${getVaccineData(vaccinations, 'coronavirus').laboratory}</td>
              <td>${getVaccineData(vaccinations, 'coronavirus').serialNumber}</td>
              <td>${getVaccineData(vaccinations, 'coronavirus').applicationDate}</td>
              <td>${getVaccineData(vaccinations, 'coronavirus').validityDate}</td>
            </tr>
            <tr>
              <td><input type="checkbox" ${vaccinations.some(v => v.selectedDiseases?.includes('antirrabica') || v.name?.toLowerCase().includes('antirrábica') || v.name?.toLowerCase().includes('rabies')) ? 'checked' : ''}> Antirrábica</td>
              <td>${getVaccineData(vaccinations, 'antirrabica').name}</td>
              <td>${getVaccineData(vaccinations, 'antirrabica').type}</td>
              <td>${getVaccineData(vaccinations, 'antirrabica').laboratory}</td>
              <td>${getVaccineData(vaccinations, 'antirrabica').serialNumber}</td>
              <td>${getVaccineData(vaccinations, 'antirrabica').applicationDate}</td>
              <td>${getVaccineData(vaccinations, 'antirrabica').validityDate}</td>
            </tr>
          ` : patient.species?.toLowerCase().includes('felin') ? `
            <tr>
              <td><input type="checkbox" ${vaccinations.some(v => v.selectedDiseases?.includes('panleucopenia') || v.name?.toLowerCase().includes('panleucopenia')) ? 'checked' : ''}> Panleucopenia</td>
              <td>${getVaccineData(vaccinations, 'panleucopenia').name}</td>
              <td>${getVaccineData(vaccinations, 'panleucopenia').type}</td>
              <td>${getVaccineData(vaccinations, 'panleucopenia').laboratory}</td>
              <td>${getVaccineData(vaccinations, 'panleucopenia').serialNumber}</td>
              <td>${getVaccineData(vaccinations, 'panleucopenia').applicationDate}</td>
              <td>${getVaccineData(vaccinations, 'panleucopenia').validityDate}</td>
            </tr>
            <tr>
              <td><input type="checkbox" ${vaccinations.some(v => v.selectedDiseases?.includes('rinotraqueitis') || v.name?.toLowerCase().includes('rinotraqueitis')) ? 'checked' : ''}> Rinotraqueitis</td>
              <td>${getVaccineData(vaccinations, 'rinotraqueitis').name}</td>
              <td>${getVaccineData(vaccinations, 'rinotraqueitis').type}</td>
              <td>${getVaccineData(vaccinations, 'rinotraqueitis').laboratory}</td>
              <td>${getVaccineData(vaccinations, 'rinotraqueitis').serialNumber}</td>
              <td>${getVaccineData(vaccinations, 'rinotraqueitis').applicationDate}</td>
              <td>${getVaccineData(vaccinations, 'rinotraqueitis').validityDate}</td>
            </tr>
            <tr>
              <td><input type="checkbox" ${vaccinations.some(v => v.selectedDiseases?.includes('calicivirus') || v.name?.toLowerCase().includes('calicivirus')) ? 'checked' : ''}> Calicivirus</td>
              <td>${getVaccineData(vaccinations, 'calicivirus').name}</td>
              <td>${getVaccineData(vaccinations, 'calicivirus').type}</td>
              <td>${getVaccineData(vaccinations, 'calicivirus').laboratory}</td>
              <td>${getVaccineData(vaccinations, 'calicivirus').serialNumber}</td>
              <td>${getVaccineData(vaccinations, 'calicivirus').applicationDate}</td>
              <td>${getVaccineData(vaccinations, 'calicivirus').validityDate}</td>
            </tr>
            <tr>
              <td><input type="checkbox" ${vaccinations.some(v => v.selectedDiseases?.includes('antirrabica') || v.name?.toLowerCase().includes('antirrábica') || v.name?.toLowerCase().includes('rabies')) ? 'checked' : ''}> Antirrábica</td>
              <td>${getVaccineData(vaccinations, 'antirrabica').name}</td>
              <td>${getVaccineData(vaccinations, 'antirrabica').type}</td>
              <td>${getVaccineData(vaccinations, 'antirrabica').laboratory}</td>
              <td>${getVaccineData(vaccinations, 'antirrabica').serialNumber}</td>
              <td>${getVaccineData(vaccinations, 'antirrabica').applicationDate}</td>
              <td>${getVaccineData(vaccinations, 'antirrabica').validityDate}</td>
            </tr>
          ` : ''}
        </tbody>
      </table>
      <div style="margin-top: 10px; font-size: 12px;">
        <p>• Debe estar respaldada por el certificado original de vacunación antirrábica.</p>
        <p>** Tipo: vacuna viva modificada, vacuna inactivada o vacuna mixta.</p>
      </div>
    </div>

    <div class="export-section">
      <h3>2. Desparasitación</h3>
      <table class="vaccine-table">
        <thead>
          <tr>
            <th style="width: 80px;"></th>
            <th>Nombre Producto</th>
            <th>Laboratorio</th>
            <th>Principio activo</th>
            <th>Lote</th>
            <th>Fecha desparasitación</th>
            <th>Hora desparasitación</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Interna</td>
            <td>${getDeworming(dewormings, 'internal').product}</td>
            <td>${getDeworming(dewormings, 'internal').laboratory}</td>
            <td>${getDeworming(dewormings, 'internal').activeIngredient}</td>
            <td>${getDeworming(dewormings, 'internal').batchNumber}</td>
            <td>${getDeworming(dewormings, 'internal').applicationDate}</td>
            <td>${getDeworming(dewormings, 'internal').applicationTime}</td>
          </tr>
          <tr>
            <td>Externa</td>
            <td>${getDeworming(dewormings, 'external').product}</td>
            <td>${getDeworming(dewormings, 'external').laboratory}</td>
            <td>${getDeworming(dewormings, 'external').activeIngredient}</td>
            <td>${getDeworming(dewormings, 'external').batchNumber}</td>
            <td>${getDeworming(dewormings, 'external').applicationDate}</td>
            <td>${getDeworming(dewormings, 'external').applicationTime}</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 10px; font-size: 12px;">
        <p>Si el destino final del animal es Finlandia, Reino Unido, Irlanda o Malta se deberá aplicar un tratamiento antiparasitario efectivo contra el <em>Echinococcus multilocularis</em>.</p>
      </div>
    </div>

    <div class="export-section">
      <h3>VI. INFORMACIÓN ADICIONAL</h3>
      <p><strong>Destino:</strong> ${certificate.content?.destination || certificate.purpose || 'Por definir'}</p>
      <p><strong>Observaciones:</strong> ${certificate.content?.exportObservations || certificate.observations || 'Ninguna'}</p>
      <p><strong>Fecha de Examen:</strong> ${certificate.content?.examDate ? formatDateToChilean(certificate.content.examDate) : formatDateToChilean(certificate.issueDate)}</p>
      <p><strong>Validez:</strong> ${certificate.content?.validityDays || '10'} días desde la fecha de emisión</p>
      
      <div style="margin-top: 25px; padding: 15px; background: #F7F9FC; border-radius: 8px; border-left: 5px solid #A3CBB2;">
        <h4 style="color: #2D3748; margin: 0 0 10px 0; font-size: 14px;">Declaración Oficial:</h4>
        <p style="margin: 0; font-size: 13px; line-height: 1.5;">
          El presente certificado se emite de acuerdo con los requisitos sanitarios vigentes del SAG 
          y cumple con las normativas internacionales para el transporte de animales de compañía. 
          La información contenida es verídica y se basa en el examen clínico realizado.
        </p>
      </div>
    </div>
  `;
};

// Function to generate vaccination history content with status evaluation
const generateVaccinationHistoryContent = async (patient: any, certificate: any) => {
  try {
    // Fetch vaccination history from API
    const response = await fetch(`/api/vaccinations/firebase/pet/${patient.id}`);
    const vaccinations = response.ok ? await response.json() : [];
    
    const currentDate = new Date();
    let vaccinationStatus = 'NO VIGENTE';
    let statusColor = '#dc2626'; // red
    
    if (vaccinations.length > 0) {
      // Check if any vaccination is still valid
      const validVaccinations = vaccinations.filter((vacc: any) => {
        if (vacc.nextDueDate) {
          // Safe date parsing for comparison
          let nextDate;
          if (typeof vacc.nextDueDate === 'string' && vacc.nextDueDate.includes('-') && !vacc.nextDueDate.includes('T')) {
            const [year, month, day] = vacc.nextDueDate.split('-');
            nextDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            nextDate = new Date(vacc.nextDueDate);
          }
          return nextDate > currentDate;
        }
        return false;
      });
      
      if (validVaccinations.length > 0) {
        vaccinationStatus = 'VIGENTE';
        statusColor = '#16a34a'; // green
      }
    }
    
    let vaccinationTable = '';
    if (vaccinations.length > 0) {
      vaccinationTable = `
        <table class="vaccine-table" style="margin-top: 20px;">
          <thead>
            <tr>
              <th>Vacuna</th>
              <th>Laboratorio</th>
              <th>Fecha Aplicación</th>
              <th>Próxima Vacuna</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${vaccinations.map((vacc: any) => {
              // Safe date parsing for status check
              let nextDateParsed = null;
              if (vacc.nextDueDate) {
                if (typeof vacc.nextDueDate === 'string' && vacc.nextDueDate.includes('-') && !vacc.nextDueDate.includes('T')) {
                  const [year, month, day] = vacc.nextDueDate.split('-');
                  nextDateParsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } else {
                  nextDateParsed = new Date(vacc.nextDueDate);
                }
              }
              
              const isValid = nextDateParsed && nextDateParsed > currentDate;
              const status = isValid ? 'Vigente' : 'Vencida';
              const statusStyle = isValid ? 'color: #16a34a; font-weight: bold;' : 'color: #dc2626; font-weight: bold;';
              
              // Safe date formatting for display
              let formattedApplicationDate = 'No especificada';
              if (vacc.applicationDate) {
                if (typeof vacc.applicationDate === 'string' && vacc.applicationDate.includes('-') && !vacc.applicationDate.includes('T')) {
                  const [year, month, day] = vacc.applicationDate.split('-');
                  formattedApplicationDate = `${day}/${month}/${year}`;
                } else {
                  const parsedDate = new Date(vacc.applicationDate);
                  formattedApplicationDate = parsedDate.toLocaleDateString('es-CL');
                }
              }
              
              let formattedNextDate = 'No programada';
              if (vacc.nextDueDate) {
                if (typeof vacc.nextDueDate === 'string' && vacc.nextDueDate.includes('-') && !vacc.nextDueDate.includes('T')) {
                  const [year, month, day] = vacc.nextDueDate.split('-');
                  formattedNextDate = `${day}/${month}/${year}`;
                } else {
                  const parsedDate = new Date(vacc.nextDueDate);
                  formattedNextDate = parsedDate.toLocaleDateString('es-CL');
                }
              }
              
              // Use the shared helper function to determine vaccine display type
              const vaccineDisplay = getVaccineDisplayType(vacc);

              return `
                <tr>
                  <td>${vaccineDisplay}</td>
                  <td>${vacc.laboratory || 'No especificado'}</td>
                  <td>${formattedApplicationDate}</td>
                  <td>${formattedNextDate}</td>
                  <td style="${statusStyle}">${status}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else {
      vaccinationTable = `
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; margin-top: 20px;">
          <p style="color: #6c757d; margin: 0;">No se encontraron registros de vacunación para este paciente</p>
        </div>
      `;
    }
    
    return `
      ${generatePatientAndOwnerTables(patient)}
      
      <div style="margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #2D3748; font-size: 16px; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">III. ESTADO DE VACUNACIÓN</h3>
          <span style="background: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
            ${vaccinationStatus}
          </span>
        </div>
        
        <p>Certifico que el animal descrito cuenta con el siguiente historial de vacunación:</p>
        <p><strong>Propósito:</strong> ${certificate.purpose || 'Certificación de vacunas'}</p>
        
        ${vaccinationTable}
        
        <div style="margin-top: 20px; padding: 15px; background: #f7f9fc; border-left: 4px solid #A3CBB2; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #2D3748;">
            <strong>Evaluación Profesional:</strong> 
            ${vaccinationStatus === 'VIGENTE' 
              ? 'El animal presenta un estado de vacunación adecuado y vigente según el protocolo establecido.' 
              : 'Se recomienda actualizar el esquema de vacunación según el protocolo correspondiente a la especie y edad del animal.'
            }
          </p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error fetching vaccination history:', error);
    return `
      ${generatePatientAndOwnerTables(patient)}
      
      <div style="margin-top: 20px;">
        <h3 style="color: #2D3748; font-size: 16px; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">III. ESTADO DE VACUNACIÓN</h3>
        <p>Certifico que el animal descrito cuenta con el esquema de vacunación apropiado para su especie y edad.</p>
        <p><strong>Propósito:</strong> ${certificate.purpose || 'Certificación de vacunas'}</p>
        <p style="color: #dc2626; font-style: italic;">Nota: No se pudo recuperar el historial completo de vacunación.</p>
      </div>
    `;
  }
};

// Function to generate deworming history content with status evaluation
const generateDewormingHistoryContent = async (patient: any, certificate: any) => {
  try {
    // Fetch deworming history from API
    const response = await fetch(`/api/dewormings/firebase/pet/${patient.id}`);
    const dewormings = response.ok ? await response.json() : [];
    
    const currentDate = new Date();
    let dewormingStatus = 'NO VIGENTE';
    let statusColor = '#dc2626'; // red
    
    if (dewormings.length > 0) {
      // Check if any deworming is still valid (within last 3-6 months)
      const validDewormings = dewormings.filter((dew: any) => {
        if (dew.applicationDate) {
          const appDate = new Date(dew.applicationDate);
          const monthsDiff = (currentDate.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
          return monthsDiff <= 6; // Consider valid if within last 6 months
        }
        return false;
      });
      
      if (validDewormings.length > 0) {
        dewormingStatus = 'VIGENTE';
        statusColor = '#16a34a'; // green
      }
    }
    
    let dewormingTable = '';
    if (dewormings.length > 0) {
      dewormingTable = `
        <table class="vaccine-table" style="margin-top: 20px;">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Principio Activo</th>
              <th>Laboratorio</th>
              <th>Fecha Aplicación</th>
              <th>Duración/Frecuencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${dewormings.map((dew: any) => {
              // Safe date parsing to avoid UTC issues
              let parsedDate = null;
              if (dew.applicationDate) {
                if (typeof dew.applicationDate === 'string' && dew.applicationDate.includes('-') && !dew.applicationDate.includes('T')) {
                  // For YYYY-MM-DD format, create date locally
                  const [year, month, day] = dew.applicationDate.split('-');
                  parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } else {
                  parsedDate = new Date(dew.applicationDate);
                }
              }
              
              const monthsDiff = parsedDate ? (currentDate.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24 * 30) : 999;
              const isValid = monthsDiff <= 6;
              const status = isValid ? 'Vigente' : 'Requiere renovación';
              const statusStyle = isValid ? 'color: #16a34a; font-weight: bold;' : 'color: #dc2626; font-weight: bold;';
              
              // Format date and time safely
              let formattedDate = 'No especificada';
              if (parsedDate) {
                formattedDate = parsedDate.toLocaleDateString('es-CL');
              } else if (dew.applicationDate && typeof dew.applicationDate === 'string' && dew.applicationDate.includes('-')) {
                const [year, month, day] = dew.applicationDate.split('-');
                formattedDate = `${day}/${month}/${year}`;
              }
              
              const applicationTime = dew.applicationTime || '09:00';
              const dateTimeDisplay = formattedDate !== 'No especificada' ? `${formattedDate} - ${applicationTime}` : formattedDate;
              
              // Calculate frequency/duration info
              let frequencyInfo = 'No especificada';
              if (dew.duration) {
                const durationMap: { [key: string]: string } = {
                  '1-month': 'Duración: 1 mes (antiparasitarios externos)',
                  '3-months': 'Duración: 3 meses (desparasitación interna estándar)',
                  '4-months': 'Duración: 4 meses (desparasitación interna extendida)',
                  '6-months': 'Duración: 6 meses (según criterio médico)',
                  'custom': 'Duración personalizada (ver observaciones)'
                };
                frequencyInfo = durationMap[dew.duration] || `Duración: ${dew.duration}`;
              } else if (dew.type === 'internal') {
                frequencyInfo = 'Desparasitación interna - 3-4 meses (recomendación estándar)';
              } else if (dew.type === 'external') {
                frequencyInfo = 'Desparasitación externa - mensual (recomendación estándar)';
              }
              
              return `
                <tr>
                  <td>${dew.product || 'No especificado'}</td>
                  <td>${dew.activeIngredient || 'No especificado'}</td>
                  <td>${dew.laboratory || 'No especificado'}</td>
                  <td>${dateTimeDisplay}</td>
                  <td style="font-size: 12px;">${frequencyInfo}</td>
                  <td style="${statusStyle}">${status}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else {
      dewormingTable = `
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; margin-top: 20px;">
          <p style="color: #6c757d; margin: 0;">No se encontraron registros de desparasitación para este paciente</p>
        </div>
      `;
    }
    
    return `
      ${generatePatientAndOwnerTables(patient)}
      
      <div style="margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #2D3748; font-size: 16px; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">III. ESTADO DE DESPARASITACIÓN</h3>
          <span style="background: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
            ${dewormingStatus}
          </span>
        </div>
        
        <p>Certifico que el animal descrito cuenta con el siguiente historial de desparasitación:</p>
        <p><strong>Propósito:</strong> ${certificate.purpose || 'Certificación de desparasitación'}</p>
        
        ${dewormingTable}
        
        <div style="margin-top: 20px; padding: 15px; background: #f7f9fc; border-left: 4px solid #A3CBB2; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #2D3748;">
            <strong>Evaluación Profesional:</strong> 
            ${dewormingStatus === 'VIGENTE' 
              ? 'El animal presenta un estado de desparasitación adecuado según el protocolo establecido.' 
              : 'Se recomienda aplicar desparasitación según el protocolo correspondiente a la especie, edad y condiciones del animal.'
            }
          </p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error fetching deworming history:', error);
    return `
      ${generatePatientAndOwnerTables(patient)}
      
      <div style="margin-top: 20px;">
        <h3 style="color: #2D3748; font-size: 16px; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">III. ESTADO DE DESPARASITACIÓN</h3>
        <p>Certifico que el animal descrito cuenta con el esquema de desparasitación apropiado para su especie y edad.</p>
        <p><strong>Propósito:</strong> ${certificate.purpose || 'Certificación de desparasitación'}</p>
        <p style="color: #dc2626; font-style: italic;">Nota: No se pudo recuperar el historial completo de desparasitación.</p>
      </div>
    `;
  }
};

export const generateCertificatePDF = async (patient: any, certificate: any, veterinarian: any) => {
  const currentDate = new Date().toLocaleDateString('es-CL');
  
  let certificateTitle = '';
  let certificateContent = '';
  
  switch (certificate.type || certificate.certificateType) {
    case 'health':
      certificateTitle = 'CERTIFICADO DE SALUD ANIMAL';
      certificateContent = `
        ${generatePatientAndOwnerTables(patient)}
        
        <div style="margin-top: 20px;">
          <h3 style="color: #2D3748; font-size: 16px; margin: 20px 0 15px 0; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">
            III. CERTIFICACIÓN MÉDICA
          </h3>
          <p>La suscrita, Médica Veterinaria, certifica que el animal descrito a continuación:</p>
          <ul>
            <li>Se encuentra en buen estado de salud general</li>
            <li>No presenta signos clínicos de enfermedades transmisibles</li>
            <li>Se emite el certificado para el propósito que tutor convenga</li>
          </ul>
          ${certificate.observations ? `
            <div style="margin-top: 20px; padding: 15px; background: #f7f9fc; border-left: 4px solid #5FA98D; border-radius: 4px;">
              <h4 style="color: #2D3748; margin: 0 0 10px 0; font-size: 14px;">Observaciones:</h4>
              <p style="margin: 0; font-size: 14px; line-height: 1.5;">${certificate.observations}</p>
            </div>
          ` : ''}
        </div>
      `;
      break;
    case 'vaccination':
      certificateTitle = 'CERTIFICADO DE VACUNACIÓN';
      certificateContent = await generateVaccinationHistoryContent(patient, certificate);
      break;
    case 'deworming':
      certificateTitle = 'CERTIFICADO DE DESPARASITACIÓN';
      certificateContent = await generateDewormingHistoryContent(patient, certificate);
      break;
    case 'export':
      certificateTitle = 'CERTIFICADO SANITARIO DE EXPORTACIÓN';
      certificateContent = await generateExportCertificateContent(patient, certificate);
      break;
    case 'microchip':
      const microchipType = certificate.microchipType || certificate.content?.microchipType || 'implantation';
      certificateTitle = microchipType === 'verification' ? 'CERTIFICADO DE VERIFICACIÓN DE MICROCHIP' : 'CERTIFICADO DE IMPLANTACIÓN DE MICROCHIP';
      certificateContent = generateMicrochipCertificateContent(patient, certificate);
      break;
    case 'sterilization':
    case 'reproductive_status':
      certificateTitle = 'CERTIFICADO DE ESTADO REPRODUCTIVO';
      const reproductiveStatus = patient.reproductiveStatus || 'No especificado';
      let reproductiveText = '';
      
      if (reproductiveStatus.toLowerCase().includes('castrado') || reproductiveStatus.toLowerCase().includes('esterilizado')) {
        reproductiveText = `Certifico que el animal descrito se encuentra <strong>${reproductiveStatus.toLowerCase()}</strong>.`;
      } else if (reproductiveStatus.toLowerCase().includes('entero') || reproductiveStatus.toLowerCase().includes('intacto')) {
        reproductiveText = `Certifico que el animal descrito se encuentra <strong>intacto</strong>.`;
      } else {
        reproductiveText = `Certifico que el animal descrito se encuentra <strong>${reproductiveStatus.toLowerCase()}</strong>.`;
      }
      
      certificateContent = `
        ${generatePatientAndOwnerTables(patient)}
        
        <div style="margin-top: 20px;">
          <h3 style="color: #2D3748; font-size: 16px; margin: 20px 0 15px 0; border-bottom: 2px solid #5FA98D; padding-bottom: 5px;">
            III. ESTADO REPRODUCTIVO
          </h3>
          <p style="margin: 15px 0; line-height: 1.6;">El suscrito Médico Veterinario CERTIFICA que:</p>
          <div style="margin: 20px 0; padding: 15px; border: 1px solid #5FA98D; border-radius: 5px; background-color: #F8F9FA;">
            <p style="margin: 0; font-weight: bold; color: #2D3748;">${reproductiveText}</p>
          </div>
          ${certificate.content?.observations ? `
            <div style="margin-top: 20px; padding: 15px; border: 1px solid #E2E8F0; border-radius: 5px; background-color: #F8F9FA;">
              <h4 style="color: #2D3748; margin: 0 0 10px 0;">Observaciones:</h4>
              <p style="margin: 0; color: #4A5568;">${certificate.content.observations}</p>
            </div>
          ` : ''}
        </div>
      `;
      break;
    default:
      certificateTitle = 'CERTIFICADO VETERINARIO';
      certificateContent = `
        <p>Certifico la condición sanitaria del animal descrito.</p>
        <p><strong>Propósito:</strong> ${certificate.purpose || 'General'}</p>
      `;
  }

  const certificateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${certificateTitle}</title>
      <style>
        body { 
          font-family: 'Inter', 'Lato', Arial, sans-serif; 
          margin: 30px; 
          line-height: 1.5;
          color: #333;
          background-color: #F9F5EF;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          max-width: 900px;
          margin: 0 auto;
        }
        .header { 
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 3px solid #A3CBB2; 
          padding-bottom: 25px; 
          margin-bottom: 30px;
          gap: 25px;
        }
        .logo-section {
          flex-shrink: 0;
        }
        .clinic-logo {
          width: 120px;
          height: 120px;
          object-fit: contain;
          border-radius: 50%;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .header-info {
          line-height: 1.3;
        }
        .clinic-name {
          font-size: 42px;
          font-weight: bold;
          margin: 0 0 8px 0;
          line-height: 1.1;
        }
        .clinic-name .ale {
          color: #5FA98D;
        }
        .clinic-name .veterinaria {
          color: #333;
        }
        .logo { 
          background: linear-gradient(135deg, #A3CBB2, #7FB3C3);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-family: 'Playfair Display', serif;
          font-size: 28px; 
          font-weight: bold; 
          letter-spacing: 2px;
          margin-bottom: 15px;
        }
        .vet-name {
          font-size: 24px;
          color: #5FA98D;
          margin: 0 0 5px 0;
          font-weight: 600;
        }
        .vet-credentials {
          color: #9B59B6;
          font-size: 16px;
          margin: 0;
          font-weight: 500;
        }
        .fear-free-badge {
          background: linear-gradient(135deg, #A3CBB2, #7FB3C3);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: bold;
          display: inline-block;
          margin: 8px 0;
        }
        .contact-info {
          font-size: 12px;
          color: #666;
          margin-top: 10px;
        }
        .vet-info { 
          text-align: center; 
          margin-bottom: 25px;
        }
        .patient-info { 
          background: linear-gradient(135deg, #F7F9FC, #EDF2F7); 
          padding: 20px; 
          border-radius: 12px; 
          margin-bottom: 25px;
          border-left: 5px solid #A3CBB2;
        }
        .certificate-content { 
          margin: 25px 0;
        }
        .signature-area { 
          margin-top: 50px; 
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #E2E8F0;
        }
        h1 { 
          color: #2D3748; 
          font-size: 24px; 
          margin: 15px 0; 
          font-family: 'Playfair Display', serif;
        }
        h2 { 
          color: #A3CBB2; 
          font-size: 20px; 
          margin-bottom: 15px; 
          font-weight: 600;
          text-align: center;
        }
        h3 { 
          color: #2D3748; 
          font-size: 16px; 
          margin: 20px 0 10px 0; 
          font-weight: 600;
          border-bottom: 2px solid #A3CBB2;
          padding-bottom: 5px;
        }
        .slogan {
          font-style: italic;
          color: #7FB3C3;
          font-size: 12px;
          margin-top: 10px;
        }
        /* SAG Export Certificate Styles */
        .sag-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          border: 2px solid #A3CBB2;
          border-radius: 10px;
          background: linear-gradient(135deg, #F7F9FC, #EDF2F7);
        }
        .export-section {
          margin-bottom: 25px;
          padding: 15px;
          border-radius: 8px;
          background: #FDFDFD;
        }
        .data-table, .vaccine-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 14px;
        }
        .data-table td, .vaccine-table td, .vaccine-table th {
          border: 1px solid #A3CBB2;
          padding: 8px;
          text-align: center;
        }
        .vaccine-table th {
          background: #A3CBB2;
          color: white;
          font-weight: bold;
          text-align: center;
        }
        .certification-list {
          list-style-type: none;
          padding-left: 0;
        }
        .certification-list li {
          margin: 8px 0;
          padding: 8px 0 8px 20px;
          position: relative;
        }
        .certification-list li:before {
          content: "✓";
          color: #A3CBB2;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        @media print {
          body { margin: 0; background: white; }
          .container { box-shadow: none; margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-section">
            <img src="${logoPath}" alt="Logo" class="clinic-logo">
          </div>
          <div class="header-info">
            <div class="clinic-name">
              <span class="ale">Ale</span> <span class="veterinaria">Veterinaria</span>
            </div>
            <div class="vet-name">Alejandra Cautín Bastías</div>
            <div class="vet-credentials">Médico Veterinario | 19.463.420-K</div>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 20px; color: #2D3748; margin: 20px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #A3CBB2; padding: 15px 25px; border-radius: 10px; background: linear-gradient(135deg, #F7FAFC, #EDF2F7);">${certificateTitle}</h1>
        </div>

        

        <div class="certificate-content">${certificateContent}</div>

        <div class="signature-area">
          <div style="margin-top: 60px; border-top: 2px solid #A3CBB2; width: 400px; margin: 60px auto 0; padding-top: 20px; text-align: center;">
            <p style="margin: 0 0 15px 0; font-weight: bold; color: #2D3748; font-size: 16px;">Dra. Alejandra Cautín Bastías</p>
            <p style="margin: 15px 0 20px 0; color: #666; font-size: 14px;">Fecha: ${currentDate}</p>
            
            <div style="border-top: 1px solid #E2E8F0; padding-top: 15px; margin-top: 20px;">
              <div class="contact-info" style="font-size: 12px; color: #666; line-height: 1.5;">
                WhatsApp: +56 9 7604 0797 | Email: contacto@aleveterinaria.cl<br>
                Instagram: @aleveterinaria | Santiago, Chile
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Store HTML for debugging purposes (development only)
  if (import.meta.env?.DEV) {
    (window as any).__lastGeneratedCertificateHTML = certificateHTML;
    console.log('🔧 Certificate HTML stored in window.__lastGeneratedCertificateHTML for debugging');
  }

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(certificateHTML);
    printWindow.document.close();
    printWindow.focus();
  }
};