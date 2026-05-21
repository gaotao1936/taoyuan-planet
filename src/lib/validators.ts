/**
 * Validate Chinese mobile phone number.
 */
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * Validate Chinese ID card number (18 digits) per GB 11643-1999.
 */
export function isValidIdCard(idCard: string): boolean {
  if (!/^\d{17}[\dXx]$/.test(idCard)) return false;

  // Validate birthday
  const birth = idCard.substring(6, 14);
  const year = parseInt(birth.substring(0, 4));
  const month = parseInt(birth.substring(4, 6));
  const day = parseInt(birth.substring(6, 8));
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  // Checksum (ISO 7064:1983 MOD 11-2)
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkMap = "10X98765432";
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i];
  }
  return idCard[17].toUpperCase() === checkMap[sum % 11];
}
