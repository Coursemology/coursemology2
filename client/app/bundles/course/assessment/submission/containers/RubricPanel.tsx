import { FC, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { CategoryScoreData } from 'types/course/assessment/question/rubric-based-responses';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import { useDebounce } from 'lib/hooks/useDebounce';
import useTranslation from 'lib/hooks/useTranslation';

import { saveGrade, updateGrade } from '../actions/answers';
import { workflowStates } from '../constants';
import { computeExp } from '../reducers/grading';
import { getRubricCategoryScoresForAnswerId } from '../selectors/answers';
import {
  getBasePoints,
  getExpMultiplier,
  getMaximumGrade,
  getQuestionWithGrades,
} from '../selectors/grading';
import { getQuestions } from '../selectors/questions';
import { getSubmission } from '../selectors/submissions';
import translations from '../translations';
import { GradeWithPrefilledStatus } from '../types';

import RubricPanelRow from './RubricPanelRow';

interface RubricPanelProps {
  isFirstRendering: boolean;
  setIsFirstRendering: (isFirstRendering: boolean) => void;
  questionId: number;
}

const RubricPanel: FC<RubricPanelProps> = (props) => {
  const { isFirstRendering, setIsFirstRendering, questionId } = props;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);

  const question = questions[
    questionId
  ] as SubmissionQuestionData<'RubricBasedResponse'>;
  const questionWithGrades = useAppSelector(getQuestionWithGrades);

  const answerId = questionWithGrades[questionId].id;

  const categoryScore = useAppSelector((state) =>
    getRubricCategoryScoresForAnswerId(state, answerId),
  );

  const categoryScoreHash = categoryScore.reduce(
    (obj, category) => ({
      ...obj,
      [category.categoryId]: {
        id: category.id,
        score: category.score,
        explanation: category.explanation,
      },
    }),
    {},
  );

  const initialCategoriesScore: Record<number, CategoryScoreData> =
    question.categories.reduce(
      (obj, category) => ({
        ...obj,
        [category.id]: {
          id: categoryScoreHash[category.id]?.id ?? null,
          name: category.name,
          score: categoryScoreHash[category.id]?.score ?? null,
          explanation: categoryScoreHash[category.id]?.explanation ?? null,
        },
      }),
      {},
    );

  const submissionId = getSubmissionId();

  const basePoints = useAppSelector(getBasePoints);
  const expMultiplier = useAppSelector(getExpMultiplier);
  const maximumGrade = useAppSelector(getMaximumGrade);

  const { submittedAt, bonusEndAt, bonusPoints, workflowState } = submission;

  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;

  const handleSaveGrade = (
    newGrade: number,
    qId: number,
    oldQuestions: Record<number, GradeWithPrefilledStatus>,
  ): void => {
    const newQuestionWithGrades = {
      ...oldQuestions,
      [qId]: {
        ...oldQuestions[qId],
        grade: newGrade,
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
      saveGrade(
        submissionId,
        newQuestionWithGrades[qId],
        qId,
        newExpPoints,
        workflowState === workflowStates.Published,
      ),
    );
  };

  const [categoryScores, setCategoryScores] = useState(initialCategoriesScore);

  const handleUpdateGrade = (qId: number, grade: number): void => {
    dispatch(updateGrade(qId, grade, bonusAwarded));
  };

  const debouncedSaveGrade = useDebounce(
    handleSaveGrade,
    FIELD_LONG_DEBOUNCE_DELAY_MS,
    [],
  );

  useEffect(() => {
    if (isFirstRendering) return;

    const totalCategoryScore = Object.values(categoryScores).reduce(
      (acc, cat) => acc + Number(cat.score),
      0,
    );

    const questionGrade =
      totalCategoryScore < 0
        ? 0
        : Math.min(totalCategoryScore, question.maximumGrade);

    handleUpdateGrade(questionId, questionGrade);
    debouncedSaveGrade(questionGrade, questionId, questionWithGrades);
  }, [categoryScores]);

  return (
    <div className="w-1/2 p-2">
      <Typography className="mb-4" variant="h6">
        {t(translations.rubricScores)}
      </Typography>
      <Table className="border border-gray-600">
        <TableHead>
          <TableRow>
            <TableCell className="w-1/12 text-wrap">
              {t(translations.category)}
            </TableCell>
            <TableCell className="w-1/12 text-wrap">
              {t(translations.score)}
            </TableCell>
            <TableCell className="w-1/3 text-wrap">
              {t(translations.explanation)}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {question.categories.map((category) => (
            <RubricPanelRow
              key={category.id}
              answerId={answerId}
              category={category}
              categoryScores={categoryScores}
              questionId={questionId}
              setCategoryScores={setCategoryScores}
              setIsFirstRendering={setIsFirstRendering}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RubricPanel;
