import { levelLabel, LEVELS, type Level } from '@core/domain/schema.ts';
import { DAILY_GOAL_OPTIONS } from '@core/progress/models.ts';
import { Button, SegmentedControl } from '@ui/components/index.ts';
import { BlueprintCorners } from '@ui/components/Blueprint.tsx';
import type { AppController } from '@ui/app/useAppController.ts';

/** Step 1 — which subjects. Nothing else can be chosen until one is picked. */
export function OnboardingSubjects({ app }: { app: AppController }) {
  const picked = app.preferences.subjects;

  return (
    <div className="screen-flow">
      <div className="kicker">{app.t('onboarding.step', { current: 1, total: 3 })}</div>
      <h2 style={{ margin: '10px 0 6px', fontSize: 30 }}>{app.t('onboarding.subjects.title')}</h2>
      <p className="text-muted" style={{ fontSize: 13 }}>
        {app.t('onboarding.subjects.subtitle')}
      </p>

      <div className="stack" style={{ marginTop: 18 }}>
        {app.allSubjects.map((subject) => {
          const on = picked.includes(subject.id);
          return (
            <button
              key={subject.id}
              type="button"
              className={`surface subject-pick${on ? ' surface-selected' : ''}`}
              onClick={() => app.toggleSubject(subject.id)}
              aria-pressed={on}
              data-testid={`pick-${subject.id}`}
            >
              <span className="glyph-tile is-lg" aria-hidden="true">
                {subject.glyph}
              </span>
              <span className="subject-pick-body">
                <span className="subject-pick-name">{subject.name}</span>
                <span className="subject-pick-blurb text-muted">{subject.blurb}</span>
              </span>
              <span className={`checkmark${on ? ' is-on' : ''}`} aria-hidden="true">
                {on ? '✓' : ''}
              </span>
            </button>
          );
        })}
      </div>

      <div className="push-bottom">
        <Button
          variant="primary"
          block
          framed
          disabled={picked.length === 0}
          onClick={() => app.go({ name: 'onboarding-levels' })}
          data-testid="onboarding-continue"
        >
          {app.t('common.continue')}
        </Button>
      </div>
    </div>
  );
}

/** Step 2 — a level per subject, so one learner can be advanced in one and new in another. */
export function OnboardingLevels({ app }: { app: AppController }) {
  const picked = app.allSubjects.filter((s) => app.preferences.subjects.includes(s.id));

  return (
    <div className="screen-flow">
      <div className="kicker">{app.t('onboarding.step', { current: 2, total: 3 })}</div>
      <h2 style={{ margin: '10px 0 6px', fontSize: 30 }}>{app.t('onboarding.levels.title')}</h2>
      <p className="text-muted" style={{ fontSize: 13 }}>
        {app.t('onboarding.levels.subtitle')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 22 }}>
        {picked.map((subject) => {
          const level = app.preferences.subjectLevels[subject.id] ?? 'beginner';
          return (
            <div key={subject.id} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 17 }}>{subject.name}</span>
                <span className="text-muted" style={{ fontSize: 11, marginLeft: 'auto' }}>
                  {levelLabel(subject, level)}
                </span>
              </div>
              <SegmentedControl<Level>
                label={`${subject.name} level`}
                value={level}
                onChange={(next) => app.setLevel(subject.id, next)}
                options={LEVELS.map((value) => ({ value, label: levelLabel(subject, value) }))}
              />
            </div>
          );
        })}
      </div>

      <div className="push-bottom" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button variant="primary" block framed onClick={() => app.go({ name: 'onboarding-goal' })} data-testid="onboarding-continue">
          {app.t('common.continue')}
        </Button>
        <Button variant="ghost" block onClick={() => app.go({ name: 'onboarding-subjects' })}>
          {app.t('common.back')}
        </Button>
      </div>
    </div>
  );
}

/** Step 3 — the daily goal, in minutes. */
export function OnboardingGoal({ app }: { app: AppController }) {
  return (
    <div className="screen-flow">
      <div className="kicker">{app.t('onboarding.step', { current: 3, total: 3 })}</div>
      <h2 style={{ margin: '10px 0 6px', fontSize: 30 }}>{app.t('onboarding.goal.title')}</h2>
      <p className="text-muted" style={{ fontSize: 13 }}>
        {app.t('onboarding.goal.subtitle')}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
        {DAILY_GOAL_OPTIONS.map((minutes) => {
          const on = app.preferences.dailyGoalMinutes === minutes;
          return (
            <button
              key={minutes}
              type="button"
              className={`surface goal-card${on ? ' surface-selected' : ''}`}
              aria-pressed={on}
              onClick={() => app.setDailyGoal(minutes)}
              data-testid={`goal-${minutes}`}
            >
              <span className="goal-value" style={{ color: on ? 'var(--color-accent)' : undefined }}>
                {minutes}
              </span>
              <span className="goal-unit text-muted">{app.t('onboarding.goal.unit')}</span>
            </button>
          );
        })}
      </div>

      <div className="push-bottom" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button variant="primary" block framed onClick={() => app.go({ name: 'onboarding-ready' })} data-testid="onboarding-continue">
          {app.t('common.continue')}
        </Button>
        <Button variant="ghost" block onClick={() => app.go({ name: 'onboarding-levels' })}>
          {app.t('common.back')}
        </Button>
      </div>
    </div>
  );
}

export function OnboardingReady({ app }: { app: AppController }) {
  const count = app.preferences.subjects.length;
  const line = app.t('onboarding.ready.line', {
    subjects: app.tc('unit.subject', count),
    minutes: app.preferences.dailyGoalMinutes,
  });

  return (
    <div
      className="screen-flow"
      style={{ justifyContent: 'center', padding: '24px 24px 28px', textAlign: 'center' }}
    >
      <div
        className="blueprint"
        style={{ alignSelf: 'center', width: 96, height: 96, display: 'grid', placeItems: 'center', position: 'relative' }}
      >
        <BlueprintCorners />
        <div
          style={{
            width: 52,
            height: 52,
            border: '1px solid var(--color-accent)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: 22,
            color: 'var(--color-accent)',
          }}
        >
          ✓
        </div>
      </div>

      <h2 style={{ margin: '26px 0 8px', fontSize: 32 }}>{app.t('onboarding.ready.title')}</h2>
      <p className="text-muted" style={{ fontSize: 13.5, maxWidth: 280, alignSelf: 'center' }}>
        {line}
      </p>

      <div style={{ marginTop: 34 }}>
        <Button variant="primary" block framed onClick={app.completeOnboarding} data-testid="start-learning">
          {app.t('onboarding.ready.cta')}
        </Button>
      </div>
    </div>
  );
}
