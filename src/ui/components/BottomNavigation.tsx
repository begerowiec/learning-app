import type { Translator } from '@ui/i18n/index.ts';

export type TabName = 'Home' | 'Learn' | 'Progress' | 'Profile';

export const TABS: TabName[] = ['Home', 'Learn', 'Progress', 'Profile'];

/** Single-path icons, straight from the design. */
const ICONS: Record<TabName, string> = {
  Home: 'M3 10.5 12 3.5l9 7V21H3z',
  Learn: 'M4 4.5h6.6V20H4zM13.4 4.5H20V20h-6.6z',
  Progress: 'M4.5 20V13m5 7V8m5 12v-4m5 4V4',
  Profile: 'M12 4.5a3.4 3.4 0 1 1 0 6.9 3.4 3.4 0 0 1 0-6.9zM4.8 20c.6-3.4 3.6-5.3 7.2-5.3s6.6 1.9 7.2 5.3',
};

const LABEL_KEYS = {
  Home: 'nav.home',
  Learn: 'nav.learn',
  Progress: 'nav.progress',
  Profile: 'nav.profile',
} as const;

export function BottomNavigation({
  active,
  onNavigate,
  t,
}: {
  active: TabName;
  onNavigate: (tab: TabName) => void;
  t: Translator['t'];
}) {
  return (
    <nav className="bottom-nav" aria-label={t('nav.label')}>
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          className="bottom-nav-item"
          aria-current={tab === active ? 'page' : undefined}
          onClick={() => onNavigate(tab)}
          data-testid={`nav-${tab.toLowerCase()}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
            <path d={ICONS[tab]} />
          </svg>
          <span className="bottom-nav-label">{t(LABEL_KEYS[tab])}</span>
        </button>
      ))}
    </nav>
  );
}
