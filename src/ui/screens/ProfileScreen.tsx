import { LANGUAGES, LANGUAGE_NAMES, levelLabel, LEVELS, type Language, type Level } from '@core/domain/schema.ts';
import { overallStats } from '@core/progress/stats.ts';
import { Button, SegmentedControl, Tag, Toggle } from '@ui/components/index.ts';
import type { AppController } from '@ui/app/useAppController.ts';
import { StorageSection } from './StorageSection.tsx';

const languageOptions = LANGUAGES.map((value) => ({ value, label: LANGUAGE_NAMES[value] }));

export function ProfileScreen({ app }: { app: AppController }) {
  const stats = overallStats(app.progressState);
  const untranslated = app.services.content.untranslatedLessons(app.preferences.contentLanguage);

  return (
    <div className="app-scroll screen-tab">
      <h3 style={{ margin: '0 0 18px', fontSize: 26 }}>{app.t('profile.title')}</h3>

      <div className="profile-card">
        <span className="avatar" aria-hidden="true">
          R/O
        </span>
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 18 }}>
            {app.t('profile.localLearner')}
          </span>
          <span className="text-muted" style={{ fontSize: 11.5 }}>
            {app.t('profile.thisDevice', { streak: app.tc('unit.dayStreak', stats.streakDays) })}
          </span>
        </span>
      </div>

      <div className="section">
        <h6 style={{ margin: '0 0 8px' }}>{app.t('profile.language')}</h6>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="text-muted" style={{ fontSize: 12.5 }}>
              {app.t('profile.interfaceLanguage')}
            </span>
            <div data-testid="interface-language">
              <SegmentedControl<Language>
                label={app.t('profile.interfaceLanguage')}
                value={app.preferences.interfaceLanguage}
                onChange={app.setInterfaceLanguage}
                options={languageOptions}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="text-muted" style={{ fontSize: 12.5 }}>
              {app.t('profile.contentLanguage')}
            </span>
            <div data-testid="content-language">
              <SegmentedControl<Language>
                label={app.t('profile.contentLanguage')}
                value={app.preferences.contentLanguage}
                onChange={app.setContentLanguage}
                options={languageOptions}
              />
            </div>
            {untranslated.length > 0 ? (
              <span className="text-muted" style={{ fontSize: 11 }}>
                {app.t('profile.contentLanguageNote')}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="section">
        <h6 style={{ margin: '0 0 8px' }}>{app.t('profile.learning')}</h6>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {app.subjectViews.map((view) => (
            <div className="list-row" key={view.subject.id}>
              <span style={{ flex: 1 }}>{view.subject.name}</span>
              <Tag tone="accent">{view.levelName}</Tag>
            </div>
          ))}

          <div className="list-row">
            <span style={{ flex: 1 }}>{app.t('profile.dailyGoal')}</span>
            <span className="text-muted" style={{ fontSize: 12.5 }}>
              {app.t('home.goalPerDay', { minutes: app.preferences.dailyGoalMinutes })}
            </span>
            <Button variant="ghost" size="micro" onClick={() => app.go({ name: 'onboarding-goal' })}>
              {app.t('common.change')}
            </Button>
          </div>

          <div className="list-row">
            <span style={{ flex: 1 }}>{app.t('profile.reminders')}</span>
            <Toggle
              checked={app.preferences.remindersEnabled}
              onChange={app.setReminders}
              label={app.t('profile.remindersLabel')}
            />
          </div>
        </div>
      </div>

      {app.subjectViews.length > 0 ? (
        <div className="section">
          <h6 style={{ margin: '0 0 8px' }}>{app.t('profile.level')}</h6>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {app.subjectViews.map((view) => (
              <div key={view.subject.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12.5 }} className="text-muted">
                  {view.subject.name}
                </span>
                <SegmentedControl<Level>
                  label={`${view.subject.name} level`}
                  value={view.level}
                  onChange={(next) => app.setLevel(view.subject.id, next)}
                  options={LEVELS.map((value) => ({ value, label: levelLabel(view.subject, value) }))}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="section">
        <h6 style={{ margin: '0 0 8px' }}>{app.t('profile.appearance')}</h6>
        <SegmentedControl<'light' | 'dark'>
          label="Theme"
          value={app.theme}
          onChange={app.setTheme}
          options={[
            { value: 'light', label: app.t('theme.light') },
            { value: 'dark', label: app.t('theme.dark') },
          ]}
        />
      </div>

      <StorageSection app={app} />

      <div className="section">
        <h6 style={{ margin: '0 0 8px' }}>{app.t('profile.account')}</h6>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button type="button" className="list-row-button" onClick={app.restartOnboarding} data-testid="redo-onboarding">
            <span style={{ flex: 1, fontSize: 13.5 }}>{app.t('profile.redoOnboarding')}</span>
            <span className="text-muted" style={{ fontSize: 14 }} aria-hidden="true">
              →
            </span>
          </button>
          <button
            type="button"
            className="list-row-button"
            onClick={() => {
              if (window.confirm(app.t('profile.resetConfirm'))) app.resetProgress();
            }}
            data-testid="reset-progress"
          >
            <span style={{ flex: 1, fontSize: 13.5, color: 'var(--color-accent)' }}>{app.t('profile.resetProgress')}</span>
            <span className="text-muted" style={{ fontSize: 14 }} aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>

      <div className="build-stamp text-muted">Loop · v0.3</div>
    </div>
  );
}
