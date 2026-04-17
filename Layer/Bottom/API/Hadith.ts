// Bottom/API/Hadith/index.ts

export interface Hadith {
  id: number;
  arabic: string;
  transliteration: string | string[]; // can be array (word-by-word) or string
  translation: string;
  wbw?: string[];
  narrator: string;
}

export interface HadithChapter {
  id: string;
  name: string;
  arabicName?: string;
  hadithRange: string;
  hadithCount: number;
  hadiths: Hadith[];
}

export interface HadithChapterMeta {
  id: string;
  name: string;
  arabicName?: string;
  hadithRange: string;
  hadithCount: number;
}

export interface HadithCollection {
  id: string;
  slug: string;
  name: string;
  arabicName: string;
  author: string;
  hadithCount: number;
  description: string;
}

// Helper: format chapter name from folder name
function formatNameFromId(id: string): string {
  return id
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper: compute hadith range from list
function getHadithRange(hadiths: Hadith[]): string {
  const numbers = hadiths.map(h => h.id);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return `${min}-${max}`;
}

// Parse a single hadith JSON file (new format: no outer array, filename = id)
function parseHadithFile(id: number, data: any[]): Hadith {
  // data: [arabic, transliteration (string|array), translation, wbw? (array), narrator]
  const transliteration = data[1];
  const hasWbw = Array.isArray(data[3]);
  if (hasWbw) {
    return {
      id,
      arabic: data[0],
      transliteration,
      translation: data[2],
      wbw: data[3],
      narrator: data[4],
    };
  } else {
    return {
      id,
      arabic: data[0],
      transliteration,
      translation: data[2],
      narrator: data[3],
    };
  }
}

// Eagerly import all hadith JSON files from subfolders
const allHadithFiles = import.meta.glob('@/Bottom/Data/Hadith/Sahih/al-Bukhari/*/*.json', { eager: true });

// Build chapter data: map chapterId -> { hadiths, name, range, count }
const chaptersData: Record<string, { hadiths: Hadith[]; name: string; range: string; count: number }> = {};

// Group files by chapter folder
for (const [path, module] of Object.entries(allHadithFiles)) {
  const match = path.match(/\/al-Bukhari\/([^/]+)\/(\d+)\.json$/);
  if (!match) continue;
  const chapterId = match[1];
  const hadithId = parseInt(match[2], 10);
  const data = (module as { default: any[] }).default;
  const hadith = parseHadithFile(hadithId, data);

  if (!chaptersData[chapterId]) {
    chaptersData[chapterId] = { hadiths: [], name: formatNameFromId(chapterId), range: '', count: 0 };
  }
  chaptersData[chapterId].hadiths.push(hadith);
}

// After collecting all hadiths, sort each chapter's hadiths by id and compute range/count
for (const chapterId in chaptersData) {
  const chapter = chaptersData[chapterId];
  chapter.hadiths.sort((a, b) => a.id - b.id);
  chapter.range = getHadithRange(chapter.hadiths);
  chapter.count = chapter.hadiths.length;
}

// Build BUKHARI_CHAPTERS in the expected format
const BUKHARI_CHAPTERS: Record<string, HadithChapter> = {};
for (const [id, data] of Object.entries(chaptersData)) {
  BUKHARI_CHAPTERS[id] = {
    id,
    name: data.name,
    hadithRange: data.range,
    hadithCount: data.count,
    hadiths: data.hadiths,
  };
}

// Collections (unchanged)
export const hadithCollections: HadithCollection[] = [
  {
    id: "bukhari",
    slug: "Sahih-al-Bukhari",
    name: "Sahih al-Bukhari",
    arabicName: "صحيح البخاري",
    author: "Imam Bukhari",
    hadithCount: 7563,
    description: "The most authentic collection of Hadith compiled by Imam Bukhari",
  },
];

export function getCollection(identifier: string): HadithCollection | null {
  return hadithCollections.find(c => c.id === identifier || c.slug === identifier) ?? null;
}

export function getChaptersByCollection(identifier: string): HadithChapterMeta[] {
  const collection = getCollection(identifier);
  if (!collection || collection.id !== "bukhari") return [];
  return Object.values(BUKHARI_CHAPTERS).map(({ id, name, hadithRange, hadithCount }) => ({
    id, name, hadithRange, hadithCount,
  }));
}

export function getChapter(collectionIdentifier: string, chapterId: string): HadithChapter | null {
  const collection = getCollection(collectionIdentifier);
  if (!collection || collection.id !== "bukhari") return null;
  return BUKHARI_CHAPTERS[chapterId] ?? null;
}

export function getHadithsByChapter(collectionIdentifier: string, chapterId: string): Hadith[] {
  return getChapter(collectionIdentifier, chapterId)?.hadiths ?? [];
}

// Helper: get full transliteration string (for components)
export function getFullTransliteration(hadith: Hadith): string {
  if (Array.isArray(hadith.transliteration)) {
    return hadith.transliteration.join(" ");
  }
  return hadith.transliteration;
}