/**
 * The translator.
 *
 * `t('home.streak')` returns a string; `t('home.daysAgo', { count: 3 })`
 * substitutes `{count}`; `tc('unit.lesson', 3)` picks the right plural form and
 * prefixes the number.
 *
 * Polish needs three plural forms where English needs two, which is why the
 * count is part of the lookup rather than something callers glue on afterwards.
 */
import type { Language } from '@core/domain/schema.ts';
import { UI_STRINGS, type UiKey } from './strings.ts';

export type { UiKey };

export type Params = Record<string, string | number>;

export interface Translator {
  readonly language: Language;
  /** Look up a string, substituting `{placeholders}`. */
  t: (key: UiKey, params?: Params) => string;
  /** Count plus the correctly inflected unit: "3 lekcje", "1 lesson". */
  tc: (key: UiKey, count: number, options?: { numberOnly?: boolean }) => string;
  /** Just the inflected unit, without the number. */
  unit: (key: UiKey, count: number) => string;
}

/**
 * Which plural form a count takes.
 *
 * English: 1 → first form, everything else → second.
 * Polish: 1 → first; 2–4 (but not 12–14) → second; the rest → third.
 */
export function pluralIndex(language: Language, count: number): number {
  const n = Math.abs(Math.trunc(count));
  if (language === 'pl') {
    if (n === 1) return 0;
    const lastTwo = n % 100;
    const last = n % 10;
    if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 1;
    return 2;
  }
  return n === 1 ? 0 : 1;
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** BCP-47 tag for `Intl`, which the app uses for dates and weekday letters. */
export function localeOf(language: Language): string {
  return language === 'pl' ? 'pl-PL' : 'en-GB';
}

/** Single-letter weekday labels, Monday first, in the interface language. */
export function weekdayLetters(language: Language): string[] {
  const formatter = new Intl.DateTimeFormat(localeOf(language), { weekday: 'narrow' });
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(Date.UTC(2024, 0, 1 + i))).toUpperCase());
}

export function createTranslator(language: Language): Translator {
  const lookup = (key: UiKey): string => {
    const entry = UI_STRINGS[key];
    // A missing translation falls back to English rather than showing the key.
    return entry[language] ?? entry.en;
  };

  const unit = (key: UiKey, count: number): string => {
    const forms = lookup(key).split('|');
    const index = Math.min(pluralIndex(language, count), forms.length - 1);
    return forms[index] ?? forms[0] ?? '';
  };

  return {
    language,
    t: (key, params) => interpolate(lookup(key), params),
    tc: (key, count, options) => (options?.numberOnly ? String(count) : `${count} ${unit(key, count)}`),
    unit,
  };
}
