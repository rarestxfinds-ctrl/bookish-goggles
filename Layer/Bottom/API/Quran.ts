import ayahs from "@/Bottom/Data/Quran/Meta/Ayahs.json";
import names from "@/Bottom/Data/Quran/Meta/Names.json";
import pageMap from "@/Bottom/Data/Quran/Meta/PageMap.json";
import juzArray from "@/Bottom/Data/Quran/Meta/Juz.json";
import place from "@/Bottom/Data/Quran/Meta/Revelation/Place.json";
import order from "@/Bottom/Data/Quran/Meta/Revelation/Order.json";

export type QuranFontType = "Standard" | "V1" | "V2";

export interface SurahData {
  ID: number;
  Ayah: string[];
}

export interface TranslationData {
  ID: number;
  Ayah: { Kalima: string[] }[];
}

export type SurahLayout = string[][];

export interface AssembledVerse {
  verseNumber: number;
  arabic: string;
  words: string[];
  translation?: string;
  wbwTranslation?: string[];
}

export interface AssembledSurah {
  id: number;
  verses: AssembledVerse[];
  lines?: string[][];
}

export interface SurahMeta {
  id: number;
  name: string;
  surahFontName: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
  revelationOrder: number;
  pages: [number, number];
  juz: number;
}

export interface JuzInfo {
  juzNumber: number;
  surahs: { id: number }[];
}

export interface PageSegment {
  surah: number;
  startVerse: number;
  startWord: number;
  endVerse: number;
  endWord: number;
}

export type TranslationSource = string;

// ============= Build surahList =============
export const surahList: SurahMeta[] = (Array.isArray(ayahs) ? ayahs : []).map((ayahCount, idx) => {
  const id = idx + 1;
  const englishNameTranslation = Array.isArray(names) && names[id - 1] ? names[id - 1] : "";
  const fontName = id.toString().padStart(3, '0');
  const startPage = 1;
  const endPage = 604;
  const revelationType = Array.isArray(place) && place[id - 1] ? (place[id - 1] as "Meccan" | "Medinan") : "Meccan";
  const revelationOrder = Array.isArray(order) && order[id - 1] ? order[id - 1] : id;
  const juz = Array.isArray(juzArray) && juzArray[id - 1] ? juzArray[id - 1] : 1;

  const arabicName = "";
  return {
    id,
    name: arabicName,
    surahFontName: fontName,
    englishName: "",
    englishNameTranslation,
    numberOfAyahs: ayahCount,
    revelationType,
    revelationOrder,
    pages: [startPage, endPage],
    juz,
  };
});

// ============= Page Map Parser =============
export function getPageSegments(pageNumber: number): PageSegment[] | null {
  if (!pageMap || !Array.isArray(pageMap)) {
    console.error("Page map not loaded properly");
    return null;
  }

  if (pageNumber < 1 || pageNumber > pageMap.length) {
    console.warn(`Page ${pageNumber} not found. Total pages: ${pageMap.length}`);
    return null;
  }
  
  const pageData = pageMap[pageNumber - 1];
  if (!pageData) {
    console.warn(`No data for page ${pageNumber}`);
    return null;
  }
  
  const segments = pageData.split('|');
  
  const result: PageSegment[] = [];
  
  for (const segment of segments) {
    const [start, end] = segment.split('-');
    
    if (!start || !end) {
      console.error(`Invalid segment format: ${segment}`);
      continue;
    }
    
    const startParts = start.split('.');
    if (startParts.length !== 2) {
      console.error(`Invalid start format: ${start}`);
      continue;
    }
    
    const [startSurahVerse, startWord] = startParts;
    const [startSurah, startVerse] = startSurahVerse.split(':');
    
    const endParts = end.split('.');
    if (endParts.length !== 2) {
      console.error(`Invalid end format: ${end}`);
      continue;
    }
    
    const [endSurahVerse, endWord] = endParts;
    const [endSurah, endVerse] = endSurahVerse.split(':');
    
    result.push({
      surah: parseInt(startSurah),
      startVerse: parseInt(startVerse),
      startWord: parseInt(startWord),
      endVerse: parseInt(endVerse),
      endWord: parseInt(endWord),
    });
  }
  
  return result.length > 0 ? result : null;
}

// ============= Build juzData from Juz.json =============
const juzStartMap: number[] = Array.isArray(juzArray) ? juzArray : [];
const juzGroups: { [key: number]: number[] } = {};
for (let i = 0; i < juzStartMap.length; i++) {
  const juz = juzStartMap[i];
  if (!juzGroups[juz]) juzGroups[juz] = [];
  juzGroups[juz].push(i + 1);
}
export const juzData: JuzInfo[] = Object.entries(juzGroups).map(([juz, surahIds]) => ({
  juzNumber: parseInt(juz),
  surahs: surahIds.map(id => ({ id })),
}));

