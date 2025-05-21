import { Dispatch, FC, SetStateAction } from 'react';
import { MenuItem, Select } from '@mui/material';
import { AnswerRubricGradeData } from 'types/course/assessment/question/rubric-based-responses';
import {
  RubricBasedResponseCategoryQuestionData,
  SubmissionQuestionBaseData,
} from 'types/course/assessment/submission/question/types';

import NumberTextField from 'lib/components/core/fields/NumberTextField';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import {
  updateGrade as updateGradeState,
  updateRubric,
} from '../actions/answers';
import { workflowStates } from '../constants';
import { getQuestionWithGrades } from '../selectors/grading';
import { getQuestions } from '../selectors/questions';
import { getSubmission } from '../selectors/submissions';
import { GradeWithPrefilledStatus } from '../types';
import { transformRubric } from '../utils/rubrics';

interface RubricGradeProps {
  answerId: number;
  questionId: number;
  category: RubricBasedResponseCategoryQuestionData;
  categoryGrades: Record<number, AnswerRubricGradeData>;
  setIsFirstRendering: (isFirstRendering: boolean) => void;
  updateGrade: (
    catGrades: Record<number, AnswerRubricGradeData>,
    qId: number,
    oldQuestions: Record<number, GradeWithPrefilledStatus>,
  ) => void;
}

const RubricGrade: FC<RubricGradeProps> = (props) => {
  const {
    answerId,
    questionId,
    category,
    categoryGrades,
    setIsFirstRendering,
    updateGrade,
  } = props;

  const dispatch = useAppDispatch();
  const questions = useAppSelector(getQuestions);
  const questionWithGrades = useAppSelector(getQuestionWithGrades);
  const submission = useAppSelector(getSubmission);

  const { submittedAt, bonusEndAt, bonusPoints, workflowState } = submission;
  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;

  const question = questions[questionId] as SubmissionQuestionBaseData;

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

  const handleOnChange = (event, isBonusCategory: boolean): void => {
    const selectedGrade = Number(event.target.value);
    const bonusGrade = Number.isNaN(selectedGrade)
      ? event.target.value
      : selectedGrade;

    const newCategoryGrades = {
      ...categoryGrades,
      [category.id]: {
        ...categoryGrades[category.id],
        gradeId: isBonusCategory
          ? categoryGrades[category.id].gradeId
          : selectedGrade,
        grade: isBonusCategory
          ? bonusGrade
          : categoryIdToGradeMap[selectedGrade],
      },
    };

    const totalGrade = Object.values(newCategoryGrades).reduce(
      (acc, catGrade) => acc + Number(catGrade.grade),
      0,
    );

    const finalGrade = Math.max(0, Math.min(totalGrade, question.maximumGrade));

    setIsFirstRendering(false);

    dispatch(updateRubric(answerId, transformRubric(newCategoryGrades)));
    dispatch(updateGradeState(questionId, finalGrade, bonusAwarded));

    if (!Number.isNaN(selectedGrade) && isNotGradedAndNotPublished) {
      updateGrade(newCategoryGrades, questionId, questionWithGrades);
    }
  };

  if (category.isBonusCategory) {
    return (
      <NumberTextField
        className="w-full h-20 max-w-3xl"
        id={`category-${category.id}`}
        onChange={(event) => handleOnChange(event, category.isBonusCategory)}
        value={categoryGrades[category.id].grade}
        variant="outlined"
      />
    );
  }

  return (
    <Select
      className="w-full h-20 max-w-3xl"
      disabled
      id={`category-${category.id}`}
      onChange={(event) => handleOnChange(event, category.isBonusCategory)}
      value={categoryGrades[category.id].gradeId}
      variant="outlined"
    >
      {category.grades.map((catGrade) => (
        <MenuItem key={catGrade.id} value={catGrade.id}>
          {catGrade.grade}
        </MenuItem>
      ))}
    </Select>
  );
};

export default RubricGrade;
