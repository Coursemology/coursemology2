import { FC } from 'react';
import { Chip, MenuItem, Select } from '@mui/material';
import { AnswerRubricGradeData } from 'types/course/assessment/question/rubric-based-responses';
import {
  RubricBasedResponseCategoryQuestionData,
  SubmissionQuestionBaseData,
} from 'types/course/assessment/submission/question/types';

import UserHTMLText from 'lib/components/core/UserHTMLText';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import {
  updateGrade as updateGradeState,
  updateRubric,
} from '../actions/answers';
import { workflowStates } from '../constants';
import { getQuestionWithGrades } from '../selectors/grading';
import { getQuestionFlags } from '../selectors/questionFlags';
import { getQuestions } from '../selectors/questions';
import { getSubmissionFlags } from '../selectors/submissionFlags';
import { getSubmission } from '../selectors/submissions';
import translations from '../translations';
import {
  gradeWithModerationPreserved,
  sumRubricBreakdown,
  transformRubric,
} from '../utils/rubrics';

import { SaveRubricGrade } from './useSaveRubricGrade';

interface RubricExplanationProps {
  answerId: number;
  questionId: number;
  category: RubricBasedResponseCategoryQuestionData;
  categoryGrades: Record<number, AnswerRubricGradeData>;
  setIsFirstRendering: (isFirstRendering: boolean) => void;
  updateGrade: SaveRubricGrade;
}

const RubricExplanation: FC<RubricExplanationProps> = (props) => {
  const {
    answerId,
    questionId,
    category,
    categoryGrades,
    setIsFirstRendering,
    updateGrade,
  } = props;

  const { t } = useTranslation();

  const questionWithGrades = useAppSelector(getQuestionWithGrades);
  const submission = useAppSelector(getSubmission);

  const dispatch = useAppDispatch();

  const { submittedAt, bonusEndAt, bonusPoints, workflowState } = submission;
  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;
  const questions = useAppSelector(getQuestions);

  const question = questions[questionId] as SubmissionQuestionBaseData;
  const questionFlags = useAppSelector(getQuestionFlags);
  const submissionFlags = useAppSelector(getSubmissionFlags);
  const isAutograding =
    submissionFlags?.isAutograding || questionFlags[questionId]?.isAutograding;
  const isNotGradedAndNotPublished =
    workflowState !== workflowStates.Graded &&
    workflowState !== workflowStates.Published;

  const categoryIdToGradeMap = category.grades.reduce(
    (acc, catGrade) => ({
      ...acc,
      [catGrade.id]: catGrade.grade,
    }),
    {},
  );

  const handleOnChange = (event): void => {
    const newValue = event.target.value;

    const newCategoryGrades = {
      ...categoryGrades,
      [category.id]: {
        ...categoryGrades[category.id],
        gradeId: Number(newValue),
        grade: categoryIdToGradeMap[Number(newValue)],
      },
    };

    // Apply the breakdown change while preserving the answer's manual moderation adjustment.
    const currentGrade =
      questionWithGrades[questionId]?.grade ??
      sumRubricBreakdown(categoryGrades);
    const finalGrade = gradeWithModerationPreserved(
      categoryGrades,
      newCategoryGrades,
      currentGrade,
      question.maximumGrade,
    );

    setIsFirstRendering(false);

    dispatch(updateRubric(answerId, transformRubric(newCategoryGrades)));
    dispatch(updateGradeState(questionId, finalGrade, bonusAwarded));

    if (isNotGradedAndNotPublished) {
      updateGrade(
        newCategoryGrades,
        questionId,
        questionWithGrades,
        finalGrade,
      );
    }
  };

  return (
    <Select
      className="w-full h-20"
      disabled={isAutograding}
      id={`category-${category.id}`}
      onChange={handleOnChange}
      renderValue={(selectedId) => {
        // Display the selected grade explanation only, excluding the grade chip
        const selected = category.grades.find((g) => g.id === selectedId);
        return (
          <div className="h-20">
            <UserHTMLText
              className="line-clamp-1 break-all text-wrap"
              html={selected?.explanation ?? ''}
              variant="body2"
            />
          </div>
        );
      }}
      value={categoryGrades[category.id].gradeId}
      variant="outlined"
    >
      {category.grades.map((grade) => (
        <MenuItem key={grade.id} className="h-auto" value={grade.id}>
          <div className="flex items-center justify-between w-full">
            <UserHTMLText
              className="break-all text-wrap"
              html={grade.explanation}
              variant="body2"
            />
            <Chip
              label={t(translations.gradeDisplay, {
                grade: grade?.grade ?? '--',
              })}
              size="small"
              variant="filled"
            />
          </div>
        </MenuItem>
      ))}
    </Select>
  );
};

export default RubricExplanation;
