import { RowError } from '../interfaces/parsed-receipt-item.interface';

/**
 * Parses an Excel cell value (serial number, string, or date string) into a Date.
 * Pure function — no DB or NestJS dependencies, fully unit-testable in isolation.
 *
 * Supported formats:
 *   - Excel serial number (number or numeric string, e.g. 46182)
 *   - DD/MM/YYYY or DD-MM-YYYY
 *   - Any string parseable by Date constructor
 *
 * On failure: pushes to `errors` and returns null.
 */
export function parseExcelDate(
  raw: string | number | null | undefined,
  rowIndex: number,
  errors: RowError[],
): Date | null {
  if (!raw) return null;

  const rawStr = String(raw).trim();
  const dateNum = Number(raw);
  let date: Date | null = null;

  if (typeof raw === 'number' && !isNaN(dateNum)) {
    // Excel numeric serial date
    date = new Date(Math.round((dateNum - 25569) * 86400 * 1000));
  } else if (/^\d+$/.test(rawStr)) {
    // Numeric serial stored as string (e.g. "46182")
    date = new Date(Math.round((parseInt(rawStr, 10) - 25569) * 86400 * 1000));
  } else {
    // Match DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = rawStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmyMatch) {
      date = new Date(
        parseInt(dmyMatch[3], 10),
        parseInt(dmyMatch[2], 10) - 1,
        parseInt(dmyMatch[1], 10),
      );
    } else {
      date = new Date(rawStr);
    }
  }

  if (
    !date ||
    isNaN(date.getTime()) ||
    date.getFullYear() < 1970 ||
    date.getFullYear() > 2100
  ) {
    errors.push({
      row: rowIndex,
      item: `Ngày hóa đơn: ${raw}`,
      error:
        'Ngày hóa đơn không hợp lệ (định dạng DD/MM/YYYY hoặc YYYY-MM-DD, năm 1970-2100).',
    });
    return null;
  }

  return date;
}
