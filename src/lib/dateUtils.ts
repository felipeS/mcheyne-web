/**
 * Formats a Date object to YYYY-MM-DD format for HTML date inputs
 * @param date - The Date object to format
 * @returns A string in YYYY-MM-DD format
 */
export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a date string in YYYY-MM-DD format to a Date object
 * @param dateString - The date string in YYYY-MM-DD format
 * @returns A Date object
 */
export function parseDateInput(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Gets today's date formatted for HTML date inputs
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayFormatted(): string {
  return formatDateInput(new Date());
}
