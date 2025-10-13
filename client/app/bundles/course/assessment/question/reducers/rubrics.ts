import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  RubricAnswerData,
  RubricData,
  RubricEvaluationData,
} from 'types/course/rubrics';

export interface QuestionRubricsState {
  rubrics: Record<
    number,
    RubricData & {
      answerEvaluations: Record<number, RubricEvaluationData>;
      mockAnswerEvaluations: Record<number, RubricEvaluationData>;
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
          answerEvaluations: {},
          mockAnswerEvaluations: {},
        };
      });
    },
    upsertRubric: (state, action: PayloadAction<RubricData>) => {
      state.rubrics[action.payload.id] = {
        ...action.payload,
        answerEvaluations: {},
        mockAnswerEvaluations: {},
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
    loadAnswerEvaluations: (
      state,
      action: PayloadAction<{
        rubricId: number;
        evaluations: RubricEvaluationData[];
      }>,
    ) => {
      const { rubricId, evaluations } = action.payload;
      if (!(rubricId in state.rubrics)) return;

      state.rubrics[rubricId].answerEvaluations = evaluations;
    },
    loadMockAnswerEvaluations: (
      state,
      action: PayloadAction<{
        rubricId: number;
        evaluations: RubricEvaluationData[];
      }>,
    ) => {
      const { rubricId, evaluations } = action.payload;
      if (!(rubricId in state.rubrics)) return;

      state.rubrics[rubricId].mockAnswerEvaluations = evaluations;
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
      }>
    ) => {
      const { rubricId, answerId } = action.payload;
      if (!(rubricId in state.rubrics)) return;
      state.rubrics[rubricId].answerEvaluations[answerId] = {
        jobUrl: '(placeholder)',
      };
    },
    updateAnswerEvaluation: (
      state,
      action: PayloadAction<{
        answerId: number;
        rubricId: number;
        evaluation: RubricEvaluationData;
      }>,
    ) => {
      const { rubricId, answerId, evaluation } = action.payload;
      if (!(rubricId in state.rubrics)) return;
      state.rubrics[rubricId].answerEvaluations[answerId] = evaluation;
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
      state.rubrics[rubricId].answerEvaluations[mockAnswerId] = {};
    },
    requestMockAnswerEvaluation: (
      state,
      action: PayloadAction<{
        mockAnswerId: number;
        rubricId: number;
      }>
    ) => {
      const { rubricId, mockAnswerId } = action.payload;
      if (!(rubricId in state.rubrics)) return;
      state.rubrics[rubricId].mockAnswerEvaluations[mockAnswerId] = {
        jobUrl: '(placeholder)',
      };
    },
    updateMockAnswerEvaluation: (
      state,
      action: PayloadAction<{
        mockAnswerId: number;
        rubricId: number;
        evaluation: RubricEvaluationData;
      }>,
    ) => {
      const { rubricId, mockAnswerId, evaluation } = action.payload;
      if (!(rubricId in state.rubrics)) return;
      state.rubrics[rubricId].mockAnswerEvaluations[mockAnswerId] = evaluation;
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
        state.rubrics[rubricId].answerEvaluations[id] = { jobUrl };
      });

      mockEvaluationIds.forEach((id) => {
        state.rubrics[rubricId].mockAnswerEvaluations[id] = { jobUrl };
      });
    },
  },
});

export const actions = questionRubricsStore.actions;

export default questionRubricsStore.reducer;
