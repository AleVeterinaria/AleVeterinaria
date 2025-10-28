import { addWeeks, addYears, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VaccinationData {
  vaccineName: string;
  applicationDate: string;
  patientSpecies: 'perro' | 'gato';
  patientAge?: number;
}

interface NextVaccinationResult {
  nextDate: string;
  daysUntilNext: number;
  status: 'vigente' | 'próximo' | 'vencido';
  isBooster?: boolean;
}

export class VaccineCalculator {
  static calculateNextVaccination(data: VaccinationData): NextVaccinationResult {
    const applicationDate = new Date(data.applicationDate);
    
    // Lógica básica de cálculo según tipo de vacuna y especie
    let intervalWeeks = 52; // 1 año por defecto
    
    // Ajustar intervalos según vacuna y especie
    if (data.vaccineName.toLowerCase().includes('rabia')) {
      intervalWeeks = 52; // Anual
    } else if (data.vaccineName.toLowerCase().includes('óctuple') || 
               data.vaccineName.toLowerCase().includes('séxtuple') ||
               data.vaccineName.toLowerCase().includes('quíntuple')) {
      intervalWeeks = 52; // Anual
    } else if (data.vaccineName.toLowerCase().includes('triple felina')) {
      intervalWeeks = 52; // Anual
    }
    
    const nextDate = addWeeks(applicationDate, intervalWeeks);
    const today = new Date();
    const daysUntilNext = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: 'vigente' | 'próximo' | 'vencido' = 'vigente';
    if (daysUntilNext < 0) {
      status = 'vencido';
    } else if (daysUntilNext <= 30) {
      status = 'próximo';
    }
    
    return {
      nextDate: format(nextDate, 'dd/MM/yyyy', { locale: es }),
      daysUntilNext,
      status
    };
  }
}