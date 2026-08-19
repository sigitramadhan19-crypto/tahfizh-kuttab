export const SURAH_JUZ_MAPPING: Record<string, number> = {
  "Al-Fatihah": 1, "Al-Baqarah": 1, "Ali 'Imran": 3, "An-Nisa'": 4, 
  "Al-Ma'idah": 6, "Al-An'am": 7, "Al-A'raf": 8, "Al-Anfal": 9, 
  "At-Taubah": 10, "Yunus": 11, "Hud": 11, "Yusuf": 12, 
  "Ar-Ra'd": 13, "Ibrahim": 13, "Al-Hijr": 14, "An-Nahl": 14, 
  "Al-Isra'": 15, "Al-Kahf": 15, "Maryam": 16, "Taha": 16, 
  "Al-Anbiya'": 17, "Al-Hajj": 17, "Al-Mu'minun": 18, "An-Nur": 18, 
  "Al-Furqan": 18, "Asy-Syu'ara'": 19, "An-Naml": 19, "Al-Qasas": 20, 
  "Al-'Ankabut": 20, "Ar-Rum": 21, "Luqman": 21, "As-Sajdah": 21, 
  "Al-Ahzab": 21, "Saba'": 22, "Fatir": 22, "Yasin": 22, 
  "As-Saffat": 23, "Sad": 23, "Az-Zumar": 23, "Ghafir": 24, 
  "Fussilat": 24, "Asy-Syura": 25, "Az-Zukhruf": 25, "Ad-Dukhan": 25, 
  "Al-Jasiyah": 25, "Al-Ahqaf": 26, "Muhammad": 26, "Al-Fath": 26, 
  "Al-Hujurat": 26, "Qaf": 26, "Az-Zariyat": 26, "At-Tur": 27, 
  "An-Najm": 27, "Al-Qamar": 27, "Ar-Rahman": 27, "Al-Waqi'ah": 27, 
  "Al-Hadid": 27, "Al-Mujadilah": 28, "Al-Hasyr": 28, "Al-Mumtahanah": 28, 
  "As-Saff": 28, "Al-Jumu'ah": 28, "Al-Munafiqun": 28, "At-Tagabun": 28, 
  "At-Talaq": 28, "At-Tahrim": 28, "Al-Mulk": 29, "Al-Qalam": 29, 
  "Al-Haqqah": 29, "Al-Ma'arij": 29, "Nuh": 29, "Al-Jinn": 29, 
  "Al-Muzzammil": 29, "Al-Muddassir": 29, "Al-Qiyamah": 29, "Al-Insan": 29, 
  "Al-Mursalat": 29, "An-Naba'": 30, "An-Nazi'at": 30, "'Abasa": 30, 
  "At-Takwir": 30, "Al-Infitar": 30, "Al-Mutaffifin": 30, "Al-Insyiqaq": 30, 
  "Al-Buruj": 30, "At-Tariq": 30, "Al-A'la": 30, "Al-Gasyiyah": 30, 
  "Al-Fajr": 30, "Al-Balad": 30, "Asy-Syams": 30, "Al-Lail": 30, 
  "Ad-Duha": 30, "Asy-Syarh": 30, "At-Tin": 30, "Al-'Alaq": 30, 
  "Al-Qadr": 30, "Al-Bayyinah": 30, "Az-Zalzalah": 30, "Al-'Adiyat": 30, 
  "Al-Qari'ah": 30, "At-Takasur": 30, "Al-'Asr": 30, "Al-Humazah": 30, 
  "Al-Fil": 30, "Quraisy": 30, "Al-Ma'un": 30, "Al-Kausar": 30, 
  "Al-Kafirun": 30, "An-Nasr": 30, "Al-Lahab": 30, "Al-Ikhlas": 30, 
  "Al-Falaq": 30, "An-Nas": 30
};

export function getJuzFromSurah(surahName: string | null): number | null {
  if (!surahName) return null;
  
  // Normalization for matching
  const normalizedInput = surahName.toLowerCase().replace(/['`]/g, "");
  
  for (const [name, juz] of Object.entries(SURAH_JUZ_MAPPING)) {
    const normalizedName = name.toLowerCase().replace(/['`]/g, "");
    if (normalizedInput === normalizedName || normalizedInput.includes(normalizedName)) {
      return juz;
    }
  }
  
  return null;
}
