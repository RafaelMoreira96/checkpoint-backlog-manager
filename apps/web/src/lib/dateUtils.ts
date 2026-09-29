/**
 * Utility to parse various date formats used in CheckPOINT (especially DD/MM/YYYY and YYYY-MM-DD)
 * into a comparable numeric timestamp.
 * Returns 0 for invalid, empty, or placeholder dates like '01/01/0001'.
 */
export function parseDateToBeatingTimestamp(dateStr?: string | null): number {
  if (!dateStr) return 0;
  const str = String(dateStr).trim();
  if (
    !str ||
    str === '01/01/0001' ||
    str === '0001-01-01' ||
    str === 'null' ||
    str === 'undefined'
  ) {
    return 0;
  }

  // 1. Check DD/MM/YYYY or DD-MM-YYYY (e.g. 31/12/2024)
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    if (year <= 1) return 0;
    const d = new Date(year, month - 1, day);
    const time = d.getTime();
    return isNaN(time) ? 0 : time;
  }

  // 2. Check YYYY-MM-DD or YYYY/MM/DD (ISO date format e.g. 2024-12-31)
  const ymdMatch = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (year <= 1) return 0;
    const d = new Date(year, month - 1, day);
    const time = d.getTime();
    return isNaN(time) ? 0 : time;
  }

  // 3. Fallback to generic Date.parse
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    if (d.getFullYear() <= 1) return 0;
    return parsed;
  }

  return 0;
}
