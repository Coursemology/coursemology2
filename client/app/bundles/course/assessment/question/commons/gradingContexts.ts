import {
  GradingContextEntity,
  GradingContextPostData,
} from 'types/course/assessment/question/grading-contexts';

/**
 * Maps the grading-context form entities to the backend payload. The backend replaces the whole set on save,
 * so we forward the current array as-is; only sibling-answer contexts carry a source id.
 */
export const adaptGradingContextsPostData = (
  gradingContexts: GradingContextEntity[],
): GradingContextPostData[] =>
  gradingContexts.map((context) => ({
    id: context.draft ? undefined : context.id,
    context_type: context.contextType,
    source_id:
      context.contextType === 'sibling_question_answer'
        ? context.sourceId
        : null,
    identifier: context.identifier,
  }));
