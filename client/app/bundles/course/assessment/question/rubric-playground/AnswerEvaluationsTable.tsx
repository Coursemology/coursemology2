import { FC } from 'react';
import { Close, PlayArrow } from '@mui/icons-material';
import { Button, IconButton, Tooltip, Typography } from '@mui/material';
import { AppDispatch } from 'store';
import {
  RubricAnswerData,
  RubricAnswerEvaluationData,
  RubricCategoryData,
  RubricMockAnswerEvaluationData,
} from 'types/course/rubrics';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Table, { ColumnTemplate } from 'lib/components/table';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import { deleteMockAnswerEvaluation, evaluatePlaygroundMockAnswer } from './operations/mockAnswers';
import { deleteAnswerEvaluation, evaluatePlaygroundAnswer } from './operations/answers';

import { actions as questionRubricsActions } from '../reducers/rubrics';

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
  evaluation?:
    | RubricAnswerEvaluationData
    | RubricMockAnswerEvaluationData
    | Record<string, never>,
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
    if (evaluation?.selections?.length) {
      evaluation.selections.forEach((selection) => {
        grades[selection.categoryId] = selection.grade;
        totalGrade += selection.grade;
      });

      data.evaluation = {
        grades,
        feedback: evaluation?.feedback ?? '',
        totalGrade,
      };
    }
  }

  return data;
}

const requestRowEvaluation = (
  dispatch: AppDispatch,
  answer: AnswerTableEntry,
  rubricId: number,
): void => {
  if (answer.isMock) {
    dispatch(
      questionRubricsActions.requestMockAnswerEvaluation({
        mockAnswerId: answer.id,
        rubricId,
      }),
    );
    evaluatePlaygroundMockAnswer(rubricId, answer.id).then((evaluation) => {
      dispatch(
        questionRubricsActions.updateMockAnswerEvaluation({
          mockAnswerId: answer.id,
          rubricId,
          evaluation,
        }),
      );
    });
  } else {
    dispatch(
      questionRubricsActions.requestAnswerEvaluation({
        answerId: answer.id,
        rubricId,
      }),
    );
    evaluatePlaygroundAnswer(rubricId, answer.id).then((evaluation) => {
      dispatch(
        questionRubricsActions.updateAnswerEvaluation({
          answerId: answer.id,
          rubricId,
          evaluation,
        }),
      );
    });
  }
};

const deleteRowEvaluation = (
  dispatch: AppDispatch,
  answer: AnswerTableEntry,
  rubricId: number,
): void => {
  if (answer.isMock) {
    deleteMockAnswerEvaluation(rubricId, answer.id).then(() => {
      dispatch(
        questionRubricsActions.deleteMockAnswerEvaluation({
          mockAnswerId: answer.id,
          rubricId,
        }),
      );
    });
  } else {
    deleteAnswerEvaluation(rubricId, answer.id).then(() => {
      dispatch(
        questionRubricsActions.deleteAnswerEvaluation({
          answerId: answer.id,
          rubricId,
        }),
      );
    });
  }
};

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
  cellUnless: (answer: AnswerTableEntry) =>
    !answer.evaluation || answer.isEvaluating,
});

const AnswerEvaluationsTable: FC<AnswerEvaluationsTableProps> = (props) => {
  const { selectedRubricId } = props;

  const dispatch = useAppDispatch();

  const { answers, rubrics, mockAnswers } = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );
  if (!rubrics[selectedRubricId]) return null;

  const { answerEvaluations, mockAnswerEvaluations, categories } =
    rubrics[selectedRubricId];

  const tableData: AnswerTableEntry[] = Object.values(answers)
    .filter((answer) => answer.id in answerEvaluations)
    .map((answer) =>
      answerDataToTableEntry(answer, false, answerEvaluations[answer.id]),
    )
    .concat(
      ...Object.values(mockAnswers)
        .filter((mockAnswer) => mockAnswer.id in mockAnswerEvaluations)
        .map((mockAnswer) =>
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
      answer.evaluation && !answer.isEvaluating ? (
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
            onClick={() =>
              requestRowEvaluation(dispatch, answer, selectedRubricId)
            }
            startIcon={
              answer.isEvaluating ? (
                <LoadingIndicator bare size={15} />
              ) : (
                <PlayArrow />
              )
            }
            variant="outlined"
          >
            {answer.isEvaluating ? 'Evaluating' : 'Evaluate'}
          </Button>
        </div>
      ),
    colSpan: (answer: AnswerTableEntry) =>
      answer.evaluation && !answer.isEvaluating
        ? 1
        : categories.length + (categories.length === 1 ? 0 : 1),
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
      className: 'relative',
      cell: (answer) => (
        <div className="relative w-full h-full">
          {answer.title}
          <div className="absolute -top-2 -right-4 flex space-y-0 flex-col">
            <Tooltip title="Dismiss">
              <IconButton
                className="p-0"
                color="error"
                disabled={answer.isEvaluating}
                onClick={() =>
                  deleteRowEvaluation(dispatch, answer, selectedRubricId)
                }
                size="small"
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
            {answer.evaluation && (
              <Tooltip title="Re-evaluate">
                <IconButton
                  className="p-0"
                  color="primary"
                  disabled={answer.isEvaluating}
                  onClick={() =>
                    requestRowEvaluation(dispatch, answer, selectedRubricId)
                  }
                  size="small"
                >
                  <PlayArrow fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
      ),
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
      cell: (answer: AnswerTableEntry) =>
        answer.evaluation ? (
          <div className="space-y-1">
            <p className="m-0 text-center w-full">
              {answer.evaluation?.totalGrade} / {maximumTotalGrade}{' '}
            </p>
          </div>
        ) : (
          <div />
        ),
      unless: categories.length <= 1,
      cellUnless: (answer: AnswerTableEntry) =>
        !answer.evaluation || answer.isEvaluating,
    },
    {
      of: 'answerText',
      title: 'Answer',
      cell: (answer) => (
        <Typography
          className="whitespace-normal line-clamp-4"
          dangerouslySetInnerHTML={{
            __html: answer.answerText,
          }}
        />
      ),
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
      getRowClassName={(): string => `border-y border-black`}
      getRowEqualityData={(answer) => answer}
      getRowId={(instance): string => instance.id.toString()}
    />
  );
};

export default AnswerEvaluationsTable;
