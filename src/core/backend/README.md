# Backend

The MVP has no backend. Content ships as validated JSON inside the bundle and
progress lives in `localStorage`. This directory exists so that adding one is a
contained change rather than a rewrite.

## What the app depends on

Two interfaces, and nothing else:

| Port | File | MVP implementation |
| --- | --- | --- |
| `ContentRepository` | `core/content/ContentRepository.ts` | `LocalContentRepository` (bundled JSON) |
| `ProgressStore` | `core/progress/ProgressStore.ts` | `LocalProgressStore` (`localStorage`) |

Both are constructed once, in `ui/app/AppProviders.tsx`. No screen, hook or
component imports a storage API, a `fetch` call or a database client.

## Adding a real backend

1. Create the tables in `schema.sql` (Supabase, Postgres, anything else).
2. Write `HttpContentRepository implements ContentRepository`. Validate every
   response with `LessonSchema` before returning it — a backend is just another
   untrusted content source, exactly like an AI generator.
3. Write `RemoteProgressStore implements ProgressStore`, or keep
   `LocalProgressStore` as the write-through cache and sync in the background.
   The models are already sync-friendly: attempts are append-only, and lesson
   progress, sessions and review items are keyed so last-write-wins is safe.
4. Swap the two constructor calls in `AppProviders.tsx`.

Nothing above that line changes.

## Content pipeline

```
AI content generator
        ↓  lesson JSON
  schema validation        ← core/domain/schema.ts + core/content/validateCatalog.ts
        ↓
  content storage          ← src/content/*.json today, the tables above later
        ↓
  ContentRepository
        ↓
  app  →  ExerciseRenderer
```

`npm run validate:content` is the gate. It runs the same schema the app runs,
plus the cross-file checks (referential integrity, unique ids, editorial
minimums), and exits non-zero on any problem — so generated content cannot
reach the app unvalidated.
