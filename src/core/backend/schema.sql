-- RECALL/OS — reference backend schema (Postgres / Supabase flavour).
--
-- Nothing in the app imports this file: the UI talks to ContentRepository and
-- ProgressService, never to a database. It is here so that the MVP's local
-- JSON + localStorage can be replaced by a real backend without redesigning
-- the domain — the tables below are a one-to-one mapping of the TypeScript
-- models in src/core/domain and src/core/progress.

create table subjects (
  id            text primary key,
  name          text        not null,
  icon          text        not null,
  glyph         text        not null,
  description   text        not null,
  blurb         text        not null,
  "order"       int         not null default 0,
  level_labels  jsonb       not null default '{}'::jsonb,
  features      text[]      not null default '{}',
  created_at    timestamptz not null default now()
);

create table modules (
  id          text primary key,
  subject_id  text        not null references subjects (id) on delete cascade,
  title       text        not null,
  description text        not null,
  level       text        not null check (level in ('beginner', 'intermediate', 'advanced')),
  "order"     int         not null default 0,
  created_at  timestamptz not null default now()
);
create index modules_subject_level_idx on modules (subject_id, level, "order");

create table lessons (
  id                text primary key,
  subject_id        text        not null references subjects (id) on delete cascade,
  module_id         text        not null references modules (id) on delete cascade,
  level             text        not null check (level in ('beginner', 'intermediate', 'advanced')),
  title             text        not null,
  description       text        not null,
  estimated_minutes int         not null,
  "order"           int         not null default 0,
  tags              text[]      not null default '{}',
  -- Content blocks stay as validated JSON: they are a closed, versioned union
  -- owned by the schema, not something to model as rows.
  content           jsonb       not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index lessons_module_idx on lessons (module_id, "order");

create table exercises (
  id                text primary key,
  lesson_id         text        not null references lessons (id) on delete cascade,
  type              text        not null,
  difficulty        int         not null check (difficulty between 1 and 5),
  tags              text[]      not null default '{}',
  estimated_seconds int         not null default 30,
  "order"           int         not null default 0,
  -- The type-specific body (question, answers, code, front/back, …) exactly as
  -- the client schema validates it.
  payload           jsonb       not null,
  created_at        timestamptz not null default now()
);
create index exercises_lesson_idx on exercises (lesson_id, "order");
create index exercises_tags_idx on exercises using gin (tags);

create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique,
  display_name  text,
  preferences   jsonb       not null default '{}'::jsonb,  -- UserPreferences
  created_at    timestamptz not null default now()
);

create table user_progress (
  user_id          uuid        not null references users (id) on delete cascade,
  lesson_id        text        not null references lessons (id) on delete cascade,
  status           text        not null check (status in ('not_started', 'in_progress', 'completed')),
  correct_count    int         not null default 0,
  incorrect_count  int         not null default 0,
  total_exercises  int         not null default 0,
  next_exercise_ix int         not null default 0,
  started_at       timestamptz,
  completed_at     timestamptz,
  primary key (user_id, lesson_id)
);

create table exercise_attempts (
  id               bigserial primary key,
  user_id          uuid        not null references users (id) on delete cascade,
  exercise_id      text        not null,
  lesson_id        text        not null,
  subject_id       text        not null,
  tags             text[]      not null default '{}',
  correct          boolean     not null,
  duration_seconds numeric     not null default 0,
  attempts         int         not null default 1,
  answered_at      timestamptz not null default now()
);
create index attempts_user_time_idx on exercise_attempts (user_id, answered_at desc);
create index attempts_user_tags_idx  on exercise_attempts using gin (tags);

create table review_queue (
  user_id          uuid        not null references users (id) on delete cascade,
  exercise_id      text        not null,
  lesson_id        text        not null,
  subject_id       text        not null,
  next_review_at   timestamptz not null,
  review_stage     int         not null default 0,
  lapses           int         not null default 0,
  last_reviewed_at timestamptz,
  primary key (user_id, exercise_id)
);
create index review_due_idx on review_queue (user_id, next_review_at);

create table study_sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid        not null references users (id) on delete cascade,
  kind               text        not null check (kind in ('lesson', 'review')),
  subject_id         text,
  lesson_id          text,
  started_at         timestamptz not null,
  completed_at       timestamptz,
  number_of_exercises int        not null default 0,
  correct_answers    int         not null default 0,
  incorrect_answers  int         not null default 0,
  duration_seconds   numeric     not null default 0
);
create index sessions_user_time_idx on study_sessions (user_id, started_at desc);
