import { formatDuration } from '@core/progress/stats.ts';
import { Blueprint, Button, Tag } from '@ui/components/index.ts';
import type { AppController } from '@ui/app/useAppController.ts';

/**
 * What just happened, and what it cost you.
 *
 * Everything wrong in this session is already in the review queue by the time
 * this screen renders — the "Worth reviewing" list is a readout of that, not a
 * separate mechanism.
 */
export function SummaryScreen({ app }: { app: AppController }) {
  const summary = app.summary;
  if (!summary) return null;

  return (
    <div className="app-scroll" style={{ padding: '56px 22px 26px', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="kicker">{summary.kicker}</div>
      <h2 style={{ margin: '8px 0 18px', fontSize: 34 }}>{summary.title}</h2>

      <Blueprint className="summary-card">
        <div className="summary-score" data-testid="summary-score">
          {summary.correct} / {summary.total}
        </div>
        <div className="text-muted" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
          {app.t('summary.correct')}
        </div>
        <div className="summary-stats">
          <SummaryStat label={app.t('summary.accuracy')} value={`${summary.accuracy}%`} />
          <SummaryStat label={app.t('summary.time')} value={formatDuration(summary.durationSeconds)} />
          <SummaryStat label={app.t('summary.xp')} value={`+${summary.correct * 10}`} />
        </div>
      </Blueprint>

      <div style={{ marginTop: 22 }}>
        <h5 style={{ margin: '0 0 9px', fontSize: 14 }}>
          {summary.kind === 'review' ? app.t('summary.reviewed') : app.t('summary.practised')}
        </h5>
        <div className="tag-row">
          {summary.practised.map((topic) => (
            <Tag key={topic} tone="accent">
              {topic}
            </Tag>
          ))}
        </div>
      </div>

      {summary.weak.length > 0 ? (
        <div style={{ marginTop: 20 }}>
          <h5 style={{ margin: '0 0 9px', fontSize: 14 }}>{app.t('summary.worthReviewing')}</h5>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {summary.weak.map((topic) => (
              <div className="weak-row" key={topic}>
                <span className="weak-dot" aria-hidden="true" />
                <span style={{ fontSize: 13.5 }}>{topic}</span>
                <span className="text-muted" style={{ marginLeft: 'auto', fontSize: 11 }}>
                  {app.t('summary.addedToReview')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="push-bottom" style={{ paddingTop: 26, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button variant="primary" block framed onClick={() => app.goTab('Home')} data-testid="summary-continue">
          {app.t('home.continueLearning')}
        </Button>
        <Button variant="secondary" block size="sm" onClick={() => app.goTab('Home')}>
          {app.t('summary.backHome')}
        </Button>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-stat">
      <div className="summary-stat-value">{value}</div>
      <div className="metric-label text-muted">{label}</div>
    </div>
  );
}
