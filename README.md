# RECALL/OS

A content-driven learning app for **English**, **Python**, **TypeScript** and
**Playwright**, built to the supplied mockups and functional specification.

The interface speaks English and Polish, and the language of the *lessons* is a
separate setting from the language of the *app* — because studying English with
a Polish interface is the normal case, not an edge one.

The central idea is the one the spec calls the most important architectural
requirement: **the UI cannot tell where a lesson came from.** It receives a
validated `Lesson` object and renders it. Whether that object was hand-written,
produced by an AI generator, or fetched from a backend is invisible above the
repository layer.

```
AI content generator
        ↓  lesson JSON
  schema validation          core/domain/schema.ts + core/content/validateCatalog.ts
        ↓
  content storage            src/content/*.json today, Postgres later
        ↓
  ContentRepository          core/content/ContentRepository.ts
        ↓
  LearningService            core/LearningService.ts
        ↓
  ExerciseRenderer           ui/exercises/ExerciseRenderer.tsx
```

---

## Running it

```bash
npm install          # see "Dependencies" below
npm run dev          # http://127.0.0.1:5173
npm run verify       # typecheck + content validation + unit tests + build + e2e
```

Individual steps:

| Command | What it does |
| --- | --- |
| `npm run dev` | esbuild watch + static server on :5173 |
| `npm run build` | minified bundle into `dist/` |
| `npm run serve` | serves `dist/` on :4173 |
| `npm run typecheck` | `tsc --noEmit`, strict |
| `npm run validate:content` | validates every lesson and prints coverage |
| `npm run sync:content` | regenerates `core/content/source.ts` from the content folder |
| `npm test` | unit tests (`node:test`) |
| `npm run test:e2e` | Playwright, against the built bundle |

`npm run test:e2e` needs a Chromium: `npx playwright install chromium`, or point
`PW_CHROMIUM` at an existing binary.

### Dependencies

Runtime: **react** and **react-dom**. That is the whole list.

Build/test: **esbuild**, **typescript**, **tsx**, **playwright**.

Two things are hand-rolled rather than pulled in, and both are deliberate:

- **`core/domain/validation.ts`** — a small Zod-shaped schema kit
  (`v.object`, `.min`, `.optional`, `.default`, `safeParse`, path-aware issues).
  The spec asks for "Zod schema **or equivalent**"; this is the equivalent, with
  an API close enough that swapping in real Zod is mechanical.
- **`src/types/*.d.ts`** — minimal ambient typings for React and the Node APIs
  used by scripts. The sandbox this was assembled in had no npm registry access,
  so `@types/react` and `@types/node` could not be installed. Install them, delete
  those two files, and nothing else changes.

---

## Architecture

```
src/
  core/                    no React, no DOM — all of it unit-testable
    domain/
      validation.ts        schema kit (the Zod stand-in)
      schema.ts            THE content schema: Subject, Module, Lesson, 9 exercise types
    content/
      ContentRepository.ts interface: getSubjects / getModules / getLessons / getLesson / getExercises
      LocalContentRepository.ts   bundled JSON implementation
      validateCatalog.ts   the validation gate + cross-file integrity checks
      source.ts            the only file that imports content JSON
    progress/
      models.ts            attempts, lesson progress, sessions, review items, preferences
      ProgressStore.ts     persistence port + localStorage and in-memory implementations
      ProgressService.ts   every write to learner state
      stats.ts             accuracy, streak, per-subject, weakest tags, weekly activity
    review/ReviewScheduler.ts    interface + the 1/3/7/14/30 ladder
    session/
      grading.ts           normalises all 9 types to option ids
      sessionEngine.ts     the answer state machine
    home/recommendation.ts the Home priority algorithm
    analytics/analytics.ts typed event bus
    backend/               reference SQL schema + how to plug a backend in
    LearningService.ts     view models the UI asks for
  ui/
    i18n/                  UI_STRINGS (key-major, one row per language) + translator
    components/            Button, Card, SubjectCard, LessonCard, ProgressBar, AnswerOption,
                           FeedbackPanel, CodeBlock, Flashcard, StatCard, ScreenHeader,
                           BottomNavigation, ExerciseLayout, SegmentedControl, Tag, Toggle, Blueprint
    exercises/             ExerciseRenderer + one renderer per type family
    screens/               onboarding ×4, Home, Learn, Subject, Module, LessonIntro,
                           Session, Summary, Progress, Profile
    app/                   composition root, routes, controller, shell
  content/                 subjects.json, modules.json, lessons/*.json
    pl/                    catalog.json + lessons/*.json — the Polish edition
  scripts/translations/    the translation tables the Polish lessons are built from
  styles/                  industry.css (design tokens) + app.css (component classes)
```

### Where the important decisions live

**Adding an exercise type** is a schema entry in `core/domain/schema.ts` plus a
renderer registered in `ui/exercises/ExerciseRenderer.tsx`. The switch there is
exhaustive over the union, so TypeScript fails the build until the renderer
exists. Nothing in the session flow, progress model or scheduler changes.

**Adding a subject** (React, SQL, Spanish…) is an entry in `subjects.json`, a
module in `modules.json` and lesson files. There is no per-subject code path.

**Grading** is uniform. Eight of the nine types are answered by picking an
option; `true_false` is projected onto two synthetic options and `flashcard` is
self-graded. `core/session/grading.ts` is the only place that knows the
difference, which is what keeps the renderers thin.

**Replacing the spaced-repetition algorithm** means implementing
`ReviewScheduler` and passing it to `ProgressService`. The current one is the
simple ladder from the spec; SM-2 or FSRS would drop straight in.

