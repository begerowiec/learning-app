import { BlueprintCorners } from '@ui/components/Blueprint.tsx';
import { BottomNavigation, Button } from '@ui/components/index.ts';
import { HomeScreen } from '@ui/screens/HomeScreen.tsx';
import { LearnScreen, LoadingScreen, ModuleScreen, SubjectScreen } from '@ui/screens/LearnScreens.tsx';
import { LessonIntroScreen } from '@ui/screens/LessonIntroScreen.tsx';
import {
  OnboardingGoal,
  OnboardingLevels,
  OnboardingReady,
  OnboardingSubjects,
} from '@ui/screens/Onboarding.tsx';
import { ProfileScreen } from '@ui/screens/ProfileScreen.tsx';
import { ProgressScreen } from '@ui/screens/ProgressScreen.tsx';
import { SessionScreen } from '@ui/screens/SessionScreen.tsx';
import { SummaryScreen } from '@ui/screens/SummaryScreen.tsx';
import { TAB_ROUTES } from './routes.ts';
import { useAppController, type AppController } from './useAppController.ts';

/**
 * The shell: a 390×844 device frame on desktop, full-bleed on a phone, with
 * the router below it. Every screen renders inside the same frame, which is
 * what keeps the design's blueprint chrome in one place.
 */
export function App() {
  const app = useAppController();
  const showNav = TAB_ROUTES.includes(app.route.name);

  return (
    <div className="app-root" data-theme={app.theme}>
      <header className="app-topbar">
        <div className="app-wordmark">Loop</div>
        <div className="app-topbar-actions">
          <Button size="micro" onClick={() => app.setTheme(app.theme === 'dark' ? 'light' : 'dark')} data-testid="theme-toggle">
            {app.theme === 'dark' ? app.t('app.themeLight') : app.t('app.themeDark')}
          </Button>
          <Button size="micro" onClick={app.restartOnboarding}>
            {app.t('app.onboarding')}
          </Button>
        </div>
      </header>

      <main className="blueprint app-frame" data-testid="app-frame">
        <BlueprintCorners />
        {app.services.contentProblems.length > 0 ? (
          <ContentWarning count={app.services.contentProblems.length} app={app} />
        ) : null}
        <Screen app={app} />
        {showNav ? <BottomNavigation active={app.tab} onNavigate={app.goTab} t={app.t} /> : null}
      </main>

      <p className="app-hint text-muted">{app.t('app.hint')}</p>
    </div>
  );
}

function Screen({ app }: { app: AppController }) {
  const { route } = app;
  if (app.loading) return <LoadingScreen app={app} />;

  switch (route.name) {
    case 'onboarding-subjects':
      return <OnboardingSubjects app={app} />;
    case 'onboarding-levels':
      return <OnboardingLevels app={app} />;
    case 'onboarding-goal':
      return <OnboardingGoal app={app} />;
    case 'onboarding-ready':
      return <OnboardingReady app={app} />;
    case 'home':
      return <HomeScreen app={app} />;
    case 'learn':
      return <LearnScreen app={app} />;
    case 'subject':
      return <SubjectScreen app={app} subjectId={route.subjectId} />;
    case 'module':
      return <ModuleScreen app={app} subjectId={route.subjectId} moduleId={route.moduleId} />;
    case 'lesson-intro':
      return <LessonIntroScreen app={app} lessonId={route.lessonId} />;
    case 'session':
      return <SessionScreen app={app} />;
    case 'summary':
      return <SummaryScreen app={app} />;
    case 'progress':
      return <ProgressScreen app={app} />;
    case 'profile':
      return <ProfileScreen app={app} />;
  }
}

/**
 * Invalid content is dropped rather than crashing the app, but silence would
 * make a broken generated lesson invisible. The console carries the detail.
 */
function ContentWarning({ count, app }: { count: number; app: AppController }) {
  return (
    <div className="content-error" role="alert">
      {app.t('app.contentProblems', { count })}
    </div>
  );
}
