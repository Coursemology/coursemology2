import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  RubricAnswerData,
  RubricAnswerEvaluationData,
  RubricData,
  RubricMockAnswerEvaluationData,
} from 'types/course/rubrics';

export interface QuestionRubricsState {
  rubrics: Record<
    number,
    RubricData & {
      isEvaluationsLoaded: boolean;
      answerEvaluations: Record<
        number,
        RubricAnswerEvaluationData | Record<string, never>
      >;
      mockAnswerEvaluations: Record<
        number,
        RubricMockAnswerEvaluationData | Record<string, never>
      >;
    }
  >;
  answers: Record<number, RubricAnswerData>;
  mockAnswers: Record<number, RubricAnswerData>;
}

const initialState: QuestionRubricsState = {
  rubrics: {},
  answers: {},
  mockAnswers: {},
};

export const questionRubricsStore = createSlice({
  name: 'questionRubrics',
  initialState,
  reducers: {
    loadRubrics: (state, action: PayloadAction<RubricData[]>) => {
      action.payload.forEach((rubric) => {
        state.rubrics[rubric.id] = {
          ...rubric,
          isEvaluationsLoaded: false,
          answerEvaluations: {},
          mockAnswerEvaluations: {},
        };
      });
    },
    createNewRubric: (
      state,
      action: PayloadAction<{
        rubric: RubricData;
        selectedRubricId: number;
      }>,
    ) => {
      const { rubric, selectedRubricId } = action.payload;

      state.rubrics[rubric.id] = {
        ...rubric,
        // A new rubric will not have any evaluations, so no point querying for them
        isEvaluationsLoaded: true,
        answerEvaluations: Object.keys(
          state.rubrics[selectedRubricId]?.answerEvaluations ?? {},
        ).reduce(
          (evaluations, answerId) => ({ ...evaluations, [answerId]: {} }),
          {},
        ),
        mockAnswerEvaluations: Object.keys(
          state.rubrics[selectedRubricId]?.mockAnswerEvaluations ?? {},
        ).reduce(
          (evaluations, mockAnswerId) => ({
            ...evaluations,
            [mockAnswerId]: {},
          }),
          {},
        ),
      };
    },
    loadAnswers: (state, action: PayloadAction<RubricAnswerData[]>) => {
      action.payload.forEach((answer) => {
        state.answers[answer.id] = answer;
      });
    },
    loadMockAnswers: (state, action: PayloadAction<RubricAnswerData[]>) => {
      action.payload.forEach((mockAnswer) => {
        state.mockAnswers[mockAnswer.id] = mockAnswer;
      });
    },
    loadRubricEvaluations: (
      state,
      action: PayloadAction<{
        rubricId: number;
        answerEvaluations: RubricAnswerEvaluationData[];
        mockAnswerEvaluations: RubricMockAnswerEvaluationData[];
      }>,
    ) => {
      const { rubricId, answerEvaluations, mockAnswerEvaluations } =
        action.payload;
      if (!(rubricId in state.rubrics)) return;

      state.rubrics[rubricId].answerEvaluations = answerEvaluations.reduce(
        (map, evaluation) => {
          map[evaluation.answerId] = evaluation;
          return map;
        },
        {} as Record<number, RubricAnswerEvaluationData>,
      );
      state.rubrics[rubricId].mockAnswerEvaluations =
        mockAnswerEvaluations.reduce(
          (map, evaluation) => {
            map[evaluation.mockAnswerId] = evaluation;
            return map;
          },
          {} as Record<number, RubricMockAnswerEvaluationData>,
        );
      state.rubrics[rubricId].isEvaluationsLoaded = true;
    },
    initializeAnswerEvaluations: (
      state,
      action: PayloadAction<{
        answerIds: number[];
        rubricId: number;
      }>,
    ) => {
      const { rubricId, answerIds } = action.payload;
      if (!(rubricId in state.rubrics)) return;
      answerIds
        .filter((answerId) => answerId in state.answers)
        .forEach((answerId) => {
          state.rubrics[rubricId].answerEvaluations[answerId] = {};
        });
    },
    requestAnswerEvaluation: (
      state,
      action: PayloadAction<{
        answerId: number;
        rubricId: number;
      }>,
    ) => {
      const { rubricId, answerId } = action.payload;
      if (!(rubricId in state.rubrics)) return;
      state.rubrics[rubricId].answerEvaluations[answerId] = {
        answerId,
        jobUrl: '(placeholder)',
      };
    },
    updateAnswerEvaluation: (
      state,
      action: PayloadAction<{
        answerId: number;
        rubricId: number;
        evaluation: RubricAnswerEvaluationData;
      }>,
    ) => {
      const { rubricId, answerId, evaluation } = action.payload;
      if (!(rubricId in state.rubrics)) return;
      state.rubrics[rubricId].answerEvaluations[answerId] = evaluation;
    },
    deleteAnswerEvaluation: (
      state,
      action: PayloadAction<{
        answerId: number;
        rubricId: number;
      }>,
    ) => {
      const { rubricId, answerId } = action.payload;
      if (!(rubricId in state.rubrics)) return;
      delete state.rubrics[rubricId].answerEvaluations[answerId];
    },
    initializeMockAnswer: (
      state,
      action: PayloadAction<{
        mockAnswerId: number;
        rubricId: number;
        answerText: string;
      }>,
    ) => {
      const { rubricId, mockAnswerId, answerText } = action.payload;
      if (!(rubricId in state.rubrics)) return;
      state.mockAnswers[mockAnswerId] = {
        id: mockAnswerId,
        title: '(Mock Answer)',
        answerText,
      };
      state.rubrics[rubricId].mockAnswerEvaluations[mockAnswerId] = {};
    },
    requestMockAnswerEvaluation: (
      state,
      action: PayloadAction<{
        mockAnswerId: number;
        rubricId: number;
      }>,
    ) => {
      const { rubricId, mockAnswerId } = action.payload;
      if (!(rubricId in state.rubrics)) return;
      state.rubrics[rubricId].mockAnswerEvaluations[mockAnswerId] = {
        mockAnswerId,
        jobUrl: '(placeholder)',
      };
    },
    updateMockAnswerEvaluation: (
      state,
      action: PayloadAction<{
        mockAnswerId: number;
        rubricId: number;
        evaluation: RubricMockAnswerEvaluationData;
      }>,
    ) => {
      const { rubricId, mockAnswerId, evaluation } = action.payload;
      if (!(rubricId in state.rubrics)) return;
      state.rubrics[rubricId].mockAnswerEvaluations[mockAnswerId] = evaluation;
    },
    deleteMockAnswerEvaluation: (
      state,
      action: PayloadAction<{
        mockAnswerId: number;
        rubricId: number;
      }>,
    ) => {
      const { rubricId, mockAnswerId } = action.payload;
      if (!(rubricId in state.rubrics)) return;
      delete state.rubrics[rubricId].mockAnswerEvaluations[mockAnswerId];
    },
    triggerRubricEvaluationJob: (
      state,
      action: PayloadAction<{
        rubricId: number;
        jobUrl: string;
        evaluationIds: number[];
        mockEvaluationIds: number[];
      }>,
    ) => {
      const { rubricId, jobUrl, evaluationIds, mockEvaluationIds } =
        action.payload;

      if (!(rubricId in state.rubrics)) return;

      evaluationIds.forEach((id) => {
        // overwrite old data
        state.rubrics[rubricId].answerEvaluations[id] = {
          jobUrl,
          answerId: id,
        };
      });

      mockEvaluationIds.forEach((id) => {
        state.rubrics[rubricId].mockAnswerEvaluations[id] = {
          jobUrl,
          mockAnswerId: id,
        };
      });
    },
  },
});

export const actions = questionRubricsStore.actions;

export default questionRubricsStore.reducer;
