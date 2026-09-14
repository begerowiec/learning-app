import { formatDuration, overallStats, subjectStats, weakestTags, weeklyActivity } from '@core/progress/stats.ts';
import { StatCard } from '@ui/components/index.ts';
import { ProgressBar } from '@ui/components/ProgressBar.tsx';
import { weekdayLetters } from '@ui/i18n/index.ts';
import type { AppController } from '@ui/app/useAppController.ts';

/**
 * The readout of everything the attempt log knows. No numbers are stored for
 * this screen — they are all derived, so they cannot drift from the answers.
 */
export function ProgressScreen({ app }: { app: AppController }) {
  const state = app.progressState;
  const stats = overallStats(state);
  const week = weeklyActivity(state);
  const weak = weakestTags(state, { limit: 5 });
  const maxMinutes = Math.max(1, ...week.map((d) => d.minutes));
  const letters = weekdayLetters(app.language);

  const lessonCounts: Record<string, number> = {};
  for (const view of app.subjectViews) lessonCounts[view.subject.id] = view.lessonCount;
  const perSubject = subjectStats(state, lessonCounts);
  const subjectName = (id: string) => app.subjectViews.find((v) => v.subject.id === id)?.subject.name ?? id;

  const mastered = masteredTagCount(state);
  const weekMinutes = week.reduce((n, d) => n + d.minutes, 0);

  return (
    <div className="app-scroll screen-tab">
      <h3 className="screen-title">{app.t('progress.title')}</h3>
      <p className="screen-subtitle text-muted">{app.t('progress.last7')}</p>

      <div className="chart-card">
        <div className="section-head">
          <h5 style={{ fontSize: 14 }}>{app.t('progress.weeklyActivity')}</h5>
          <span className="section-note text-muted">{app.t('progress.minThisWeek', { count: weekMinutes })}</span>
        </div>
        <div className="chart">
          {week.map((day) => (
            <span className="chart-col" key={day.date}>
              <span className="chart-value text-muted">{day.minutes || ''}</span>
              <span
                className={`week-bar${day.minutes > 0 ? ' is-on' : ''}`}
                style={{ height: `${Math.max(3, Math.round((day.minutes / maxMinutes) * 80))}px` }}
              />
              <span className="week-label text-muted">{letters[day.weekday]}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label={app.t('progress.studyTime')} value={formatDuration(stats.studySeconds)} sub={app.t('progress.studyTimeSub')} />
        <StatCard label={app.t('progress.questions')} value={String(stats.totalQuestions)} sub={app.t('progress.questionsSub')} />
        <StatCard label={app.t('progress.accuracy')} value={`${stats.accuracy}%`} sub={app.t('progress.accuracySub')} />
        <StatCard label={app.t('progress.mastered')} value={String(mastered)} sub={app.t('progress.masteredSub')} />
      </div>

      <div className="section">
        <h5 style={{ margin: '0 0 10px', fontSize: 15 }}>{app.t('progress.subjects')}</h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {perSubject.map((entry) => (
            <div key={entry.subjectId}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{subjectName(entry.subjectId)}</span>
                <span className="metric" style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--color-accent)' }}>
                  {entry.completionPercent}%
                </span>
              </div>
              <div style={{ marginTop: 6 }}>
                <ProgressBar percent={entry.completionPercent} label={`${subjectName(entry.subjectId)} completion`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h5>{app.t('progress.weakAreas')}</h5>
          <span className="section-note text-muted">{app.t('progress.feedsReviews')}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
          {weak.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 12.5, marginTop: 8 }}>
              {app.t('progress.noWeak')}
            </p>
          ) : (
            weak.map((tag) => (
              <button key={tag.tag} type="button" className="list-row-button" onClick={app.startReview}>
                <span className="weak-accuracy">{tag.accuracy}%</span>
                <span style={{ flex: 1, fontSize: 13.5 }}>{humanTag(tag.tag)}</span>
                <span className="text-muted" style={{ fontSize: 11 }}>
                  {tag.subjectIds.map(subjectName).join(', ')}
                </span>
                <span style={{ color: 'var(--color-accent)', fontSize: 14 }} aria-hidden="true">
                  →
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/** A tag counts as mastered at 80%+ accuracy over at least two attempts. */
function masteredTagCount(state: Parameters<typeof overallStats>[0]): number {
  const byTag = new Map<string, { answered: number; correct: number }>();
  for (const attempt of state.attempts) {
    for (const tag of attempt.tags) {
      const entry = byTag.get(tag) ?? { answered: 0, correct: 0 };
      entry.answered += 1;
      if (attempt.correct) entry.correct += 1;
      byTag.set(tag, entry);
    }
  }
  return [...byTag.values()].filter((s) => s.answered >= 2 && s.correct / s.answered >= 0.8).length;
}

function humanTag(tag: string): string {
  return tag.replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase());
}
