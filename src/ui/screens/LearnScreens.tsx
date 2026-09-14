import { useEffect, useState } from 'react';
import type { SubjectView } from '@core/LearningService.ts';
import { levelLabel, LEVELS, type Level } from '@core/domain/schema.ts';
import { BackLink, LessonCard, ModuleCard, ProgressBar, SegmentedControl, SubjectCard } from '@ui/components/index.ts';
import type { AppController } from '@ui/app/useAppController.ts';

/** The Learn tab: every subject the learner picked. */
export function LearnScreen({ app }: { app: AppController }) {
  return (
    <div className="app-scroll screen-tab">
      <h3 className="screen-title">{app.t('learn.title')}</h3>
      <p className="screen-subtitle text-muted">{app.t('learn.subtitle')}</p>

      <div className="stack" style={{ marginTop: 18 }}>
        {app.subjectViews.map((view) => (
          <SubjectCard
            key={view.subject.id}
            view={view}
            tr={app}
            onOpen={() => app.go({ name: 'subject', subjectId: view.subject.id })}
          />
        ))}
      </div>

      <div className="placeholder-box text-muted">{app.t('learn.moreComing')}</div>
    </div>
  );
}

/** One subject: its level switch and the modules that level unlocks. */
export function SubjectScreen({ app, subjectId }: { app: AppController; subjectId: string }) {
  const view = useSubjectView(app, subjectId);
  if (!view) return <LoadingScreen app={app} />;

  return (
    <div className="app-scroll screen-detail">
      <div className="screen-detail-header">
        <BackLink label={app.t('common.back')} onClick={app.back} />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <div className="kicker">{app.t('learn.subject')}</div>
            <h3 style={{ margin: '6px 0 0', fontSize: 30 }}>{view.subject.name}</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="metric" style={{ fontSize: 26 }}>
              {view.percent}%
            </div>
            <div className="metric-label text-muted">{app.t('learn.complete')}</div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <ProgressBar percent={view.percent} label={`${view.subject.name} progress`} />
        </div>

        <div style={{ marginTop: 18 }}>
          <SegmentedControl<Level>
            label={`${view.subject.name} level`}
            value={view.level}
            onChange={(next) => app.setLevel(view.subject.id, next)}
            options={LEVELS.map((value) => ({ value, label: levelLabel(view.subject, value) }))}
          />
        </div>
      </div>

      <div className="screen-detail-body">
        <div className="section-head">
          <h5>{app.t('learn.modules')}</h5>
          <span className="section-note text-muted">{view.levelName}</span>
        </div>
        <div className="stack" style={{ marginTop: 12 }}>
          {view.modules.map((moduleView) => (
            <ModuleCard
              key={moduleView.module.id}
              view={moduleView}
              tr={app}
              onOpen={() => app.go({ name: 'module', subjectId: view.subject.id, moduleId: moduleView.module.id })}
            />
          ))}
          {view.modules.length === 0 ? <div className="placeholder-box text-muted">{app.t('learn.noModules')}</div> : null}
        </div>
      </div>
    </div>
  );
}

/** One module: its lessons, in order. */
export function ModuleScreen({ app, subjectId, moduleId }: { app: AppController; subjectId: string; moduleId: string }) {
  const view = useSubjectView(app, subjectId);
  const moduleView = view?.modules.find((m) => m.module.id === moduleId);
  if (!view || !moduleView) return <LoadingScreen app={app} />;

  const meta = `${app.tc('unit.lesson', moduleView.lessons.length)} · ${view.subject.name} · ${view.levelName}`;

  return (
    <div className="app-scroll screen-detail">
      <div className="screen-detail-header">
        <BackLink label={view.subject.name} onClick={app.back} />
        <h3 style={{ margin: '8px 0 4px', fontSize: 28 }}>{moduleView.module.title}</h3>
        <p className="text-muted" style={{ fontSize: 12.5, margin: 0 }}>
          {meta}
        </p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {moduleView.lessons.map((lessonView, index) => (
            <LessonCard
              key={lessonView.lesson.id}
              view={lessonView}
              index={index}
              tr={app}
              onOpen={() => app.go({ name: 'lesson-intro', lessonId: lessonView.lesson.id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Subject views come from the service rather than from props so that a level
 * or content-language change re-reads the catalogue instead of filtering a
 * stale snapshot.
 */
function useSubjectView(app: AppController, subjectId: string): SubjectView | null {
  const [view, setView] = useState<SubjectView | null>(null);

  useEffect(() => {
    let cancelled = false;
    void app.services.learning.getSubjectView(subjectId).then((next) => {
      if (!cancelled) setView(next);
    });
    return () => {
      cancelled = true;
    };
  }, [app.services.learning, subjectId, app.preferences, app.progressState]);

  return view;
}

export function LoadingScreen({ app }: { app: AppController }) {
  return (
    <div className="app-scroll screen-tab">
      <p className="text-muted" style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11 }}>
        {app.t('common.loading')}
      </p>
    </div>
  );
}
