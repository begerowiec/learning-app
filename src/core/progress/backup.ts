/**
 * Manual backup: the one guarantee no browser can take away.
 *
 * The mirror and persistent-storage request make eviction unlikely, not
 * impossible — and neither helps someone moving to a new phone, since the app
 * has no backend to sync through. A plain JSON file does both: the learner
 * keeps it wherever they keep files, and importing it on another device
 * restores the same history. Exercise ids are stable across languages and
 * content updates, so a backup stays valid after the catalogue changes.
 *
 * Imports are validated with the same schema as stored progress. A file that
 * is hand-edited, truncated or simply not ours is rejected with a reason
 * rather than half-applied.
 */
import {
  parseUserPreferences,
  ProgressStateSchema,
  type ProgressState,
  type UserPreferences,
} from './models.ts';

export const BACKUP_FORMAT = 'loop.backup';
export const BACKUP_VERSION = 1;

export interface Backup {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  progress: ProgressState;
  preferences: UserPreferences;
}

/** What the file contains, in terms the learner can recognise before restoring. */
export interface BackupSummary {
  exportedAt: string;
  answers: number;
  lessonsCompleted: number;
  studyDays: number;
}

export type BackupProblem = 'unreadable' | 'notABackup' | 'unsupportedVersion' | 'invalidProgress';

export type BackupParseResult =
  | { ok: true; backup: Backup; summary: BackupSummary }
  | { ok: false; problem: BackupProblem };

export function createBackup(
  progress: ProgressState,
  preferences: UserPreferences,
  now: Date = new Date(),
): Backup {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    progress,
    preferences,
  };
}

/** Pretty-printed on purpose: a backup someone can open and read is easier to trust. */
export function serializeBackup(backup: Backup): string {
  return `${JSON.stringify(backup, null, 2)}\n`;
}

export function parseBackup(text: string): BackupParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, problem: 'unreadable' };
  }

  if (typeof raw !== 'object' || raw === null) return { ok: false, problem: 'notABackup' };
  const record = raw as Record<string, unknown>;
  if (record.format !== BACKUP_FORMAT) return { ok: false, problem: 'notABackup' };
  if (typeof record.version !== 'number' || record.version > BACKUP_VERSION) {
    return { ok: false, problem: 'unsupportedVersion' };
  }

  const parsed = ProgressStateSchema.safeParse(record.progress);
  if (!parsed.success) return { ok: false, problem: 'invalidProgress' };

  const backup: Backup = {
    format: BACKUP_FORMAT,
    version: record.version,
    exportedAt: typeof record.exportedAt === 'string' ? record.exportedAt : new Date().toISOString(),
    progress: parsed.data,
    preferences: parseUserPreferences(record.preferences),
  };

  return { ok: true, backup, summary: summarize(backup) };
}

export function summarize(backup: Backup): BackupSummary {
  return {
    exportedAt: backup.exportedAt,
    answers: backup.progress.attempts.length,
    lessonsCompleted: backup.progress.lessons.filter((lesson) => lesson.status === 'completed').length,
    studyDays: backup.progress.studyDays.length,
  };
}

/** `loop-backup-2026-09-15.json` — sortable, and obvious a year later. */
export function backupFilename(now: Date = new Date()): string {
  const iso = now.toISOString().slice(0, 10);
  return `loop-backup-${iso}.json`;
}
