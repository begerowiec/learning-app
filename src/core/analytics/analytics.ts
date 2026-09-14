/**
 * Analytics as a typed event bus.
 *
 * No provider is wired up in the MVP — the default sink does nothing in
 * production and logs in development. The point is that every interesting
 * moment already emits a well-named, well-typed event, so adding PostHog,
 * Amplitude or a backend endpoint later is one `setAnalyticsSink` call rather
 * than an archaeology expedition through the UI.
 */
export interface AnalyticsEventMap {
  lesson_started: { lessonId: string; subjectId: string; moduleId: string; level: string };
  lesson_completed: {
    lessonId: string;
    subjectId: string;
    correct: number;
    incorrect: number;
    durationSeconds: number;
  };
  exercise_answered: {
    exerciseId: string;
    lessonId: string;
    subjectId: string;
    type: string;
    difficulty: number;
    tags: string[];
    correct: boolean;
    durationSeconds: number;
    attempts: number;
  };
  review_started: { itemCount: number };
  review_completed: { itemCount: number; correct: number; durationSeconds: number };
  subject_selected: { subjectId: string; source: 'onboarding' | 'learn' | 'home' };
  level_changed: { subjectId: string; level: string; previousLevel: string | null };
  onboarding_completed: { subjects: string[]; dailyGoalMinutes: number };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export interface AnalyticsEvent<K extends AnalyticsEventName = AnalyticsEventName> {
  name: K;
  properties: AnalyticsEventMap[K];
  timestamp: string;
}

export type AnalyticsSink = (event: AnalyticsEvent) => void;

const recent: AnalyticsEvent[] = [];
const RECENT_LIMIT = 200;

let sink: AnalyticsSink = (event) => {
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    console.debug('[analytics]', event.name, event.properties);
  }
};

export function setAnalyticsSink(next: AnalyticsSink): void {
  sink = next;
}

export function track<K extends AnalyticsEventName>(name: K, properties: AnalyticsEventMap[K]): void {
  const event: AnalyticsEvent = { name, properties, timestamp: new Date().toISOString() } as AnalyticsEvent;
  recent.push(event);
  if (recent.length > RECENT_LIMIT) recent.shift();
  try {
    sink(event);
  } catch (error) {
    console.warn('[analytics] sink threw', error);
  }
}

/** The in-memory tail, for debugging and for the e2e tests to assert on. */
export function recentEvents(): readonly AnalyticsEvent[] {
  return recent;
}
