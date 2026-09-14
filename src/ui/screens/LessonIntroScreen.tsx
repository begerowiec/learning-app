import { useEffect, useState } from 'react';
import type { Lesson, Subject } from '@core/domain/schema.ts';
import { BackLink, Button, CodeBlock, Tag } from '@ui/components/index.ts';
import type { AppController } from '@ui/app/useAppController.ts';
import { LoadingScreen } from './LearnScreens.tsx';

/**
 * The knowledge cards shown before practice. Content blocks are rendered by
 * their `type`, so a lesson can mix prose, code examples and callouts without
 * this screen knowing anything about the subject.
 */
export function LessonIntroScreen({ app, lessonId }: { app: AppController; lessonId: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const language = app.preferences.contentLanguage;
  const localized = app.services.content.isLessonLocalized(lessonId, language);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await app.services.content.getLesson(lessonId, language);
      if (cancelled || !next) return;
      setLesson(next);
      const [subj, mod] = await Promise.all([
        app.services.content.getSubject(next.subject, language),
        app.services.content.getModule(next.module, language),
      ]);
      if (cancelled) return;
      setSubject(subj);
      setModuleTitle(mod?.title ?? '');
    })();
    return () => {
      cancelled = true;
    };
  }, [app.services.content, lessonId, language]);

  if (!lesson) return <LoadingScreen app={app} />;

  return (
    <div className="screen">
      <div className="app-scroll" style={{ padding: '52px 22px 20px' }}>
        <BackLink label={moduleTitle || app.t('common.back')} onClick={app.back} />
        <div className="kicker" style={{ marginTop: 10 }}>
          {app.t('lessonIntro.kicker', { subject: subject?.name ?? lesson.subject })}
        </div>
        <h2 style={{ margin: '8px 0 14px', fontSize: 32 }}>{lesson.title}</h2>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag>{app.t('home.minutesShort', { count: lesson.estimatedMinutes })}</Tag>
          <Tag>{app.tc('unit.question', lesson.exercises.length)}</Tag>
          {localized ? null : (
            <Tag tone="outline">
              <abbr title={app.t('app.englishFallbackTitle')} style={{ textDecoration: 'none' }}>
                {app.t('app.englishFallback')}
              </abbr>
            </Tag>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
          {lesson.content.map((block, index) => (
            <div className="knowledge-card" key={index}>
              <div className="kicker">{block.title}</div>
              <p>{block.body}</p>
              {'code' in block && block.code ? <CodeBlock code={block.code} language={block.language ?? 'text'} /> : null}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 22px 22px', borderTop: '1px solid var(--color-divider)' }}>
        <Button variant="primary" block framed onClick={() => app.startLesson(lesson.id)} data-testid="start-practice">
          {app.t('lessonIntro.start')}
        </Button>
      </div>
    </div>
  );
}
