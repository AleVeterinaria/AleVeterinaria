// Age calculation utilities

export function calculateAge(birthDate: string | Date): {
  years: number;
  months: number;
  days: number;
  formatted: string;
} {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  
  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const formatted = formatAge({ years, months, days });
  return { years, months, days, formatted };
}

export function formatAge(age: { years: number; months: number; days: number }): string {
  const { years, months, days } = age;
  
  if (years > 0) {
    if (months > 0) {
      return `${years} año${years !== 1 ? 's' : ''} y ${months} mes${months !== 1 ? 'es' : ''}`;
    } else {
      return `${years} año${years !== 1 ? 's' : ''}`;
    }
  } else if (months > 0) {
    if (days > 7) {
      return `${months} mes${months !== 1 ? 'es' : ''} y ${Math.floor(days / 7)} semana${Math.floor(days / 7) !== 1 ? 's' : ''}`;
    } else {
      return `${months} mes${months !== 1 ? 'es' : ''}`;
    }
  } else if (days > 0) {
    if (days >= 7) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      if (remainingDays > 0) {
        return `${weeks} semana${weeks !== 1 ? 's' : ''} y ${remainingDays} día${remainingDays !== 1 ? 's' : ''}`;
      } else {
        return `${weeks} semana${weeks !== 1 ? 's' : ''}`;
      }
    } else {
      return `${days} día${days !== 1 ? 's' : ''}`;
    }
  } else {
    return 'Recién nacido';
  }
}

export function getAgeInMonths(birthDate: string | Date): number {
  const birth = new Date(birthDate);
  const today = new Date();
  
  const years = today.getFullYear() - birth.getFullYear();
  const months = today.getMonth() - birth.getMonth();
  
  return years * 12 + months;
}

export function getAgeCategory(birthDate: string | Date): 'puppy' | 'adult' | 'senior' {
  const ageInMonths = getAgeInMonths(birthDate);
  
  if (ageInMonths < 12) {
    return 'puppy'; // Cachorro/gatito
  } else if (ageInMonths < 84) { // 7 años
    return 'adult'; // Adulto
  } else {
    return 'senior'; // Senior
  }
}