import { Dispatch, FC, SetStateAction } from 'react';
import { TableCell, TableRow, Typography } from '@mui/material';
import { CategoryScoreData } from 'types/course/assessment/question/rubric-based-responses';
import {
  SubmissionCategoryData,
  SubmissionQuestionData,
} from 'types/course/assessment/submission/question/types';

import { useAppSelector } from 'lib/hooks/store';

import { workflowStates } from '../constants';
import { getQuestions } from '../selectors/questions';
import { getSubmission } from '../selectors/submissions';

import RubricExplanation from './RubricExplanation';
import RubricScore from './RubricScore';

interface RubricPanelRowProps {
  answerId: number;
  questionId: number;
  category: SubmissionCategoryData;
  categoryScores: Record<number, CategoryScoreData>;
  setCategoryScores: Dispatch<
    SetStateAction<Record<number, CategoryScoreData>>
  >;
  setIsFirstRendering: (isFirstRendering: boolean) => void;
}

const RubricPanelRow: FC<RubricPanelRowProps> = (props) => {
  const {
    answerId,
    questionId,
    category,
    categoryScores,
    setCategoryScores,
    setIsFirstRendering,
  } = props;

  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);

  const { graderView, workflowState } = submission;
  const question = questions[
    questionId
  ] as SubmissionQuestionData<'RubricBasedResponse'>;

  const attempting = workflowState === workflowStates.Attempting;
  const editable = !attempting && graderView;

  const categoryScoreExplanationMap = question.categories.reduce(
    (acc, cat) => ({
      ...acc,
      [cat.id]: cat.levels.reduce(
        (explanationAcc, level) => ({
          ...explanationAcc,
          [level.level]: level.explanation,
        }),
        {},
      ),
    }),
    {},
  );

  return (
    <TableRow key={category.id}>
      <TableCell className="w-1/12 text-wrap">{category.name}</TableCell>
      <TableCell className="w-1/12">
        {editable ? (
          <RubricScore
            key={category.id}
            answerId={answerId}
            category={category}
            categoryScores={categoryScores}
            setCategoryScores={setCategoryScores}
            setIsFirstRendering={setIsFirstRendering}
          />
        ) : (
          <Typography variant="body2">
            {categoryScores[category.id].score}
          </Typography>
        )}
      </TableCell>
      <TableCell className="w-1/3">
        {editable ? (
          <RubricExplanation
            key={category.id}
            answerId={answerId}
            category={category}
            categoryScores={categoryScores}
            setCategoryScores={setCategoryScores}
            setIsFirstRendering={setIsFirstRendering}
          />
        ) : (
          <Typography
            dangerouslySetInnerHTML={{
              __html:
                categoryScoreExplanationMap[category.id][
                  categoryScores[category.id].score
                ],
            }}
            variant="body2"
          />
        )}
      </TableCell>
    </TableRow>
  );
};

export default RubricPanelRow;
