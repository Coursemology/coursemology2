import { FC, useMemo } from 'react';
import { TableCell, TableRow, Typography } from '@mui/material';
import { AnswerRubricGradeData } from 'types/course/assessment/question/rubric-based-responses';
import {
  RubricBasedResponseCategoryQuestionData,
  SubmissionQuestionData,
} from 'types/course/assessment/submission/question/types';

import UserHTMLText from 'lib/components/core/UserHTMLText';
import { useAppSelector } from 'lib/hooks/store';

import { workflowStates } from '../constants';
import { getSubmission } from '../selectors/submissions';

import RubricExplanation from './RubricExplanation';
import { SaveRubricGrade, useSaveRubricGrade } from './useSaveRubricGrade';

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
  updateGrade: SaveRubricGrade;
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
        <UserHTMLText html={explanation} />
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

  const submission = useAppSelector(getSubmission);
  const { graderView, workflowState } = submission;

  const attempting = workflowState === workflowStates.Attempting;
  const editable = !attempting && graderView && !readOnly;

  const categoryGradeExplanationMap = useMemo(
    () => buildCategoryGradeExplanationMap(question.categories),
    [question.categories],
  );

  const debouncedUpdateRubricGrade = useSaveRubricGrade(answerId, question);

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
      <TableCell className="w-[5%] text-wrap px-0 text-center">
        <Typography variant="body2">
          {categoryGrades[category.id].grade}
        </Typography>
      </TableCell>
      <GradeSlashCell maxGrade={category.maximumGrade} />
      <MaxGradeCell maxGrade={category.maximumGrade} />
    </TableRow>
  );
};

export default RubricPanelRow;
