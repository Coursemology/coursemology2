import { FC, useMemo } from 'react';
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
import { getSubmission } from '../selectors/submissions';
import { GradeWithPrefilledStatus } from '../types';

import RubricExplanation from './RubricExplanation';
import RubricGrade from './RubricGrade';

interface RubricPanelRowProps {
  answerId: number;
  question: SubmissionQuestionData<'RubricBasedResponse'>;
  category: RubricBasedResponseCategoryQuestionData;
  categoryGrades: Record<number, AnswerRubricGradeData>;
  setIsFirstRendering: (isFirstRendering: boolean) => void;
  readOnly?: boolean;
}

function buildCategoryGradeExplanationMap(
  categories: RubricBasedResponseCategoryQuestionData[],
): Record<number, Record<number, string>> {
  return categories.reduce(
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
}

const ExplanationCell: FC<{
  editable: boolean;
  category: RubricBasedResponseCategoryQuestionData;
  categoryGrades: Record<number, AnswerRubricGradeData>;
  explanationMap: Record<number, Record<number, string>>;
  updateGrade: (
    catGrades: Record<number, AnswerRubricGradeData>,
    qId: number,
    oldQuestions: Record<number, GradeWithPrefilledStatus>,
  ) => void;
  questionId: number;
  props: RubricPanelRowProps;
}> = ({
  editable,
  category,
  categoryGrades,
  explanationMap,
  updateGrade,
  questionId,
  props,
}) => {
  const explanation =
    explanationMap[category.id]?.[categoryGrades[category.id].grade] ??
    categoryGrades[category.id].explanation;

  return (
    <TableCell className="w-[80%] text-wrap">
      {editable ? (
        <RubricExplanation
          key={category.id}
          questionId={questionId}
          updateGrade={updateGrade}
          {...props}
        />
      ) : (
        <Typography
          dangerouslySetInnerHTML={{ __html: explanation }}
          variant="body2"
        />
      )}
    </TableCell>
  );
};

const GradeCell: FC<{
  editable: boolean;
  category: RubricBasedResponseCategoryQuestionData;
  categoryGrades: Record<number, AnswerRubricGradeData>;
  updateGrade: (
    catGrades: Record<number, AnswerRubricGradeData>,
    qId: number,
    oldQuestions: Record<number, GradeWithPrefilledStatus>,
  ) => void;
  questionId: number;
  props: RubricPanelRowProps;
}> = ({
  editable,
  category,
  categoryGrades,
  updateGrade,
  questionId,
  props,
}) => {
  const grade = categoryGrades[category.id].grade;
  return (
    <TableCell className="w-[5%] text-wrap px-0 text-center">
      {category.isBonusCategory && editable ? (
        <RubricGrade
          key={category.id}
          questionId={questionId}
          updateGrade={updateGrade}
          {...props}
        />
      ) : (
        <Typography variant="body2">{grade}</Typography>
      )}
    </TableCell>
  );
};

const GradeSlashCell: FC<{ maxGrade?: number }> = ({ maxGrade }) => (
  <TableCell className="px-0 text-center">
    <Typography variant="body2">{maxGrade ? '/' : ''}</Typography>
  </TableCell>
);

const MaxGradeCell: FC<{ maxGrade?: number }> = ({ maxGrade }) => (
  <TableCell className="w-[5%] text-wrap px-0 text-center">
    <Typography variant="body2">{maxGrade ?? ''}</Typography>
  </TableCell>
);

const RubricPanelRow: FC<RubricPanelRowProps> = (props) => {
  const {
    answerId,
    question,
    category,
    categoryGrades,
    readOnly = false,
  } = props;

  const dispatch = useAppDispatch();
  const submission = useAppSelector(getSubmission);
  const { graderView, workflowState, submittedAt, bonusEndAt, bonusPoints } =
    submission;
  const submissionId = getSubmissionId();

  const maximumGrade = useAppSelector(getMaximumGrade);
  const basePoints = useAppSelector(getBasePoints);
  const expMultiplier = useAppSelector(getExpMultiplier);

  const attempting = workflowState === workflowStates.Attempting;
  const published = workflowState === workflowStates.Published;
  const editable = !attempting && graderView && !readOnly;

  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;

  const categoryIds = useMemo(
    () => question.categories.map((cat) => cat.id),
    [question.categories],
  );

  const categoryGradeExplanationMap = useMemo(
    () => buildCategoryGradeExplanationMap(question.categories),
    [question.categories],
  );

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
        question.id,
        categoryIds,
        newExpPoints,
        published,
        catGrades,
        question?.maximumGrade,
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
      <ExplanationCell
        category={category}
        categoryGrades={categoryGrades}
        editable={editable}
        explanationMap={categoryGradeExplanationMap}
        props={props}
        questionId={question.id}
        updateGrade={debouncedUpdateRubricGrade}
      />
      <GradeCell
        category={category}
        categoryGrades={categoryGrades}
        editable={editable}
        props={props}
        questionId={question.id}
        updateGrade={debouncedUpdateRubricGrade}
      />
      <GradeSlashCell maxGrade={category.maximumGrade} />
      <MaxGradeCell maxGrade={category.maximumGrade} />
    </TableRow>
  );
};

export default RubricPanelRow;
