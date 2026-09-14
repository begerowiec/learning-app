import type { Language } from '@core/domain/schema.ts';

/**
 * Every piece of copy the app owns.
 *
 * Key-major rather than language-major on purpose: a translator adding a key
 * has to fill in every language or the file stops compiling, so a half-added
 * string is a type error instead of an English word showing up in a Polish UI.
 *
 * Plural entries hold the forms separated by `|`. English has two (one, other);
 * Polish has three (one, few, many) — see `pluralForm`.
 */
type Entry = Record<Language, string>;

export const UI_STRINGS = {
  /* ── common ─────────────────────────────────────────────────────────── */
  'common.continue': { en: 'Continue', pl: 'Dalej' },
  'common.back': { en: 'Back', pl: 'Wstecz' },
  'common.loading': { en: 'loading…', pl: 'ładowanie…' },
  'common.change': { en: 'Change', pl: 'Zmień' },

  /* ── shell ──────────────────────────────────────────────────────────── */
  'app.themeDark': { en: 'Dark', pl: 'Ciemny' },
  'app.themeLight': { en: 'Light', pl: 'Jasny' },
  'app.onboarding': { en: 'Onboarding', pl: 'Onboarding' },
  'app.hint': {
    en: 'Prototype · progress is stored on this device. Theme and Onboarding switches sit above the screen.',
    pl: 'Prototyp · postęp zapisuje się na tym urządzeniu. Przełączniki motywu i onboardingu są nad ekranem.',
  },
  'app.contentProblems': {
    en: '{count} content problems — affected lessons were skipped. See the console for details.',
    pl: 'Problemy z treścią ({count}) — te lekcje zostały pominięte. Szczegóły w konsoli.',
  },
  'app.englishFallback': { en: 'EN', pl: 'EN' },
  'app.englishFallbackTitle': {
    en: 'This lesson has no Polish version yet — showing the English original.',
    pl: 'Ta lekcja nie ma jeszcze polskiej wersji — pokazujemy angielski oryginał.',
  },

  /* ── navigation ─────────────────────────────────────────────────────── */
  'nav.home': { en: 'Home', pl: 'Start' },
  'nav.learn': { en: 'Learn', pl: 'Nauka' },
  'nav.progress': { en: 'Progress', pl: 'Postęp' },
  'nav.profile': { en: 'Profile', pl: 'Profil' },
  'nav.label': { en: 'Main', pl: 'Główna' },

  /* ── onboarding ─────────────────────────────────────────────────────── */
  'onboarding.step': { en: 'Step {current} / {total}', pl: 'Krok {current} / {total}' },
  'onboarding.subjects.title': { en: 'What do you want to learn?', pl: 'Czego chcesz się uczyć?' },
  'onboarding.subjects.subtitle': {
    en: 'Pick one or more. You can add subjects later.',
    pl: 'Wybierz jeden lub więcej. Kolejne dodasz później.',
  },
  'onboarding.levels.title': { en: 'Select your level', pl: 'Wybierz poziom' },
  'onboarding.levels.subtitle': {
    en: 'Sets which lessons and questions you get first.',
    pl: 'Decyduje, które lekcje i pytania dostaniesz najpierw.',
  },
  'onboarding.goal.title': { en: 'Daily goal', pl: 'Cel dzienny' },
  'onboarding.goal.subtitle': {
    en: 'Short and repeatable beats long and rare.',
    pl: 'Krótko i regularnie działa lepiej niż długo i rzadko.',
  },
  'onboarding.goal.unit': { en: 'min / day', pl: 'min / dzień' },
  'onboarding.ready.title': { en: 'Ready to learn', pl: 'Można zaczynać' },
  'onboarding.ready.line': {
    en: '{subjects} · {minutes} minutes a day. Your first session is queued.',
    pl: '{subjects} · {minutes} minut dziennie. Pierwsza sesja czeka.',
  },
  'onboarding.ready.cta': { en: 'Start learning', pl: 'Zacznij naukę' },

  /* ── home ───────────────────────────────────────────────────────────── */
  'home.greeting.morning': { en: 'Good morning', pl: 'Dzień dobry' },
  'home.greeting.afternoon': { en: 'Good afternoon', pl: 'Dzień dobry' },
  'home.greeting.evening': { en: 'Good evening', pl: 'Dobry wieczór' },
  'unit.dayStreak': { en: 'day streak|day streak', pl: 'dzień z rzędu|dni z rzędu|dni z rzędu' },
  'home.continueLearning': { en: 'Continue learning', pl: 'Kontynuuj naukę' },
  'home.readyToReview': { en: 'Ready to review', pl: 'Do powtórki' },
  'home.minutesShort': { en: '{count} min', pl: '{count} min' },
  'home.itemsShort': { en: '{count} items', pl: '{count} elem.' },
  'home.todaysLearning': { en: "Today's learning", pl: 'Dzisiejsza nauka' },
  'home.goalPerDay': { en: '{minutes} min / day', pl: '{minutes} min / dzień' },
  'home.plan.lesson': { en: 'lesson', pl: 'lekcja' },
  'home.plan.questions': { en: 'questions', pl: 'pytania' },
  'home.plan.reviews': { en: 'reviews', pl: 'powtórki' },
  'home.review.title': { en: 'items ready to review', pl: 'elementów do powtórki' },
  'home.review.sub': { en: 'Spaced repetition · ~{minutes} min', pl: 'Powtórki rozłożone w czasie · ~{minutes} min' },
  'home.review.subtitle': { en: 'Items you got wrong, scheduled back', pl: 'To, co poszło źle, wraca po czasie' },
  'home.yourSubjects': { en: 'Your subjects', pl: 'Twoje przedmioty' },
  'home.thisWeek': { en: 'this week', pl: 'w tym tygodniu' },
  'home.notStarted': { en: 'Not started yet', pl: 'Jeszcze nie zaczęte' },
  'home.today': { en: 'Today', pl: 'Dzisiaj' },
  'home.yesterday': { en: 'Yesterday', pl: 'Wczoraj' },
  'home.daysAgo': { en: '{count} days ago', pl: '{count} dni temu' },
  'home.pickSubject': { en: 'Pick a subject to get started', pl: 'Wybierz przedmiot, żeby zacząć' },
  'home.nothingQueued': { en: 'Nothing queued', pl: 'Nic w kolejce' },
  'home.reviewSession': { en: 'Review session', pl: 'Sesja powtórkowa' },
  'cta.continue': { en: 'Continue', pl: 'Kontynuuj' },
  'cta.startReview': { en: 'Start review', pl: 'Zacznij powtórkę' },
  'cta.startLesson': { en: 'Start lesson', pl: 'Zacznij lekcję' },
  'cta.allCaughtUp': { en: 'All caught up', pl: 'Wszystko zrobione' },

  /* ── learn / subject / module ───────────────────────────────────────── */
  'learn.title': { en: 'Learn', pl: 'Nauka' },
  'learn.subtitle': { en: 'Subjects, modules and lessons.', pl: 'Przedmioty, moduły i lekcje.' },
  'learn.moreComing': { en: '+ more subjects coming', pl: '+ kolejne przedmioty wkrótce' },
  'learn.subject': { en: 'Subject', pl: 'Przedmiot' },
  'learn.complete': { en: 'complete', pl: 'ukończone' },
  'learn.modules': { en: 'Modules', pl: 'Moduły' },
  'learn.noModules': {
    en: 'no modules unlocked at this level yet',
    pl: 'na tym poziomie nie ma jeszcze odblokowanych modułów',
  },
  'module.notStartedYet': { en: 'not started yet', pl: 'jeszcze nie zaczęty' },
  'module.donePercent': { en: '{percent}% done', pl: 'zrobione w {percent}%' },
  'status.not_started': { en: 'not started', pl: 'nie zaczęte' },
  'status.in progress': { en: 'in progress', pl: 'w trakcie' },
  'status.completed': { en: 'completed', pl: 'ukończone' },
  'lesson.completedPct': { en: 'Completed · {percent}%', pl: 'Ukończone · {percent}%' },
  'lesson.inProgressPct': { en: 'In progress · {percent}%', pl: 'W trakcie · {percent}%' },

  /* ── lesson intro ───────────────────────────────────────────────────── */
  'lessonIntro.kicker': { en: '{subject} · lesson', pl: '{subject} · lekcja' },
  'lessonIntro.start': { en: 'Start practice', pl: 'Zacznij ćwiczenia' },

  /* ── session ────────────────────────────────────────────────────────── */
  'session.check': { en: 'Check answer', pl: 'Sprawdź' },
  'session.continue': { en: 'Continue', pl: 'Dalej' },
  'session.finish': { en: 'Finish', pl: 'Zakończ' },
  'session.showAnswer': { en: 'Show answer', pl: 'Pokaż odpowiedź' },
  'session.again': { en: 'Again', pl: 'Jeszcze raz' },
  'session.gotIt': { en: 'Got it', pl: 'Umiem' },
  'session.leave': { en: 'Leave session', pl: 'Wyjdź z sesji' },
  'session.progress': { en: 'Session progress', pl: 'Postęp sesji' },
  'session.answers': { en: 'Answers', pl: 'Odpowiedzi' },
  'feedback.correct': { en: 'Correct', pl: 'Dobrze' },
  'feedback.notQuite': { en: 'Not quite', pl: 'Nie do końca' },
  'feedback.correctAnswer': { en: 'Correct answer: ', pl: 'Poprawna odpowiedź: ' },
  'flashcard.front': { en: 'Front', pl: 'Przód' },
  'flashcard.back': { en: 'Back', pl: 'Tył' },
  'flashcard.tapToReveal': { en: 'Tap the card to reveal', pl: 'Dotknij karty, żeby odkryć' },
  'review.note.wrongTimes': { en: 'Answered wrong {count} times', pl: 'Błędnie {count} razy' },
  'review.note.added': { en: 'Added to review', pl: 'Dodane do powtórek' },
  'review.note.seenToday': { en: 'Seen today', pl: 'Widziane dzisiaj' },
  'review.note.seenDaysAgo': { en: 'Seen {count} days ago', pl: 'Widziane {count} dni temu' },

  /* ── exercise type labels ───────────────────────────────────────────── */
  'exerciseType.multiple_choice': { en: 'Multiple choice', pl: 'Wybór odpowiedzi' },
  'exerciseType.true_false': { en: 'True / False', pl: 'Prawda / Fałsz' },
  'exerciseType.fill_blank': { en: 'Fill in the blank', pl: 'Uzupełnij lukę' },
  'exerciseType.translation': { en: 'Translation', pl: 'Tłumaczenie' },
  'exerciseType.flashcard': { en: 'Flashcard', pl: 'Fiszka' },
  'exerciseType.code_multiple_choice': { en: 'Code question', pl: 'Pytanie o kod' },
  'exerciseType.code_completion': { en: 'Code completion', pl: 'Uzupełnij kod' },
  'exerciseType.find_error': { en: 'Find the error', pl: 'Znajdź błąd' },
  'exerciseType.concept_question': { en: 'Concept question', pl: 'Pytanie o zrozumienie' },
  'answerTrue': { en: 'True', pl: 'Prawda' },
  'answerFalse': { en: 'False', pl: 'Fałsz' },

  /* ── summary ────────────────────────────────────────────────────────── */
  'summary.sessionComplete': { en: 'Session complete', pl: 'Sesja zakończona' },
  'summary.lessonComplete': { en: 'Lesson complete', pl: 'Lekcja ukończona' },
  'summary.review': { en: 'Review', pl: 'Powtórka' },
  'summary.reviewDone': { en: 'Review done', pl: 'Powtórka zrobiona' },
  'summary.correct': { en: 'correct', pl: 'poprawnych' },
  'summary.accuracy': { en: 'Accuracy', pl: 'Skuteczność' },
  'summary.time': { en: 'Time', pl: 'Czas' },
  'summary.xp': { en: 'XP', pl: 'XP' },
  'summary.practised': { en: 'What you practised', pl: 'Co przećwiczyłeś' },
  'summary.reviewed': { en: 'Topics reviewed', pl: 'Powtórzone tematy' },
  'summary.worthReviewing': { en: 'Worth reviewing', pl: 'Warto powtórzyć' },
  'summary.addedToReview': { en: 'added to review', pl: 'dodane do powtórek' },
  'summary.backHome': { en: 'Back to Home', pl: 'Wróć na start' },

  /* ── progress ───────────────────────────────────────────────────────── */
  'progress.title': { en: 'Progress', pl: 'Postęp' },
  'progress.last7': { en: 'Last 7 days', pl: 'Ostatnie 7 dni' },
  'progress.weeklyActivity': { en: 'Weekly activity', pl: 'Aktywność tygodniowa' },
  'progress.minThisWeek': { en: '{count} min this week', pl: '{count} min w tym tygodniu' },
  'progress.studyTime': { en: 'Study time', pl: 'Czas nauki' },
  'progress.studyTimeSub': { en: 'all sessions', pl: 'wszystkie sesje' },
  'progress.questions': { en: 'Questions', pl: 'Pytania' },
  'progress.questionsSub': { en: 'answered', pl: 'odpowiedzianych' },
  'progress.accuracy': { en: 'Accuracy', pl: 'Skuteczność' },
  'progress.accuracySub': { en: 'across all subjects', pl: 'we wszystkich przedmiotach' },
  'progress.mastered': { en: 'Topics mastered', pl: 'Opanowane tematy' },
  'progress.masteredSub': { en: '80%+ on 2 or more', pl: '80%+ przy min. 2 podejściach' },
  'progress.subjects': { en: 'Subjects', pl: 'Przedmioty' },
  'progress.weakAreas': { en: 'Weak areas', pl: 'Słabe punkty' },
  'progress.feedsReviews': { en: 'feeds your reviews', pl: 'zasila powtórki' },
  'progress.noWeak': {
    en: 'Nothing yet — answer a few more questions and the weakest tags show up here.',
    pl: 'Jeszcze nic — odpowiedz na kilka pytań, a najsłabsze tematy pojawią się tutaj.',
  },

  /* ── profile ────────────────────────────────────────────────────────── */
  'profile.title': { en: 'Profile', pl: 'Profil' },
  'profile.localLearner': { en: 'Local learner', pl: 'Nauka lokalna' },
  'profile.thisDevice': { en: 'this device · {streak} streak', pl: 'to urządzenie · {streak}' },
  'profile.learning': { en: 'Learning', pl: 'Nauka' },
  'profile.dailyGoal': { en: 'Daily goal', pl: 'Cel dzienny' },
  'profile.reminders': { en: 'Reminders', pl: 'Przypomnienia' },
  'profile.remindersLabel': { en: 'Daily reminders', pl: 'Codzienne przypomnienia' },
  'profile.level': { en: 'Level', pl: 'Poziom' },
  'profile.appearance': { en: 'Appearance', pl: 'Wygląd' },
  'profile.language': { en: 'Language', pl: 'Język' },
  'profile.interfaceLanguage': { en: 'Interface', pl: 'Interfejs' },
  'profile.contentLanguage': { en: 'Lessons', pl: 'Lekcje' },
  'profile.contentLanguageNote': {
    en: 'Lessons without a translation are shown in English.',
    pl: 'Lekcje bez tłumaczenia pokazujemy po angielsku.',
  },
  'profile.account': { en: 'Account', pl: 'Konto' },
  'profile.redoOnboarding': { en: 'Redo onboarding', pl: 'Powtórz onboarding' },
  'profile.resetProgress': { en: 'Reset progress', pl: 'Wyczyść postęp' },
  'profile.resetConfirm': {
    en: 'Reset all progress on this device?',
    pl: 'Wyczyścić cały postęp na tym urządzeniu?',
  },
  'theme.light': { en: 'Light', pl: 'Jasny' },
  'theme.dark': { en: 'Dark', pl: 'Ciemny' },

  /* ── plural units (forms separated by |) ────────────────────────────── */
  'unit.lesson': { en: 'lesson|lessons', pl: 'lekcja|lekcje|lekcji' },
  'unit.module': { en: 'module|modules', pl: 'moduł|moduły|modułów' },
  'unit.question': { en: 'question|questions', pl: 'pytanie|pytania|pytań' },
  'unit.subject': { en: 'subject|subjects', pl: 'przedmiot|przedmioty|przedmiotów' },
  'unit.minute': { en: 'minute|minutes', pl: 'minuta|minuty|minut' },
  'unit.day': { en: 'day|days', pl: 'dzień|dni|dni' },
} satisfies Record<string, Entry>;

export type UiKey = keyof typeof UI_STRINGS;
