/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number, 
  locale?: string, 
  currency?: string
): string;

/**
 * Format a date string or timestamp
 */
export function formatDate(
  date: string | number | Date, 
  options?: Intl.DateTimeFormatOptions
): string;

/**
 * Format a distance in miles or kilometers
 */
export function formatDistance(distance: number, useMetric?: boolean): string;

/**
 * Format a phone number to standard US format
 */
export function formatPhoneNumber(phone: string): string;

/**
 * Format a VIN with proper spacing
 */
export function formatVIN(vin: string): string; 