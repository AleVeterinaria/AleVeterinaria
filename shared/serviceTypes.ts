// Service types with durations and scheduling rules
export interface ServiceType {
  name: string;
  duration: number; // in minutes
  color?: string;
}

export const SERVICE_TYPES: ServiceType[] = [
  {
    name: 'Consulta General',
    duration: 60,
    color: '#5FA98D'
  },
  {
    name: 'Control Médico', 
    duration: 45,
    color: '#8B93C7'
  },
  {
    name: 'Toma de Exámenes',
    duration: 30,
    color: '#87CEEB'
  },
  {
    name: 'Vacunación',
    duration: 30,
    color: '#98D8C8'
  },
  {
    name: 'Desparasitación',
    duration: 30,
    color: '#FFB6C1'
  },
  {
    name: 'Control Anual',
    duration: 60,
    color: '#DDA0DD'
  },
  {
    name: 'Certificado de Salud',
    duration: 30,
    color: '#F0E68C'
  }
];

// Minimum separation between appointments (30 minutes)
export const MIN_APPOINTMENT_SEPARATION = 30;

// Helper functions
export const getServiceDuration = (serviceType: string): number => {
  const service = SERVICE_TYPES.find(s => s.name === serviceType);
  return service?.duration || 30; // default to 30 minutes
};

export const getServiceColor = (serviceType: string): string => {
  const service = SERVICE_TYPES.find(s => s.name === serviceType);
  return service?.color || '#5FA98D';
};

export const getServiceNames = (): string[] => {
  return SERVICE_TYPES.map(s => s.name);
};