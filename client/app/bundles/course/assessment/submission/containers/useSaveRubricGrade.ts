import { AnswerRubricGradeData } from 'types/course/assessment/question/rubric-based-responses';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import { useDebounce } from 'lib/hooks/useDebounce';

import { saveRubricAndGrade } from '../actions/answers';
import { workflowStates } from '../constants';
import { computeExp } from '../reducers/grading';
import {
  getBasePoints,
  getExpMultiplier,
  getMaximumGrade,
} from '../selectors/grading';
import { getSubmission } from '../selectors/submissions';
import { GradeWithPrefilledStatus } from '../types';

// The callers compute `finalGrade` themselves (preserving the moderation adjustment), so the save no longer
// derives the grade from the criterion breakdown alone.
export type SaveRubricGrade = (
  categoryGrades: Record<number, AnswerRubricGradeData>,
  questionId: number,
  oldQuestions: Record<number, GradeWithPrefilledStatus>,
  finalGrade: number,
) => void;

// Debounced save shared by the rubric category rows and the moderation row: persists the criterion
// selections plus the (already moderation-inclusive) total grade and recomputes EXP.
export const useSaveRubricGrade = (
  answerId: number,
  question: SubmissionQuestionData<'RubricBasedResponse'>,
): SaveRubricGrade => {
  const dispatch = useAppDispatch();
  const submission = useAppSelector(getSubmission);
  const maximumGrade = useAppSelector(getMaximumGrade);
  const basePoints = useAppSelector(getBasePoints);
  const expMultiplier = useAppSelector(getExpMultiplier);

  const { workflowState, submittedAt, bonusEndAt, bonusPoints } = submission;
  const published = workflowState === workflowStates.Published;
  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;
  const submissionId = getSubmissionId();
  const categoryIds = question.categories.map((category) => category.id);

  const save: SaveRubricGrade = (
    categoryGrades,
    questionId,
    oldQuestions,
    finalGrade,
  ) => {
    const newQuestionWithGrades = {
      ...oldQuestions,
      [questionId]: {
        ...oldQuestions[questionId],
        grade: finalGrade,
        autofilled: false,
      },
    };
    const exp = computeExp(
      newQuestionWithGrades,
      maximumGrade,
      basePoints,
      expMultiplier,
      bonusAwarded,
    );

    dispatch(
      saveRubricAndGrade(
        submissionId,
        answerId,
        question.id,
        categoryIds,
        exp,
        published,
        categoryGrades,
        maximumGrade,
        finalGrade,
      ),
    );
  };

  return useDebounce(save, FIELD_LONG_DEBOUNCE_DELAY_MS, []);
};
