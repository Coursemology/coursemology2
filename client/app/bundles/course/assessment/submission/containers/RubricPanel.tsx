import { FC, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';
import { AnswerDetailsMap } from '../types';

import RubricPanelRow from './RubricPanelRow';

interface RubricPanelProps {
  answerId: number;
  answerCategoryGrades: AnswerDetailsMap['RubricBasedResponse']['categoryGrades'];
  question: SubmissionQuestionData<'RubricBasedResponse'>;
  setIsFirstRendering: (isFirstRendering: boolean) => void;
  readOnly?: boolean;
}

const RubricPanel: FC<RubricPanelProps> = (props) => {
  const { t } = useTranslation();
  const {
    answerId,
    answerCategoryGrades,
    question,
    setIsFirstRendering,
    readOnly,
  } = props;

  const categoryGrades = useMemo(() => {
    const categoryGradeHash = (answerCategoryGrades ?? []).reduce(
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

    return (question.categories ?? []).reduce(
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
  }, [answerCategoryGrades, question.categories]);

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
            <TableCell className="w-[5%] text-wrap px-0 text-center">
              {t(translations.grade)}
            </TableCell>
            <TableCell className="px-0 text-center">/</TableCell>
            <TableCell className="w-[5%] text-wrap px-0 text-center">
              {t(translations.max)}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {(question?.categories ?? []).map((category) => (
            <RubricPanelRow
              key={category.id}
              answerId={answerId}
              category={category}
              categoryGrades={categoryGrades}
              question={question}
              readOnly={readOnly}
              setIsFirstRendering={setIsFirstRendering}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RubricPanel;
