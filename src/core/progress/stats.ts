/**
 * Derived statistics.
 *
 * Pure functions over `ProgressState` — no storage, no clock of their own
 * (the current time is always passed in), which is what makes them testable
 * and what keeps the Progress screen free of arithmetic.
 */
import type { ExerciseAttempt, LessonProgress, ProgressState, StudySession } from './models.ts';

export interface OverallStats {
  totalQuestions: number;
  correctAnswers: number;
  /** 0–100, rounded. */
  accuracy: number;
  completedLessons: number;
  studySeconds: number;
  /** Consecutive days up to and including today (or yesterday, if today is idle). */
  streakDays: number;
}

export interface SubjectStats {
  subjectId: string;
  answered: number;
  correct: number;
  accuracy: number;
  completedLessons: number;
  /** Share of the subject's known lessons that are completed, 0–100. */
  completionPercent: number;
  lastStudiedAt: string | null;
}

export interface TagStat {
  tag: string;
  answered: number;
  correct: number;
  accuracy: number;
  subjectIds: string[];
}

export interface DayActivity {
  /** Local date, YYYY-MM-DD. */
  date: string;
  /** 0 = Monday … 6 = Sunday. The UI turns this into a localised letter. */
  weekday: number;
  minutes: number;
  answered: number;
}

export function localDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function overallStats(state: ProgressState, now: Date = new Date()): OverallStats {
  const totalQuestions = state.attempts.length;
  const correctAnswers = state.attempts.filter((a) => a.correct).length;
  const studySeconds =
    state.sessions.reduce((sum, s) => sum + s.durationSeconds, 0) ||
    state.attempts.reduce((sum, a) => sum + a.durationSeconds, 0);

  return {
    totalQuestions,
    correctAnswers,
    accuracy: percent(correctAnswers, totalQuestions),
    completedLessons: state.lessons.filter((l) => l.status === 'completed').length,
    studySeconds,
    streakDays: streak(state.studyDays, now),
  };
}

/**
 * A streak survives today being empty — it only breaks once a full day has
 * passed with nothing answered. Counting from today otherwise would reset
 * everyone's streak to zero every midnight.
 */
export function streak(studyDays: string[], now: Date = new Date()): number {
  if (studyDays.length === 0) return 0;
  const days = new Set(studyDays);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(localDate(cursor))) cursor.setDate(cursor.getDate() - 1);

  let count = 0;
  while (days.has(localDate(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function subjectStats(state: ProgressState, lessonCountBySubject: Record<string, number>): SubjectStats[] {
  const bySubject = new Map<string, ExerciseAttempt[]>();
  for (const attempt of state.attempts) {
    const list = bySubject.get(attempt.subjectId) ?? [];
    list.push(attempt);
    bySubject.set(attempt.subjectId, list);
  }

  const subjectIds = new Set([...Object.keys(lessonCountBySubject), ...bySubject.keys()]);
  return [...subjectIds].map((subjectId) => {
    const attempts = bySubject.get(subjectId) ?? [];
    const correct = attempts.filter((a) => a.correct).length;
    const completed = state.lessons.filter((l) => l.subjectId === subjectId && l.status === 'completed').length;
    const total = lessonCountBySubject[subjectId] ?? 0;
    const lastStudiedAt = attempts.reduce<string | null>(
      (latest, a) => (latest === null || a.answeredAt > latest ? a.answeredAt : latest),
      null,
    );
    return {
      subjectId,
      answered: attempts.length,
      correct,
      accuracy: percent(correct, attempts.length),
      completedLessons: completed,
      completionPercent: percent(completed, total),
      lastStudiedAt,
    };
  });
}

/**
 * The weakest tags, which is what the Progress screen shows and what a
 * smarter review picker would eventually consume. Tags with very few attempts
 * are excluded: one wrong answer out of one is noise, not a weakness.
 */
export function weakestTags(state: ProgressState, options: { minAnswered?: number; limit?: number } = {}): TagStat[] {
  const minAnswered = options.minAnswered ?? 2;
  const limit = options.limit ?? 5;
  const stats = new Map<string, { answered: number; correct: number; subjects: Set<string> }>();

  for (const attempt of state.attempts) {
    for (const tag of attempt.tags) {
      const entry = stats.get(tag) ?? { answered: 0, correct: 0, subjects: new Set<string>() };
      entry.answered += 1;
      if (attempt.correct) entry.correct += 1;
      entry.subjects.add(attempt.subjectId);
      stats.set(tag, entry);
    }
  }

  return [...stats.entries()]
    .filter(([, s]) => s.answered >= minAnswered && s.correct < s.answered)
    .map(([tag, s]) => ({
      tag,
      answered: s.answered,
      correct: s.correct,
      accuracy: percent(s.correct, s.answered),
      subjectIds: [...s.subjects],
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered)
    .slice(0, limit);
}

/** The last `days` days ending today, oldest first — the Progress bar chart. */
export function weeklyActivity(state: ProgressState, now: Date = new Date(), days = 7): DayActivity[] {
  const buckets = new Map<string, { seconds: number; answered: number }>();

  for (const session of state.sessions) {
    const key = localDate(new Date(session.startedAt));
    const entry = buckets.get(key) ?? { seconds: 0, answered: 0 };
    entry.seconds += session.durationSeconds;
    entry.answered += session.numberOfExercises;
    buckets.set(key, entry);
  }
  /* Attempts from a session still in flight have no StudySession yet. */
  for (const attempt of state.attempts) {
    const key = localDate(new Date(attempt.answeredAt));
    if (!buckets.has(key)) buckets.set(key, { seconds: 0, answered: 0 });
  }

  const out: DayActivity[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = localDate(date);
    const entry = buckets.get(key) ?? { seconds: 0, answered: 0 };
    out.push({
      date: key,
      weekday: (date.getDay() + 6) % 7,
      minutes: Math.round(entry.seconds / 60),
      answered: entry.answered,
    });
  }
  return out;
}

export function minutesStudiedOn(state: ProgressState, date: Date): number {
  const key = localDate(date);
  const seconds = state.sessions
    .filter((s) => localDate(new Date(s.startedAt)) === key)
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  return Math.round(seconds / 60);
}

export function lessonProgressFor(state: ProgressState, lessonId: string): LessonProgress | null {
  return state.lessons.find((l) => l.lessonId === lessonId) ?? null;
}

export function recentSessions(state: ProgressState, limit = 10): StudySession[] {
  return [...state.sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, limit);
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.round((total % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes} min`;
  return `${total}s`;
}

function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}
