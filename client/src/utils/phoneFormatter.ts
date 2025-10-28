/**
 * Utilidades para formatear y validar números de teléfono con código de país
 * Específicamente diseñado para WhatsApp compatibility con formato chileno
 */

// Formatea el número de teléfono para mostrar en el input (internacional)
export const formatPhoneInput = (value: string): string => {
  // Remover todos los caracteres no numéricos excepto el + inicial
  let cleanValue = value.replace(/[^\d+]/g, '');
  
  // Si no comienza con +, agregarlo
  if (!cleanValue.startsWith('+')) {
    cleanValue = '+' + cleanValue.replace(/\+/g, '');
  }
  
  // Si solo hay un +, devolver +56 por defecto (Chile)
  if (cleanValue === '+') {
    return '+56 ';
  }
  
  // Si comienza con + sin números, agregar 56
  if (cleanValue === '+') {
    return '+56 ';
  }
  
  const numbers = cleanValue.slice(1); // Remover el +
  
  // Formateo específico para Chile (+56)
  if (numbers.startsWith('56')) {
    if (numbers.length <= 2) return '+56';
    if (numbers.length <= 3) return `+56 ${numbers.slice(2)}`;
    if (numbers.length <= 7) return `+56 ${numbers.slice(2, 3)} ${numbers.slice(3)}`;
    return `+56 ${numbers.slice(2, 3)} ${numbers.slice(3, 7)} ${numbers.slice(7, 11)}`;
  }
  
  // Formateo para otros países comunes
  // Estados Unidos/Canadá (+1)
  if (numbers.startsWith('1') && numbers.length > 1) {
    if (numbers.length <= 4) return `+1 ${numbers.slice(1)}`;
    if (numbers.length <= 7) return `+1 ${numbers.slice(1, 4)} ${numbers.slice(4)}`;
    return `+1 ${numbers.slice(1, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 11)}`;
  }
  
  // Argentina (+54)
  if (numbers.startsWith('54')) {
    if (numbers.length <= 2) return '+54';
    if (numbers.length <= 4) return `+54 ${numbers.slice(2)}`;
    return `+54 ${numbers.slice(2, 4)} ${numbers.slice(4, 8)} ${numbers.slice(8, 12)}`;
  }
  
  // Brasil (+55)
  if (numbers.startsWith('55')) {
    if (numbers.length <= 2) return '+55';
    if (numbers.length <= 4) return `+55 ${numbers.slice(2)}`;
    return `+55 ${numbers.slice(2, 4)} ${numbers.slice(4, 9)} ${numbers.slice(9, 13)}`;
  }
  
  // España (+34)
  if (numbers.startsWith('34')) {
    if (numbers.length <= 2) return '+34';
    if (numbers.length <= 5) return `+34 ${numbers.slice(2)}`;
    return `+34 ${numbers.slice(2, 5)} ${numbers.slice(5, 8)} ${numbers.slice(8, 11)}`;
  }
  
  // Para otros códigos de país, formato genérico
  if (numbers.length > 0) {
    // Separar código de país (1-4 dígitos) del resto
    if (numbers.length <= 3) return `+${numbers}`;
    if (numbers.length <= 6) return `+${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `+${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
    return `+${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 9)} ${numbers.slice(9, 13)}`;
  }
  
  return '+56 ';
};

// Convierte el número formateado a formato WhatsApp (solo números con código de país)
export const formatPhoneForWhatsApp = (formattedPhone: string): string => {
  const numbers = formattedPhone.replace(/\D/g, '');
  
  // Si ya tiene código de país 56
  if (numbers.startsWith('56') && numbers.length >= 11) {
    return numbers;
  }
  
  // Si comienza con 9 y tiene 9 dígitos, agregar 56
  if (numbers.startsWith('9') && numbers.length === 9) {
    return `56${numbers}`;
  }
  
  // Si no tiene código de país y tiene 8 dígitos, agregar 569
  if (numbers.length === 8 && !numbers.startsWith('56')) {
    return `569${numbers}`;
  }
  
  return numbers;
};

// Valida si el número de teléfono es válido para WhatsApp (internacional)
export const isValidPhoneNumber = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '');
  
  // Debe tener al menos 10 dígitos (código país + número)
  if (numbers.length < 10) return false;
  
  // Validación específica por país
  // Chile: +56 9 XXXX XXXX (11 dígitos total)
  if (numbers.startsWith('56')) {
    return numbers.length === 11 && numbers[2] === '9';
  }
  
  // Estados Unidos/Canadá: +1 XXX XXX XXXX (11 dígitos total)
  if (numbers.startsWith('1')) {
    return numbers.length === 11;
  }
  
  // Argentina: +54 XX XXXX XXXX (12-13 dígitos)
  if (numbers.startsWith('54')) {
    return numbers.length >= 12 && numbers.length <= 13;
  }
  
  // Brasil: +55 XX XXXXX XXXX (13 dígitos)
  if (numbers.startsWith('55')) {
    return numbers.length === 13;
  }
  
  // España: +34 XXX XXX XXX (11 dígitos)
  if (numbers.startsWith('34')) {
    return numbers.length === 11;
  }
  
  // Para otros países, validación genérica (10-15 dígitos)
  return numbers.length >= 10 && numbers.length <= 15;
};

// Obtiene un mensaje de error para el número de teléfono
export const getPhoneValidationMessage = (phone: string): string => {
  if (!phone || phone.trim() === '' || phone.trim() === '+56' || phone.trim() === '+') {
    return 'El número de teléfono es requerido';
  }
  
  if (!isValidPhoneNumber(phone)) {
    return 'Ingresa un número válido con código de país (ej: +56 9 1234 5678, +1 555 123 4567)';
  }
  
  return '';
};

// Hook para manejar el cambio de input de teléfono
export const handlePhoneInputChange = (
  value: string, 
  setter: (phone: string) => void
): void => {
  const formatted = formatPhoneInput(value);
  setter(formatted);
};