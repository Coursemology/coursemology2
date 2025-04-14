import { FC, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { AnswerRubricGradeData } from 'types/course/assessment/question/rubric-based-responses';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getRubricCategoryGradesForAnswerId } from '../selectors/answers';
import { getQuestionWithGrades } from '../selectors/grading';
import { getQuestions } from '../selectors/questions';
import translations from '../translations';

import RubricPanelRow from './RubricPanelRow';

interface RubricPanelProps {
  setIsFirstRendering: (isFirstRendering: boolean) => void;
  questionId: number;
}

const RubricPanel: FC<RubricPanelProps> = (props) => {
  const { setIsFirstRendering, questionId } = props;

  const { t } = useTranslation();
  const questions = useAppSelector(getQuestions);

  const question = questions[
    questionId
  ] as SubmissionQuestionData<'RubricBasedResponse'>;
  const questionWithGrades = useAppSelector(getQuestionWithGrades);

  const answerId = questionWithGrades[questionId].id;

  const categoryGrade = useAppSelector((state) =>
    getRubricCategoryGradesForAnswerId(state, answerId),
  );

  const categoryGradeHash = categoryGrade.reduce(
    (obj, category) => ({
      ...obj,
      [category.categoryId]: {
        id: category.id,
        gradeId: category.gradeId,
        grade: category.grade,
        explanation: category.explanation,
      },
    }),
    {},
  );

  const initialCategoriesGrade: Record<number, AnswerRubricGradeData> =
    question.categories.reduce(
      (obj, category) => ({
        ...obj,
        [category.id]: {
          id: categoryGradeHash[category.id]?.id ?? null,
          gradeId: categoryGradeHash[category.id]?.gradeId ?? null,
          name: category.name,
          grade: categoryGradeHash[category.id]?.grade ?? null,
          explanation: categoryGradeHash[category.id]?.explanation ?? null,
        },
      }),
      {},
    );

  const [categoryGrades, setCategoryGrades] = useState(initialCategoriesGrade);

  return (
    <div className="w-full p-2">
      <Typography className="mb-4" variant="h6">
        {t(translations.rubricScores)}
      </Typography>
      <Table className="border border-gray-600">
        <TableHead>
          <TableRow>
            <TableCell className="w-[10%] text-wrap">
              {t(translations.category)}
            </TableCell>
            <TableCell className="w-[80%] text-wrap">
              {t(translations.explanation)}
            </TableCell>
            <TableCell className="w-[10%] text-wrap">
              {t(translations.grade)}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {question.categories.map((category) => (
            <RubricPanelRow
              key={category.id}
              answerId={answerId}
              category={category}
              categoryGrades={categoryGrades}
              questionId={questionId}
              setCategoryGrades={setCategoryGrades}
              setIsFirstRendering={setIsFirstRendering}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RubricPanel;