// ============= Revelation order array (for backward compatibility) =============
export const revelationOrder: number[] = Array.isArray(order) ? order : [];

// ============= Cache =============
const cache = {
  surah:       new Map<string, SurahData>(),
  translation: new Map<string, TranslationData>(),
  layout:      new Map<number, SurahLayout | null>(),
  timestamps:  new Map<string, string[][] | string[] | null>(),
};

// ============= Glob Modules =============
const surahAudioModules = import.meta.glob(
  '@/Bottom/Data/Quran/Qiraat/*/Surah/*/Audio.mp3',
  { query: '?url', import: 'default', eager: false }
);
const pageAudioModules = import.meta.glob(
  '@/Bottom/Data/Quran/Qiraat/*/Page/*/Audio.mp3',
  { query: '?url', import: 'default', eager: false }
);
const ayahAudioModules = import.meta.glob(
  '@/Bottom/Data/Quran/Qiraat/*/Surah/*/Ayah/*/Audio.mp3',
  { query: '?url', import: 'default', eager: false }
);
const wordAudioModules = import.meta.glob(
  '@/Bottom/Data/Quran/Qiraat/Tafsir_Center/Surah/*/Ayah/*/Kalima/*/Audio.mp3',
  { query: '?url', import: 'default', eager: false }
);
const surahTimestampModules = import.meta.glob(
  '@/Bottom/Data/Quran/Qiraat/*/Surah/*/Timestamp.json',
  { import: 'default', eager: false }
);
const ayahTimestampModules = import.meta.glob(
  '@/Bottom/Data/Quran/Qiraat/*/Surah/*/Ayah/*/Timestamp.json',
  { import: 'default', eager: false }
);

// ============= Audio key helper =============
function resolveGlobBase(
  modules: Record<string, unknown>,
  marker: string,
): string {
  const anyKey = Object.keys(modules)[0];
  if (!anyKey) return "";
  const idx = anyKey.indexOf(marker);
  return idx !== -1 ? anyKey.slice(0, idx) : "";
}

const surahAudioBase = resolveGlobBase(surahAudioModules, "/Bottom/Data/Quran/Qiraat/");
const pageAudioBase = resolveGlobBase(pageAudioModules, "/Bottom/Data/Quran/Qiraat/");
const ayahAudioBase = resolveGlobBase(ayahAudioModules, "/Bottom/Data/Quran/Qiraat/");
const wordAudioBase = resolveGlobBase(wordAudioModules, "/Bottom/Data/Quran/Qiraat/");
const surahTimestampBase = resolveGlobBase(surahTimestampModules, "/Bottom/Data/Quran/Qiraat/");
const ayahTimestampBase = resolveGlobBase(ayahTimestampModules, "/Bottom/Data/Quran/Qiraat/");

// ============= Loaders =============
async function loadSurah(surahId: number, fontType: QuranFontType = "Standard"): Promise<SurahData> {
  const key = `${fontType}-${surahId}`;
  if (cache.surah.has(key)) return cache.surah.get(key)!;

  let data: SurahData;
  switch (fontType) {
    case "V1":
      data = await import(`@/Bottom/Data/Quran/Surah/Glyph-Encoded/Positional-Forms/${surahId}.json`);
      break;
    case "V2":
      data = await import(`@/Bottom/Data/Quran/Surah/Glyph-Encoded/Ligatures/${surahId}.json`);
      break;
    default:
      data = await import(`@/Bottom/Data/Quran/Surah/${surahId}.json`);
      break;
  }
  cache.surah.set(key, data);
  return data;
}

async function loadTranslation(surahId: number, source: TranslationSource): Promise<TranslationData | null> {
  const key = `${source}-${surahId}`;
  if (cache.translation.has(key)) return cache.translation.get(key)!;
  try {
    const module = await import(`@/Bottom/Data/Quran/Surah/Translation/${source}/${surahId}.json`);
    const data: TranslationData = module.default ?? module;
    cache.translation.set(key, data);
    return data;
  } catch {
    return null;
  }
}

async function loadLayout(surahId: number): Promise<SurahLayout | null> {
  if (cache.layout.has(surahId)) return cache.layout.get(surahId)!;
  try {
    const module = await import(`@/Bottom/Data/Quran/Surah/Layout/${surahId}.json`);
    const raw = module.default ?? module;
    const data: SurahLayout = Array.isArray(raw) ? raw : null;
    cache.layout.set(surahId, data);
    return data;
  } catch {
    cache.layout.set(surahId, null);
    return null;
  }
}

// ============= Audio =============
export async function getSurahAudioUrl(surahId: number, reciter: string): Promise<string | null> {
  const key = `${surahAudioBase}/Bottom/Data/Quran/Qiraat/${reciter}/Surah/${surahId}/Audio.mp3`;
  const mod = surahAudioModules[key];
  if (!mod) return null;
  return (await (mod as () => Promise<string>)());
}

