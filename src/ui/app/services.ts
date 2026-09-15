/**
 * Composition root.
 *
 * The only file that decides which implementations the app runs on. Swapping
 * bundled content for an API, or localStorage for a synced backend, is a
 * change here and nowhere else.
 */
import { LearningService } from '@core/LearningService.ts';
import { LocalContentRepository } from '@core/content/LocalContentRepository.ts';
import { formatProblems, type CatalogProblem } from '@core/content/validateCatalog.ts';
import { ProgressService } from '@core/progress/ProgressService.ts';
import { LocalProgressStore } from '@core/progress/ProgressStore.ts';
import { DurableProgressStore, type StorageDiagnostics } from '@core/progress/DurableProgressStore.ts';
import { IndexedDbStore } from '@core/progress/mirror.ts';
import { SimpleSpacedRepetition } from '@core/review/ReviewScheduler.ts';

export interface Services {
  content: LocalContentRepository;
  progress: ProgressService;
  learning: LearningService;
  contentProblems: CatalogProblem[];
  /**
   * Reconciles the two copies of learner state and asks the browser to keep
   * them. Resolves `true` when progress was recovered from the mirror, which
   * means the UI is holding a stale empty snapshot and must re-read.
   */
  hydrateStorage: () => Promise<boolean>;
  storageDiagnostics: () => StorageDiagnostics;
}

export function createServices(): Services {
  const content = LocalContentRepository.fromBundledContent({
    onProblems: (problems) => {
      // A bad generated lesson is dropped, not fatal — but it must be loud.
      console.error(`[recall-os] content problems:\n${formatProblems(problems)}`);
    },
  });

  /* localStorage answers synchronously so Home paints on the first frame;
     IndexedDB is the copy that is actually meant to survive a browser's
     storage sweep. See DurableProgressStore for why both are needed. */
  const store = new DurableProgressStore(new LocalProgressStore(), new IndexedDbStore());
  const progress = new ProgressService(store, new SimpleSpacedRepetition());

  return {
    content,
    progress,
    learning: new LearningService(content, progress),
    contentProblems: content.problems,
    hydrateStorage: () => store.hydrate(),
    storageDiagnostics: () => store.diagnostics(),
  };
}
