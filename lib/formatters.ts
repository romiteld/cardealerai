/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param locale - The locale to use (default: 'en-US')
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  locale: string = 'en-US', 
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string or timestamp
 * @param date - The date to format
 * @param options - Date formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | number | Date, 
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format a distance in miles or kilometers
 * @param distance - The distance to format
 * @param useMetric - Whether to use kilometers (default: false)
 * @returns Formatted distance string
 */
export function formatDistance(distance: number, useMetric: boolean = false): string {
  if (useMetric) {
    // Convert miles to kilometers
    const km = distance * 1.60934;
    return `${km.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`;
  }
  
  return `${distance.toLocaleString()} mi`;
}

/**
 * Format a phone number to standard US format
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
  
  // Return original if not a standard 10-digit US number
  return phone;
}

/**
 * Format a VIN with proper spacing
 * @param vin - The VIN to format
 * @returns Formatted VIN
 */
export function formatVIN(vin: string): string {
  // Remove any spaces and convert to uppercase
  const cleaned = vin.replace(/\s/g, '').toUpperCase();
  
  // Standard VIN is 17 characters
  if (cleaned.length === 17) {
    // Group as XXX XX XXXXXXXXX
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
  }
  
  // Return original if not a standard 17-character VIN
  return vin.toUpperCase();
} 