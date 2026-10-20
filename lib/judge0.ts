import { CODING_LANGUAGES, type CodingLanguage } from "@/lib/codingChallenges";

const JUDGE0_BASE_URL = (process.env.JUDGE0_API_URL?.trim() || "https://ce.judge0.com").replace(/\/+$/, "");
let languageCache: { expiresAt: number; ids: Partial<Record<CodingLanguage, number>> } | null = null;

export function getJudge0BaseUrl() {
  return JUDGE0_BASE_URL;
}

export async function judge0Fetch(path: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body) headers.set("Content-Type", "application/json");
    if (process.env.JUDGE0_AUTH_TOKEN) {
      headers.set(process.env.JUDGE0_AUTH_HEADER?.trim() || "X-Auth-Token", process.env.JUDGE0_AUTH_TOKEN);
    }

    return await fetch(`${JUDGE0_BASE_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getJudge0LanguageIds() {
  if (languageCache && languageCache.expiresAt > Date.now()) return languageCache.ids;

  const response = await judge0Fetch("/languages/");
  if (!response.ok) throw new Error("Judge0 languages unavailable");
  const languages = (await response.json()) as { id: number; name: string }[];
  const ids: Partial<Record<CodingLanguage, number>> = {};

  for (const language of CODING_LANGUAGES) {
    const candidates = languages.filter((entry) => language.judgePattern.test(entry.name));
    const preferred = candidates.find((entry) => entry.name.startsWith(language.preferred));
    const selected = preferred ?? candidates[candidates.length - 1];
    if (selected) ids[language.id] = selected.id;
  }

  languageCache = { ids, expiresAt: Date.now() + 10 * 60 * 1000 };
  return ids;
}
