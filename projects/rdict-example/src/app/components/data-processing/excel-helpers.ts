export function excelSerialToDate(serial: number): Date {
  // Excel epoch starts at 1899-12-30
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  return new Date(excelEpoch.getTime() + serial * 86400000);
}

export function normalizeDate(value: any): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === 'number') {
    return excelSerialToDate(value);
  }

  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function extractTime(value: any): { h: number; m: number; s: number } | null {
  if (!value) return null;

  if (value instanceof Date) {
    return {
      h: value.getHours(),
      m: value.getMinutes(),
      s: value.getSeconds(),
    };
  }

  if (typeof value === 'number') {
    // Excel time fraction (0–1)
    const totalSeconds = Math.round(value * 86400);
    return {
      h: Math.floor(totalSeconds / 3600),
      m: Math.floor((totalSeconds % 3600) / 60),
      s: totalSeconds % 60,
    };
  }

  if (typeof value === 'string') {
    const parts = value.split(':').map(Number);
    if (parts.length >= 2) {
      return {
        h: parts[0],
        m: parts[1],
        s: parts[2] ?? 0,
      };
    }
  }

  return null;
}
