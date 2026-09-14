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
import { SimpleSpacedRepetition } from '@core/review/ReviewScheduler.ts';

export interface Services {
  content: LocalContentRepository;
  progress: ProgressService;
  learning: LearningService;
  contentProblems: CatalogProblem[];
}

export function createServices(): Services {
  const content = LocalContentRepository.fromBundledContent({
    onProblems: (problems) => {
      // A bad generated lesson is dropped, not fatal — but it must be loud.
      console.error(`[recall-os] content problems:\n${formatProblems(problems)}`);
    },
  });

  const progress = new ProgressService(new LocalProgressStore(), new SimpleSpacedRepetition());

  return {
    content,
    progress,
    learning: new LearningService(content, progress),
    contentProblems: content.problems,
  };
}