export async function getPageAudioUrl(pageNumber: number, reciter: string): Promise<string | null> {
  const key = `${pageAudioBase}/Bottom/Data/Quran/Qiraat/${reciter}/Page/${pageNumber}/Audio.mp3`;
  const mod = pageAudioModules[key];
  if (!mod) return null;
  return (await (mod as () => Promise<string>)());
}

export async function getAyahAudioUrl(surahId: number, ayahNumber: number, reciter: string): Promise<string | null> {
  const key = `${ayahAudioBase}/Bottom/Data/Quran/Qiraat/${reciter}/Surah/${surahId}/Ayah/${ayahNumber}/Audio.mp3`;
  const mod = ayahAudioModules[key];
  if (!mod) return null;
  return (await (mod as () => Promise<string>)());
}

export async function getWordAudioUrl(surahId: number, ayahNumber: number, kalimaNumber: number): Promise<string | null> {
  const key = `${wordAudioBase}/Bottom/Data/Quran/Qiraat/Tafsir_Center/Surah/${surahId}/Ayah/${ayahNumber}/Kalima/${kalimaNumber}/Audio.mp3`;
  const mod = wordAudioModules[key];
  if (!mod) return null;
  return (await (mod as () => Promise<string>)());
}

// ============= Timestamp Loaders =============
export async function getSurahTimestamps(surahId: number, reciter: string): Promise<string[][] | null> {
  const cacheKey = `${reciter}-surah-${surahId}`;
  if (cache.timestamps.has(cacheKey)) return cache.timestamps.get(cacheKey) as string[][] | null;
  try {
    const key = `${surahTimestampBase}/Bottom/Data/Quran/Qiraat/${reciter}/Surah/${surahId}/Timestamp.json`;
    const mod = surahTimestampModules[key];
    if (!mod) {
      cache.timestamps.set(cacheKey, null);
      return null;
    }
    const data = (await (mod as () => Promise<string[][]>))() as string[][];
    cache.timestamps.set(cacheKey, data);
    return data;
  } catch {
    cache.timestamps.set(cacheKey, null);
    return null;
  }
}

export async function getAyahTimestamps(surahId: number, ayahNumber: number, reciter: string): Promise<string[] | null> {
  const cacheKey = `${reciter}-surah-${surahId}-ayah-${ayahNumber}`;
  if (cache.timestamps.has(cacheKey)) return cache.timestamps.get(cacheKey) as string[] | null;
  try {
    const key = `${ayahTimestampBase}/Bottom/Data/Quran/Qiraat/${reciter}/Surah/${surahId}/Ayah/${ayahNumber}/Timestamp.json`;
    const mod = ayahTimestampModules[key];
    if (!mod) {
      cache.timestamps.set(cacheKey, null);
      return null;
    }
    const data = (await (mod as () => Promise<string[]>))() as string[];
    cache.timestamps.set(cacheKey, data);
    return data;
  } catch {
    cache.timestamps.set(cacheKey, null);
    return null;
  }
}

// ============= Main API =============
export async function getSurah(
  surahId: number,
  options: {
    translation?: TranslationSource;
    wbw?: boolean;
    fontType?: QuranFontType;
  } = {}
): Promise<AssembledSurah> {
  const fontType = options.fontType ?? "Standard";

  const [surahData, translationData, layoutData] = await Promise.all([
    loadSurah(surahId, fontType),
    options.translation || options.wbw
      ? loadTranslation(surahId, options.translation ?? "Direct")
      : Promise.resolve(null),
    loadLayout(surahId),
  ]);

  const verses: AssembledVerse[] = surahData.Ayah.map((arabic, index) => {
    const kalima = translationData?.Ayah[index]?.Kalima;
    return {
      verseNumber: index + 1,
      arabic,
      words: fontType === "V1" ? arabic.split("") : arabic.split(" "),
      ...(kalima && options.translation && { translation: kalima.join(" ") }),
      ...(kalima && options.wbw && { wbwTranslation: kalima }),
    };
  });

  return { id: surahId, verses, lines: layoutData ?? undefined };
}

export async function getVerse(
  surahId: number,
  verseNumber: number,
  options: {
    translation?: TranslationSource;
    wbw?: boolean;
    fontType?: QuranFontType;
  } = {}
): Promise<AssembledVerse | null> {
  const surah = await getSurah(surahId, options);
  return surah.verses[verseNumber - 1] ?? null;
}

export function getSurahMeta(surahId: number): SurahMeta | null {
  return surahList.find((s) => s.id === surahId) ?? null;
}

export function getJuzInfo(juzNumber: number): JuzInfo | null {
  return juzData.find((j) => j.juzNumber === juzNumber) ?? null;
}

export function getSurahsByRevelationOrder(): SurahMeta[] {
  return [...surahList].sort((a, b) => a.revelationOrder - b.revelationOrder);
}