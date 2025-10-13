import { FC } from 'react';
import { Button, Tooltip } from '@mui/material';
import {
  RubricAnswerData,
  RubricCategoryData,
  RubricEvaluationData,
} from 'types/course/rubrics';

import Table, { ColumnTemplate } from 'lib/components/table';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import { evaluatePlaygroundMockAnswer } from './operations/mockAnswers';
import { evaluatePlaygroundAnswer } from './operations/answers';

import { actions as questionRubricsActions } from '../reducers/rubrics';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';

interface AnswerEvaluationsTableProps {
  selectedRubricId: number;
}

interface AnswerTableEntry {
  id: number;
  title: string;
  answerText: string;
  evaluation?: {
    totalGrade?: number;
    grades?: Record<number, number>;
    feedback: string;
  };
  isMock?: boolean;
  isEvaluating: boolean;
}

function answerDataToTableEntry(
  answer: RubricAnswerData,
  isMock: boolean,
  evaluation?: RubricEvaluationData,
): AnswerTableEntry {
  const isEvaluating = Boolean(evaluation?.jobUrl);
  const data: AnswerTableEntry = {
    id: answer.id,
    title: answer.title,
    answerText: answer.answerText,
    isMock,
    isEvaluating,
  };
  if (evaluation && !isEvaluating) {
    const grades: Record<number, number> = {};
    let totalGrade = 0;
    if (evaluation.selections?.length) {
      evaluation.selections.forEach((selection) => {
        grades[selection.categoryId] = selection.grade;
        totalGrade += selection.grade;
      });

      data.evaluation = {
        grades,
        feedback: evaluation.feedback ?? '',
        totalGrade,
      };
    }
  }

  return data;
}

const remainingCategoryColumns = (
  category: RubricCategoryData,
  categoryIndex: number,
): ColumnTemplate<AnswerTableEntry> => ({
  id: `grade_${categoryIndex + 1}`,

  title: () => (
    <Tooltip title={category.name}>
      <span>C{categoryIndex + 1}</span>
    </Tooltip>
  ),

  sortable: true,
  sortProps: {
    sort: (a, b) =>
      (a.evaluation?.grades?.[category.id] ?? 0) -
      (b.evaluation?.grades?.[category.id] ?? 0),
  },
  searchProps: {
    getValue: (a): string | undefined =>
      a.evaluation?.grades?.[category.id]?.toString(),
  },

  cell: (answer: AnswerTableEntry) => (
    <div className="space-y-1">
      <p className="m-0 text-center w-full">
        {answer.evaluation?.grades?.[category.id]} / {category.maximumGrade}
      </p>
    </div>
  ),
  cellUnless: (answer: AnswerTableEntry) => !answer.evaluation || answer.isEvaluating,
});

