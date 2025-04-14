import { Dispatch, FC, SetStateAction } from 'react';
import { TableCell, TableRow, Typography } from '@mui/material';
import { AnswerRubricGradeData } from 'types/course/assessment/question/rubric-based-responses';
import {
  RubricBasedResponseCategoryQuestionData,
  SubmissionQuestionData,
} from 'types/course/assessment/submission/question/types';

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
import { getQuestions } from '../selectors/questions';
import { getSubmission } from '../selectors/submissions';
import { GradeWithPrefilledStatus } from '../types';

import RubricExplanation from './RubricExplanation';
import RubricGrade from './RubricGrade';

interface RubricPanelRowProps {
  answerId: number;
  questionId: number;
  category: RubricBasedResponseCategoryQuestionData;
  categoryGrades: Record<number, AnswerRubricGradeData>;
  setCategoryGrades: Dispatch<
    SetStateAction<Record<number, AnswerRubricGradeData>>
  >;
  setIsFirstRendering: (isFirstRendering: boolean) => void;
}

const RubricPanelRow: FC<RubricPanelRowProps> = (props) => {
  const { answerId, questionId, category, categoryGrades } = props;

  const dispatch = useAppDispatch();

  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);

  const { graderView, workflowState } = submission;
  const question = questions[
    questionId
  ] as SubmissionQuestionData<'RubricBasedResponse'>;

  const submissionId = getSubmissionId();

  const maximumGrade = useAppSelector(getMaximumGrade);
  const basePoints = useAppSelector(getBasePoints);
  const expMultiplier = useAppSelector(getExpMultiplier);

  const attempting = workflowState === workflowStates.Attempting;
  const published = workflowState === workflowStates.Published;
  const editable = !attempting && graderView;

  const { submittedAt, bonusEndAt, bonusPoints } = submission;

  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;

  const categoryGradeExplanationMap = question.categories.reduce(
    (acc, cat) => ({
      ...acc,
      [cat.id]: cat.grades.reduce(
        (explanationAcc, catGrade) => ({
          ...explanationAcc,
          [catGrade.grade]: catGrade.explanation,
        }),
        {},
      ),
    }),
    {},
  );

  const categoryIds = question.categories.map((cat) => cat.id);

  const handleSaveRubricAndGrade = (
    catGrades: Record<number, AnswerRubricGradeData>,
    qId: number,
    oldQuestions: Record<number, GradeWithPrefilledStatus>,
  ): void => {
    const totalGrade = Object.values(catGrades).reduce(
      (acc, catGrade) => acc + catGrade.grade,
      0,
    );
    const newQuestionWithGrades = {
      ...oldQuestions,
      [qId]: {
        ...oldQuestions[qId],
        grade: Math.max(0, Math.min(totalGrade, maximumGrade)),
        autofilled: false,
      },
    };

    const newExpPoints = computeExp(
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
        questionId,
        categoryIds,
        newExpPoints,
        published,
        catGrades,
        question.maximumGrade,
      ),
    );
  };

  const debouncedUpdateRubricGrade = useDebounce(
    handleSaveRubricAndGrade,
    FIELD_LONG_DEBOUNCE_DELAY_MS,
    [],
  );

  return (
    <TableRow key={category.id}>
      <TableCell className="w-[10%] text-wrap">{category.name}</TableCell>
      <TableCell className="w-[80%] text-wrap">
        {editable ? (
          <RubricExplanation
            key={category.id}
            updateGrade={debouncedUpdateRubricGrade}
            {...props}
          />
        ) : (
          <Typography
            dangerouslySetInnerHTML={{
              __html:
                categoryGradeExplanationMap[category.id][
                  categoryGrades[category.id].grade
                ] ?? categoryGrades[category.id].explanation,
            }}
            variant="body2"
          />
        )}
      </TableCell>
      <TableCell className="w-[10%]">
        {editable ? (
          <RubricGrade
            key={category.id}
            updateGrade={debouncedUpdateRubricGrade}
            {...props}
          />
        ) : (
          <Typography variant="body2">
            {categoryGrades[category.id].grade}
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
};

export default RubricPanelRow;
