// Utilidad para formatear fechas en formato chileno DD/MM/YYYY
export const formatDateToChilean = (date: string | Date): string => {
  if (!date) return '';
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Si es una fecha en formato YYYY-MM-DD, usar UTC para evitar problemas de zona horaria
    if (date.includes('-') && date.length === 10) {
      const [year, month, day] = date.split('-');
      dateObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) return '';
  
  const day = dateObj.getUTCDate().toString().padStart(2, '0');
  const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
};

// Convertir fecha chilena DD/MM/YYYY a formato ISO YYYY-MM-DD para inputs
export const formatChileanToISO = (chileanDate: string): string => {
  if (!chileanDate) return '';
  
  const parts = chileanDate.split('/');
  if (parts.length !== 3) return '';
  
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Convertir fecha ISO YYYY-MM-DD a formato chileno DD/MM/YYYY
export const formatISOToChilean = (isoDate: string): string => {
  if (!isoDate) return '';
  
  const parts = isoDate.split('-');
  if (parts.length !== 3) return '';
  
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

// Formatear fecha y hora en formato chileno
export const formatDateTimeToChilean = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Obtener fecha actual en formato chileno
export const getCurrentDateChilean = (): string => {
  return formatDateToChilean(new Date());
};

// Obtener fecha actual en formato ISO para inputs
export const getCurrentDateISO = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};