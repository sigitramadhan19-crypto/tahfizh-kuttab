// Parses the free-text startDetail/endDetail/sourceMaterial fields that
// src/app/actions/deposit.ts writes onto a DepositLog, to derive an actual
// quantity (ayat, baris, surat) instead of just counting rows. Keep this in
// sync with how saveDepositLogOnce formats those strings.

/** "Ayat 5" / "Ayat 10" -> 5, 10. Returns null if no number is found. */
function firstNumber(text: string | null | undefined): number | null {
  const match = (text || "").match(/[0-9]+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Tahfizh Jadid & Tilawah Al-Quran log ayat range as startDetail="Ayat N",
 * endDetail="Ayat M" (endDetail blank when it's a single ayat). Total ayat
 * for one log = M - N + 1.
 */
export function countAyat(startDetail: string | null, endDetail: string | null): number {
  const start = firstNumber(startDetail);
  if (start === null) return 0;
  const end = firstNumber(endDetail);
  if (end === null || end < start) return 1;
  return end - start + 1;
}

/**
 * Tilawah Iqra logs endDetail as "Baris N" or "Baris N-M" (blank entirely
 * when no baris was recorded, since barisStart/barisEnd are optional on the
 * input form). Total baris for one log = M - N + 1, or 0 when unrecorded.
 */
export function countBaris(endDetail: string | null): number {
  const nums = (endDetail || "").match(/[0-9]+/g);
  if (!nums || nums.length === 0) return 0;
  const start = parseInt(nums[0], 10);
  const end = nums.length > 1 ? parseInt(nums[1], 10) : start;
  if (end < start) return 1;
  return end - start + 1;
}

/**
 * Muraja'ah Qarib logs sourceMaterial as a comma-joined surah list, e.g.
 * "Al-Fatihah, Al-Baqarah". Total surat for one log = number of surah names.
 */
export function countQaribSurahs(sourceMaterial: string | null): number {
  if (!sourceMaterial) return 0;
  return sourceMaterial.split(",").map(s => s.trim()).filter(Boolean).length;
}
