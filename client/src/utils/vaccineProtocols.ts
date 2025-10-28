// Vaccine protocols for veterinary system
import { addWeeks, addYears, format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface VaccineProtocol {
  name: string;
  species: 'Canino' | 'Felino';
  ageWeeks?: number;
  ageMonths?: number;
  interval: 'weeks' | 'months' | 'years';
  intervalValue: number;
  mandatory: boolean;
  description: string;
}

export const vaccineProtocols: VaccineProtocol[] = [
  // Canine vaccines
  {
    name: 'Séxtuple/Óctuple',
    species: 'Canino',
    ageWeeks: 8,
    interval: 'weeks',
    intervalValue: 4,
    mandatory: true,
    description: 'Primera dosis a las 8 semanas, segunda a las 12 semanas, tercera a las 16 semanas'
  },
  {
    name: 'Rabia',
    species: 'Canino',
    ageWeeks: 16,
    interval: 'years',
    intervalValue: 1,
    mandatory: true,
    description: 'Primera dosis desde las 16 semanas, refuerzo anual'
  },
  {
    name: 'Tos de las Perreras',
    species: 'Canino',
    ageWeeks: 12,
    interval: 'years',
    intervalValue: 1,
    mandatory: false,
    description: 'Opcional según exposición a otros perros'
  },

  // Feline vaccines
  {
    name: 'Triple Felina',
    species: 'Felino',
    ageWeeks: 8,
    interval: 'weeks',
    intervalValue: 4,
    mandatory: true,
    description: 'Primera dosis a las 8 semanas, segunda a las 12 semanas'
  },
  {
    name: 'Leucemia Felina',
    species: 'Felino',
    ageWeeks: 12,
    interval: 'years',
    intervalValue: 1,
    mandatory: false,
    description: 'Opcional para gatos con acceso al exterior'
  },
  {
    name: 'Rabia Felina',
    species: 'Felino',
    ageWeeks: 16,
    interval: 'years',
    intervalValue: 1,
    mandatory: true,
    description: 'Obligatoria desde las 16 semanas'
  }
];

export interface DewormingProtocol {
  type: 'Interna' | 'Externa';
  species: 'Canino' | 'Felino';
  ageWeeks?: number;
  interval: 'weeks' | 'months';
  intervalValue: number;
  untilAge?: number; // age in weeks when protocol changes
  description: string;
}

export const dewormingProtocols: DewormingProtocol[] = [
  // Internal deworming
  {
    type: 'Interna',
    species: 'Canino',
    ageWeeks: 2,
    interval: 'weeks',
    intervalValue: 2,
    untilAge: 12,
    description: 'Cada 2 semanas hasta las 12 semanas'
  },
  {
    type: 'Interna',
    species: 'Canino',
    ageWeeks: 12,
    interval: 'months',
    intervalValue: 1,
    untilAge: 24,
    description: 'Mensual desde las 12 semanas hasta 6 meses'
  },
  {
    type: 'Interna',
    species: 'Canino',
    ageWeeks: 24,
    interval: 'months',
    intervalValue: 3,
    description: 'Cada 3 meses después de los 6 meses'
  },
  {
    type: 'Interna',
    species: 'Felino',
    ageWeeks: 2,
    interval: 'weeks',
    intervalValue: 2,
    untilAge: 12,
    description: 'Cada 2 semanas hasta las 12 semanas'
  },
  {
    type: 'Interna',
    species: 'Felino',
    ageWeeks: 12,
    interval: 'months',
    intervalValue: 1,
    untilAge: 24,
    description: 'Mensual desde las 12 semanas hasta 6 meses'
  },
  {
    type: 'Interna',
    species: 'Felino',
    ageWeeks: 24,
    interval: 'months',
    intervalValue: 3,
    description: 'Cada 3 meses después de los 6 meses'
  },

  // External deworming
  {
    type: 'Externa',
    species: 'Canino',
    ageWeeks: 8,
    interval: 'months',
    intervalValue: 1,
    description: 'Mensual durante todo el año'
  },
  {
    type: 'Externa',
    species: 'Felino',
    ageWeeks: 8,
    interval: 'months',
    intervalValue: 1,
    description: 'Mensual durante todo el año'
  }
];

// Calculate next vaccination date based on birth date and protocol
export const calculateNextVaccineDate = (
  birthDate: Date,
  protocol: VaccineProtocol,
  lastVaccineDate?: Date
): Date => {
  if (lastVaccineDate) {
    // Calculate next dose based on last vaccination
    switch (protocol.interval) {
      case 'weeks':
        return addWeeks(lastVaccineDate, protocol.intervalValue);
      case 'months':
        return addWeeks(lastVaccineDate, protocol.intervalValue * 4);
      case 'years':
        return addYears(lastVaccineDate, protocol.intervalValue);
      default:
        return addYears(lastVaccineDate, 1);
    }
  } else {
    // Calculate first dose based on birth date
    if (protocol.ageWeeks) {
      return addWeeks(birthDate, protocol.ageWeeks);
    } else if (protocol.ageMonths) {
      return addWeeks(birthDate, protocol.ageMonths * 4);
    }
    return addWeeks(birthDate, 8); // Default 8 weeks
  }
};

// Calculate next deworming date
export const calculateNextDewormingDate = (
  birthDate: Date,
  currentAge: number, // in weeks
  protocol: DewormingProtocol,
  lastDewormingDate?: Date
): Date => {
  if (lastDewormingDate) {
    switch (protocol.interval) {
      case 'weeks':
        return addWeeks(lastDewormingDate, protocol.intervalValue);
      case 'months':
        return addWeeks(lastDewormingDate, protocol.intervalValue * 4);
      default:
        return addWeeks(lastDewormingDate, 4);
    }
  } else {
    if (protocol.ageWeeks) {
      return addWeeks(birthDate, protocol.ageWeeks);
    }
    return addWeeks(birthDate, 8);
  }
};

// Get appropriate protocols based on pet age and species
export const getApplicableVaccineProtocols = (
  species: 'Canino' | 'Felino',
  ageInWeeks: number
): VaccineProtocol[] => {
  return vaccineProtocols.filter(protocol => 
    protocol.species === species && 
    (!protocol.ageWeeks || ageInWeeks >= protocol.ageWeeks)
  );
};

export const getApplicableDewormingProtocols = (
  species: 'Canino' | 'Felino',
  ageInWeeks: number
): DewormingProtocol[] => {
  return dewormingProtocols.filter(protocol => 
    protocol.species === species && 
    (!protocol.ageWeeks || ageInWeeks >= protocol.ageWeeks) &&
    (!protocol.untilAge || ageInWeeks <= protocol.untilAge)
  );
};

// Calculate age in weeks from birth date
export const calculateAgeInWeeks = (birthDate: Date): number => {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - birthDate.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
};

// Format date for display
export const formatVaccineDate = (date: Date): string => {
  return format(date, "dd/MM/yyyy", { locale: es });
};