const AnswerEvaluationsTable: FC<AnswerEvaluationsTableProps> = (props) => {
  const { selectedRubricId } = props;

  const dispatch = useAppDispatch();

  const { answers, rubrics, mockAnswers } = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );
  const { answerEvaluations, mockAnswerEvaluations, categories } =
    rubrics[selectedRubricId];

  const tableData: AnswerTableEntry[] = Object.values(answers)
    .filter((answer) => answer.id in answerEvaluations)
    .map((answer) =>
      answerDataToTableEntry(answer, false, answerEvaluations[answer.id]),
    )
    .concat(
      ...Object.values(mockAnswers).map((mockAnswer) =>
        answerDataToTableEntry(
          mockAnswer,
          true,
          mockAnswerEvaluations[mockAnswer.id],
        ),
      ),
    );

  const firstCategoryColumn = (
    category: RubricCategoryData,
  ): ColumnTemplate<AnswerTableEntry> => ({
    id: `grade_1`,
    title: (() => (
      <Tooltip title={category.name}>
        <span>{categories.length === 1 ? 'Grade' : 'C1'}</span>
      </Tooltip>
    )) as unknown as string,

    sortable: true,
    sortProps: {
      sort: (a, b) =>
        (a.evaluation?.grades?.[category.id] ?? 0) -
        (b.evaluation?.grades?.[category.id] ?? 0),
    },

    searchProps: {
      getValue: (a): string | undefined =>
        a.evaluation?.grades?.[category.id]?.toString(),
    },

    className: 'p-0',
    cell: (answer: AnswerTableEntry) =>
      (answer.evaluation && !answer.isEvaluating) ? (
        <div className="space-y-1">
          <p className="m-0 text-center w-full">
            {answer.evaluation?.grades?.[category.id]} / {category.maximumGrade}
          </p>
        </div>
      ) : (
        <div className="w-full h-full bg-gray-100 px-6 py-3 flex items-center justify-start">
        <Button
          className="w-fit whitespace-nowrap"
          color="primary"
          disabled={answer.isEvaluating}
          startIcon={answer.isEvaluating ? (<LoadingIndicator bare size={15} />) : undefined}
          onClick={() => {
            if (answer.isMock) {
              dispatch(
                questionRubricsActions.requestMockAnswerEvaluation({
                  mockAnswerId: answer.id,
                  rubricId: selectedRubricId,
                }),
              );
              evaluatePlaygroundMockAnswer(
                selectedRubricId,
                answer.id,
              ).then((evaluation) => {
                dispatch(
                  questionRubricsActions.updateMockAnswerEvaluation({
                    mockAnswerId: answer.id,
                    rubricId: selectedRubricId,
                    evaluation,
                  }),
                );
              });
            } else {
              dispatch(
                questionRubricsActions.requestAnswerEvaluation({
                  answerId: answer.id,
                  rubricId: selectedRubricId,
                }),
              );
              evaluatePlaygroundAnswer(
                selectedRubricId,
                answer.id,
              ).then((evaluation) => {
                dispatch(
                  questionRubricsActions.updateAnswerEvaluation({
                    answerId: answer.id,
                    rubricId: selectedRubricId,
                    evaluation,
                  }),
                );
              });
            }
          }}
          variant="outlined"
        >
          {answer.isEvaluating ? 'Evaluating' : 'Evaluate'}
        </Button>
        </div>
      ),
    colSpan: (answer: AnswerTableEntry) =>
      (answer.evaluation && !answer.isEvaluating) ? 1 : categories.length + (categories.length === 1 ? 0 : 1),
  });

  const maximumTotalGrade = categories.reduce(
    (sum, category) => sum + category.maximumGrade,
    0,
  );

  const columns: ColumnTemplate<AnswerTableEntry>[] = [
    {
      of: 'title',
      title: 'Student',
      searchable: true,
      sortable: true,
      cell: (answer) => answer.title,
    },
    ...categories.map((category, categoryIndex) =>
      categoryIndex === 0
        ? firstCategoryColumn(category)
        : remainingCategoryColumns(category, categoryIndex),
    ),
    {
      id: 'totalGrade',
      title: 'Total',
      sortable: true,
      sortProps: {
        sort: (x, y) =>
          (x.evaluation?.totalGrade ?? 0) - (y.evaluation?.totalGrade ?? 0),
      },
      searchProps: {
        getValue: (a) => a.evaluation?.totalGrade?.toString(),
      },
      cell: (answer: AnswerTableEntry) => (
        Boolean(answer.evaluation) ? (
        <div className="space-y-1">
          <p className="m-0 text-center w-full">
            {answer.evaluation?.totalGrade} / {maximumTotalGrade}{' '}
          </p>
        </div>) : <div/>
      ),
      unless: categories.length <= 1,
      cellUnless: (answer: AnswerTableEntry) => !answer.evaluation || answer.isEvaluating,
    },
    {
      of: 'answerText',
      title: 'Answer',
      cell: (answer) => <div className="line-clamp-4">{answer.answerText.replace('<p>', '').replace('</p>', '')}</div>,
    },
    {
      id: 'feedback',
      title: 'Feedback',
      cell: (answer) => (
        <div className="line-clamp-4">{answer.evaluation?.feedback}</div>
      ),
    },
  ];
  return (
    <Table
      columns={columns}
      data={tableData}
      getRowClassName={(answer): string => `answer_${answer.id}`}
      getRowEqualityData={(answer) => answer}
      getRowId={(instance): string => instance.id.toString()}
    />
  );
};

export default AnswerEvaluationsTable;
