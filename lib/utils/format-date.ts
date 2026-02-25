/**
 * Locale-aware date formatting utility
 * Maps FSD language names to BCP 47 locale codes for Intl.DateTimeFormat
 */

const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  English: "en-US",
  German: "de-DE",
  French: "fr-FR",
  Spanish: "es-ES",
  Japanese: "ja-JP",
  Chinese: "zh-CN",
};

/**
 * Formats a date according to the user's selected language/locale
 * @param date - The date to format (string, Date, or number)
 * @param language - The FSD language name (e.g., "English", "German")
 * @param options - Intl.DateTimeFormat options (defaults to medium format)
 */
export function formatDate(
  date: string | Date | number,
  language: string = "English",
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = LANGUAGE_LOCALE_MAP[language] || "en-US";
  const dateObj = new Date(date);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  try {
    return dateObj.toLocaleDateString(locale, options || defaultOptions);
  } catch {
    // Fallback to en-US if locale is not supported
    return dateObj.toLocaleDateString("en-US", options || defaultOptions);
  }
}

/**
 * Formats a date with long month name
 */
export function formatDateLong(
  date: string | Date | number,
  language: string = "English"
): string {
  return formatDate(date, language, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a date with time
 */
export function formatDateTime(
  date: string | Date | number,
  language: string = "English"
): string {
  return formatDate(date, language, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
