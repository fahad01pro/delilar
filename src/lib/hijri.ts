// Dynamic Islamic (Hijri) calendar utility.
// Uses the browser's built-in `islamic-umalqura` calendar via Intl APIs.

export type EidKey = "fitr" | "adha";

export interface EidInfo {
  key: EidKey;
  name: string; // e.g. "Eid-ul-Fitr"
  shortLabel: string; // navbar label, e.g. "Eid-ul-Fitr Edit"
  isCurrent: boolean; // true if we're inside the Eid window right now
  hijriYear: number;
}

interface HijriParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-30
}

function getHijriParts(date: Date = new Date()): HijriParts {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(date);

    const get = (type: string) =>
      parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);

    return { year: get("year"), month: get("month"), day: get("day") };
  } catch {
    // Fallback approximate conversion if Intl islamic calendar unavailable.
    const jd =
      Math.floor((date.getTime() - Date.UTC(1970, 0, 1)) / 86400000) + 2440588;
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j =
      Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
      Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 =
      l2 -
      Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
      29;
    const month = Math.floor((24 * l3) / 709);
    const day = l3 - Math.floor((709 * month) / 24);
    const year = 30 * n + j - 30;
    return { year, month, day };
  }
}

/**
 * Determine the next/current Eid based on Hijri date.
 *
 * - Eid-ul-Fitr: 1–3 Shawwal (month 10)
 * - Eid-ul-Adha: 10–13 Dhul-Hijjah (month 12)
 *
 * Rules:
 *  • Before/within Eid-ul-Fitr window → "Eid-ul-Fitr"
 *  • After Fitr, before/within Eid-ul-Adha → "Eid-ul-Adha"
 *  • After Adha → next Hijri year's "Eid-ul-Fitr"
 */
export function getActiveEid(date: Date = new Date()): EidInfo {
  const { year, month, day } = getHijriParts(date);

  const beforeFitrEnd = month < 10 || (month === 10 && day <= 3);
  const inFitr = month === 10 && day >= 1 && day <= 3;

  if (beforeFitrEnd) {
    return {
      key: "fitr",
      name: "Eid-ul-Fitr",
      shortLabel: "Eid-ul-Fitr Edit",
      isCurrent: inFitr,
      hijriYear: year,
    };
  }

  const beforeAdhaEnd =
    month < 12 || (month === 12 && day <= 13);
  const inAdha = month === 12 && day >= 10 && day <= 13;

  if (beforeAdhaEnd) {
    return {
      key: "adha",
      name: "Eid-ul-Adha",
      shortLabel: "Eid-ul-Adha Edit",
      isCurrent: inAdha,
      hijriYear: year,
    };
  }

  // Past Adha → next year's Fitr
  return {
    key: "fitr",
    name: "Eid-ul-Fitr",
    shortLabel: "Eid-ul-Fitr Edit",
    isCurrent: false,
    hijriYear: year + 1,
  };
}