**Adding a backend** means implementing `ContentRepository` and `ProgressStore`
and changing two lines in `ui/app/services.ts`. See `core/backend/README.md` and
`core/backend/schema.sql` for the table layout.

**Adding a language** is three things: a row per key in `ui/i18n/strings.ts`
(the table is key-major, so a missing translation is a *type error*), an entry in
`LANGUAGES`, and a translation table under `scripts/translations/`. Lessons with
no translation yet keep working — they are served in English and badged `EN`.

---

## Two languages, one progress history

Two independent settings, both in Profile:

- **Interface** — the app's own copy: buttons, labels, screen titles, exercise
  type names, True/False. Auto-detected from the browser on first launch.
- **Lessons** — the language content is delivered in. Falls back to English per
  lesson, with a visible badge, wherever a translation does not exist.

The important part is what *cannot* differ between languages. A translated
lesson must have the same exercise ids in the same order, with the same types,
tags, difficulty and answer ids — and `validateCatalog` fails the build if it
does not. That is what makes switching language safe: attempts, lesson progress
and the review queue are all keyed by exercise id, so a queue built in English
replays correctly in Polish, and the strengths/weaknesses analysis keeps working
across the switch. The e2e suite asserts exactly that.

Polish lessons are *generated* rather than hand-copied, for the same reason:
`npm run sync:content` aside, `node scripts/build-translations.mjs` copies the
structure from the English original and overlays only strings, so parity holds
by construction. A field left out of the translation table keeps its English
text — which is how the English lessons get Polish instructions and
explanations while the sentence being studied stays in English.

---

## Design

`src/styles/industry.css` is the design system exactly as delivered — colour
ramps, Barlow / Barlow Condensed, the spacing scale, radii, elevation and the
blueprint wireframe treatment. `src/styles/app.css` adds the dark theme and the
component classes the screens use. No screen defines its own colours, spacing or
type sizes; if something cannot be expressed with a class, the class is missing.

On a phone the app fills the viewport. On a wider screen it renders inside the
390×844 frame from the mockup, with the theme and onboarding switches above it.

---

## Content

24 lessons across 8 modules, **305 exercises**, all nine exercise types, every
lesson with theory plus at least 8 exercises and at least 3 distinct types — and
every one of them available in both English and Polish.

```
Python       Python Basics             Variables & Data Types · Conditions · Loops
             Functions & Collections   Functions & Scope · Lists & Tuples · Dictionaries
TypeScript   TypeScript Basics         Types · Interfaces · Functions
             Working with the Types    Generics · Type narrowing · Utility types
Playwright   Locators & waiting        Locator strategy · Auto-waiting · Assertions
             Reliability & debugging   Test isolation · Network mocking · Debugging flaky tests
English      Present Tenses            Present Simple · Present Continuous · Present Perfect
             Everyday vocabulary       Connectors · Work & office · Phrasal verbs
```

The Playwright material is deliberately not a syntax tutorial. It is built
around the things that actually cost time on a project: strict mode as a signal
rather than an obstacle, why `.first()` is usually a bug, what auto-waiting does
and does not cover, assertions that retry versus assertions that cannot, shared
state that makes a suite order-dependent, and reading a trace instead of
re-running a CI job hoping it goes green.

`npm run validate:content` is the gate. It checks the per-lesson schema, then
the things one file cannot know about itself: that subjects and modules exist,
that the module lists the lesson, that ids are unique across the whole
catalogue, and that the editorial minimums hold. It exits non-zero on any
problem, so generated content cannot reach the app unvalidated.

Answer order is deliberately shuffled — a learner should not be able to score
100% by always tapping the first option, and the test suite asserts that no
single slot holds more than half the correct answers.

---

## What is stored

`localStorage`, under two keys, both validated on read (a corrupt or
half-migrated record degrades to a fresh start rather than a white screen):

- `recall-os:progress:v1` — attempts, lesson progress, study sessions, the
  review queue, study days, and the session currently in flight
- `recall-os:preferences:v1` — subjects, per-subject levels, daily goal, theme,
  reminders

Every answer is written immediately, which is what makes the offline
requirement hold: close the app mid-lesson, reopen it with no connection, and
the same session resumes at the same exercise. All lesson content ships in the
bundle, so a lesson never needs the network at all.

---

## Tests

90 unit tests (`node:test`) and 18 end-to-end tests (Playwright).

Unit tests cover the schema (including the spec's own example JSON verbatim,
and rejection of hallucinated fields), the spaced-repetition ladder, statistics
and streak edge cases, the Home priority algorithm, the session state machine
and grading for all nine types, the progress service and review queue, the seed
content itself, and the whole translation layer — including Polish plural forms
(one / few / many, with the 12–14 exception), placeholder parity between
languages, and structural parity between every English lesson and its Polish
edition.

The e2e suite walks the two flows the spec calls mandatory:

1. launch → onboarding → Python → Beginner → Home → Continue → lesson intro →
   exercises → feedback → lesson complete → progress saved → Home updated
2. wrong answer → exercise added to Review → Review appears on Home → learner
   completes the Review → the schedule moves further out

plus language switching: the interface flips to Polish, the lesson language is
switched independently, and the suite asserts that attempts, the review queue
and the streak come through the switch untouched.

---

## Out of scope, by design

No AI chat, no LLM grading of open answers, no question generation during a
session, no live coding, no multiplayer, leaderboards or social features — per
the spec. The architecture leaves room for each: audio and speaking already
have a place in the schema (`AudioAsset` on content blocks, exercises and
individual answers) and are simply not implemented, and open-ended grading
would arrive as a new exercise type plus a renderer.
