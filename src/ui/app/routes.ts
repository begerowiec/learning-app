import type { TabName } from '@ui/components/index.ts';

/**
 * Navigation is a small tagged union rather than a URL router: the app is a
 * single-screen mobile flow, and every destination carries exactly the ids the
 * screen needs.
 */
export type Route =
  | { name: 'onboarding-subjects' }
  | { name: 'onboarding-levels' }
  | { name: 'onboarding-goal' }
  | { name: 'onboarding-ready' }
  | { name: 'home' }
  | { name: 'learn' }
  | { name: 'progress' }
  | { name: 'profile' }
  | { name: 'subject'; subjectId: string }
  | { name: 'module'; subjectId: string; moduleId: string }
  | { name: 'lesson-intro'; lessonId: string }
  | { name: 'session' }
  | { name: 'summary' };

export const ONBOARDING_ROUTES: Route['name'][] = [
  'onboarding-subjects',
  'onboarding-levels',
  'onboarding-goal',
  'onboarding-ready',
];

/** Routes that keep the bottom navigation visible. */
export const TAB_ROUTES: Route['name'][] = ['home', 'learn', 'progress', 'profile', 'subject', 'module'];

export function routeForTab(tab: TabName): Route {
  switch (tab) {
    case 'Home':
      return { name: 'home' };
    case 'Learn':
      return { name: 'learn' };
    case 'Progress':
      return { name: 'progress' };
    case 'Profile':
      return { name: 'profile' };
  }
}

export function tabForRoute(route: Route): TabName {
  switch (route.name) {
    case 'learn':
    case 'subject':
    case 'module':
      return 'Learn';
    case 'progress':
      return 'Progress';
    case 'profile':
      return 'Profile';
    default:
      return 'Home';
  }
}
