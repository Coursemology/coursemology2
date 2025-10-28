import { AppState } from 'store';

import { QuestionRubricsState, RubricState } from '../reducers/rubrics';

const getLocalState = (state: AppState): QuestionRubricsState => {
  return state.assessments.question.rubrics;
};

export const getSortedRubrics = (state: AppState): RubricState[] => {
  return Object.values(getLocalState(state).rubrics).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
};

export const getSelectedRubricData =
  (selectedRubricId: number) =>
  (
    state: AppState,
  ): {
    sortedRubrics: RubricState[];
    selectedRubricData?: {
      state: RubricState;
      index: number;
      answerCount: number;
      answerEvaluatedCount: number;
    };
  } => {
    const { rubrics } = getLocalState(state);
    const sortedRubrics = Object.values(rubrics).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );

    const selectedRubric = rubrics[selectedRubricId];
    if (!selectedRubric) return { sortedRubrics };

    return {
      sortedRubrics,
      selectedRubricData: {
        state: selectedRubric,
        index: Object.values(sortedRubrics).findIndex(
          (rubric) => rubric.id === selectedRubricId,
        ),
        answerCount:
          Object.values(selectedRubric.answerEvaluations).length +
          Object.values(selectedRubric.mockAnswerEvaluations).length,
        answerEvaluatedCount:
          Object.values(selectedRubric.answerEvaluations).filter(
            (answerEvaluation) => answerEvaluation.selections?.length,
          ).length +
          Object.values(selectedRubric.mockAnswerEvaluations).filter(
            (mockAnswerEvaluation) => mockAnswerEvaluation.selections?.length,
          ).length,
      },
    };
  };
