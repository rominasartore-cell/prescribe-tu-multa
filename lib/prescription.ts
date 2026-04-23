export function calculatePrescriptionDate(fechaIngreso: Date): Date {
  const prescriptionDate = new Date(fechaIngreso);
  prescriptionDate.setFullYear(fechaIngreso.getFullYear() + 3);

  // Handle leap year edge case (e.g., Feb 29 -> Feb 28 in non-leap years)
  // If month changed after setFullYear, the day didn't exist in target year
  if (prescriptionDate.getMonth() !== fechaIngreso.getMonth()) {
    prescriptionDate.setDate(0);
  }

  return prescriptionDate;
}

export function isPrescribed(fechaIngreso: Date): boolean {
  const today = new Date();
  const prescriptionDate = calculatePrescriptionDate(fechaIngreso);
  return today > prescriptionDate;
}

export function getDaysRemaining(fechaIngreso: Date): number {
  const today = new Date();
  const prescriptionDate = calculatePrescriptionDate(fechaIngreso);

  if (today > prescriptionDate) {
    return 0;
  }

  const diffTime = prescriptionDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function getStatus(fechaIngreso: Date): 'PRESCRITA' | 'VIGENTE' {
  return isPrescribed(fechaIngreso) ? 'PRESCRITA' : 'VIGENTE';
}
