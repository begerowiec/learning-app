import type { Recommendation } from '@core/home/recommendation.ts';
import { overallStats, weeklyActivity } from '@core/progress/stats.ts';
import { Blueprint, Button, ProgressBar, SubjectRow } from '@ui/components/index.ts';
import { localeOf, weekdayLetters } from '@ui/i18n/index.ts';
import type { AppController } from '@ui/app/useAppController.ts';

/**
 * Home answers one question: what should I do right now? The recommendation
 * comes from `recommendNext`, so the priority rules are testable without a DOM
 * and this screen only renders the answer.
 */
export function HomeScreen({ app }: { app: AppController }) {
  const home = app.home;
  const stats = overallStats(app.progressState);
  const week = weeklyActivity(app.progressState);
  const recommendation: Recommendation = home?.recommendation ?? { kind: 'nothing_available' };

  const activeDays = week.filter((d) => d.minutes > 0 || d.answered > 0).length;
  const maxMinutes = Math.max(1, ...week.map((d) => d.minutes));
  const dueCount = home?.dueReviewCount ?? 0;
  const letters = weekdayLetters(app.language);

  const questionCount =
    recommendation.kind === 'continue_lesson' || recommendation.kind === 'next_lesson'
      ? recommendation.lesson.exerciseCount
      : dueCount;

  const onPrimary = () => {
    if (recommendation.kind === 'review') app.startReview();
    else if (recommendation.kind !== 'nothing_available') {
      app.go({ name: 'lesson-intro', lessonId: recommendation.lesson.lessonId });
    }
  };

  return (
    <div className="app-scroll screen-tab">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div>
          <div className="kicker">{todayLabel(app.language)}</div>
          <h3 style={{ margin: '6px 0 0', fontSize: 26 }}>{greeting(app)}</h3>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div className="metric" style={{ fontSize: 20 }} data-testid="streak">
            {stats.streakDays}
          </div>
          <div className="metric-label text-muted">{app.unit('unit.dayStreak', stats.streakDays)}</div>
        </div>
      </div>

      <Blueprint className="continue-card" style={{ marginTop: 22 }}>
        <div className="continue-head">
          <span className="continue-label">
            {recommendation.kind === 'review' ? app.t('home.readyToReview') : app.t('home.continueLearning')}
          </span>
          <span className="continue-meta text-muted">
            {recommendation.kind === 'continue_lesson' || recommendation.kind === 'next_lesson'
              ? app.t('home.minutesShort', { count: recommendation.lesson.estimatedMinutes })
              : app.t('home.itemsShort', { count: dueCount })}
          </span>
        </div>
        <div className="continue-title" data-testid="continue-title">
          {title(recommendation, app)}
        </div>
        <div className="continue-sub text-muted">{subtitle(recommendation, app)}</div>
        <div style={{ margin: '14px 0' }}>
          <ProgressBar
            percent={recommendation.kind === 'continue_lesson' ? recommendation.progressPercent : 0}
            label="Lesson progress"
          />
        </div>
        <Button
          variant="primary"
          block
          onClick={onPrimary}
          disabled={recommendation.kind === 'nothing_available'}
          data-testid="continue-cta"
        >
          {cta(recommendation, app)}
        </Button>
      </Blueprint>

      <div className="section">
        <div className="section-head">
          <h5>{app.t('home.todaysLearning')}</h5>
          <span className="section-note text-muted">
            {app.t('home.goalPerDay', { minutes: app.preferences.dailyGoalMinutes })}
          </span>
        </div>
        <div className="plan-grid">
          <PlanCell value={recommendation.kind === 'nothing_available' ? 0 : 1} label={app.t('home.plan.lesson')} />
          <PlanCell value={questionCount} label={app.t('home.plan.questions')} />
          <PlanCell value={dueCount} label={app.t('home.plan.reviews')} />
        </div>
      </div>

      {dueCount > 0 ? (
        <button type="button" className="surface review-row" style={{ marginTop: 14 }} onClick={app.startReview} data-testid="review-row">
          <span className="review-count">{dueCount}</span>
          <span className="review-copy">
            <strong>{app.t('home.review.title')}</strong>
            <span className="text-muted">
              {app.t('home.review.sub', { minutes: Math.max(1, Math.round(dueCount * 0.4)) })}
            </span>
          </span>
          <span className="row-arrow" aria-hidden="true">
            →
          </span>
        </button>
      ) : null}

      <div className="section">
        <h5 style={{ margin: '0 0 10px', fontSize: 15 }}>{app.t('home.yourSubjects')}</h5>
        <div className="stack stack-tight">
          {app.subjectViews.map((view) => (
            <SubjectRow
              key={view.subject.id}
              view={view}
              lastLine={lastLine(view.lastStudiedAt, app)}
              onOpen={() => app.go({ name: 'subject', subjectId: view.subject.id })}
            />
          ))}
        </div>
      </div>

      <div className="week-strip">
        {week.map((day) => (
          <span key={day.date} className="week-day">
            <span
              className={`week-bar${day.minutes > 0 ? ' is-on' : ''}`}
              style={{ height: `${Math.max(4, Math.round((day.minutes / maxMinutes) * 24))}px` }}
            />
            <span className="week-label text-muted">{letters[day.weekday]}</span>
          </span>
        ))}
        <span style={{ marginLeft: 6, textAlign: 'right' }}>
          <span className="metric" style={{ display: 'block', fontSize: 15 }}>
            {activeDays} / 7
          </span>
          <span className="metric-label text-muted" style={{ display: 'block' }}>
            {app.t('home.thisWeek')}
          </span>
        </span>
      </div>
    </div>
  );
}

function PlanCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="plan-cell">
      <div className="plan-value">{value}</div>
      <div className="plan-label text-muted">{label}</div>
    </div>
  );
}

function title(recommendation: Recommendation, app: AppController): string {
  switch (recommendation.kind) {
    case 'continue_lesson':
    case 'next_lesson':
      return recommendation.lesson.title;
    case 'review':
      return app.t('home.reviewSession');
    case 'nothing_available':
      return app.t('home.nothingQueued');
  }
}

function subtitle(recommendation: Recommendation, app: AppController): string {
  switch (recommendation.kind) {
    case 'continue_lesson':
    case 'next_lesson':
      return `${recommendation.lesson.subjectName} · ${recommendation.lesson.moduleTitle}`;
    case 'review':
      return app.t('home.review.subtitle');
    case 'nothing_available':
      return app.t('home.pickSubject');
  }
}

function cta(recommendation: Recommendation, app: AppController): string {
  switch (recommendation.kind) {
    case 'continue_lesson':
      return app.t('cta.continue');
    case 'review':
      return app.t('cta.startReview');
    case 'next_lesson':
      return app.t('cta.startLesson');
    case 'nothing_available':
      return app.t('cta.allCaughtUp');
  }
}

function greeting(app: AppController, now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return app.t('home.greeting.morning');
  if (hour < 18) return app.t('home.greeting.afternoon');
  return app.t('home.greeting.evening');
}

function todayLabel(language: Parameters<typeof localeOf>[0], now: Date = new Date()): string {
  return now
    .toLocaleDateString(localeOf(language), { weekday: 'long', day: 'numeric', month: 'short' })
    .replace(',', ' ·');
}

function lastLine(lastStudiedAt: string | null, app: AppController): string {
  if (!lastStudiedAt) return app.t('home.notStarted');
  const days = Math.floor((Date.now() - Date.parse(lastStudiedAt)) / 86_400_000);
  if (days <= 0) return app.t('home.today');
  if (days === 1) return app.t('home.yesterday');
  return app.t('home.daysAgo', { count: days });
}
