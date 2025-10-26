import { FC } from 'react';
import { Close, Refresh } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { AppDispatch } from 'store';
import { RubricCategoryData, RubricData } from 'types/course/rubrics';

import Table, { ColumnTemplate } from 'lib/components/table';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import { actions as questionRubricsActions } from '../../reducers/rubrics';
import {
  deleteAnswerEvaluation,
  evaluatePlaygroundAnswer,
} from '../operations/answers';
import {
  deleteMockAnswerEvaluation,
  evaluatePlaygroundMockAnswer,
} from '../operations/mockAnswers';

import CategoryGradeCell from './CategoryGradeCell';
import PopoverContentCell from './PopoverContentCell';
import TotalGradeCell from './TotalGradeCell';
import { AnswerTableEntry } from './types';
import UnevaluatedCell from './UnevaluatedCell';
import {
  answerCategoryGradeGetter,
  answerDataToTableEntry,
  answerSortFn,
  answerTotalGradeGetter,
  isAnswerAlreadyEvaluated,
} from './utils';

interface AnswerEvaluationsTableProps {
  compareCount: number;
  isComparing: boolean;
  selectedRubricId: number;
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

const AnswerEvaluationsTable: FC<AnswerEvaluationsTableProps> = (props) => {
  const { selectedRubricId, isComparing, compareCount } = props;

  const dispatch = useAppDispatch();

  const { answers, rubrics, mockAnswers } = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );
  if (!rubrics[selectedRubricId]) return null;
  const sortedRubrics = Object.values(rubrics).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const selectedRubricIndex = Object.values(rubrics).findIndex(
    (rubric) => rubric.id === selectedRubricId,
  );

  const { answerEvaluations, mockAnswerEvaluations, categories } =
    rubrics[selectedRubricId];

  const compareRubrics = isComparing
    ? sortedRubrics.slice(
        Math.max(0, selectedRubricIndex - compareCount + 1),
        selectedRubricIndex + 1,
      )
    : undefined;

  const tableData: AnswerTableEntry[] = Object.values(answers)
    .filter((answer) => answer.id in answerEvaluations)
    .map((answer) =>
      answerDataToTableEntry(
        answer,
        false,
        answerEvaluations[answer.id],
        compareRubrics,
      ),
    )
    .concat(
      ...Object.values(mockAnswers)
        .filter((mockAnswer) => mockAnswer.id in mockAnswerEvaluations)
        .map((mockAnswer) =>
          answerDataToTableEntry(
            mockAnswer,
            true,
            mockAnswerEvaluations[mockAnswer.id],
            compareRubrics,
          ),
        ),
    );

  const maximumTotalGrade = categories.reduce(
    (sum, category) => sum + category.maximumGrade,
    0,
  );

  const firstCategoryGradeColumn = (
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
      sort: answerSortFn(answerCategoryGradeGetter(category)),
    },

    searchProps: {
      getValue: answerCategoryGradeGetter(category),
    },

    className: 'max-lg:!hidden p-0',
    cell: (answer: AnswerTableEntry) =>
      isAnswerAlreadyEvaluated(answer) ? (
        <CategoryGradeCell
          answer={answer}
          category={category}
          compareGrades={answer.compareGrades?.map((rubricGrades) =>
            rubricGrades.at(0),
          )}
        />
      ) : (
        <UnevaluatedCell
          answer={answer}
          handleEvaluate={() =>
            requestRowEvaluation(dispatch, answer, selectedRubricId)
          }
        />
      ),
    colSpan: (answer: AnswerTableEntry) =>
      isAnswerAlreadyEvaluated(answer)
        ? 1
        : categories.length + (categories.length === 1 ? 0 : 1),
  });

  const remainingCategoryGradeColumns = (
    category: RubricCategoryData,
    categoryIndex: number,
  ): ColumnTemplate<AnswerTableEntry> => ({
    id: `grade_${categoryIndex + 1}`,
    className: 'max-lg:!hidden p-0',

    title: () => (
      <Tooltip title={category.name}>
        <span>C{categoryIndex + 1}</span>
      </Tooltip>
    ),

    sortable: true,
    sortProps: {
      sort: answerSortFn(answerCategoryGradeGetter(category)),
    },
    searchProps: {
      getValue: answerCategoryGradeGetter(category),
    },

    cell: (answer: AnswerTableEntry) => (
      <CategoryGradeCell
        answer={answer}
        category={category}
        compareGrades={answer.compareGrades?.map((rubricGrades) =>
          rubricGrades.at(categoryIndex),
        )}
      />
    ),
    cellUnless: (answer: AnswerTableEntry) => !isAnswerAlreadyEvaluated(answer),
  });

  const smallScreenGradesColumn = {
    id: 'grade_small',
    title: 'Grade',
    sortable: true,
    className: 'lg:!hidden p-0',
    sortProps: {
      sort: answerSortFn(answerTotalGradeGetter),
    },
    searchProps: {
      getValue: answerTotalGradeGetter,
    },
    cell: (answer: AnswerTableEntry) =>
      answer.evaluation ? (
        <TotalGradeCell answer={answer} maximumTotalGrade={maximumTotalGrade} />
      ) : (
        <UnevaluatedCell
          answer={answer}
          compact
          handleEvaluate={() =>
            requestRowEvaluation(dispatch, answer, selectedRubricId)
          }
        />
      ),
  };

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
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
      ),
    },
    smallScreenGradesColumn,
    ...categories.map((category, categoryIndex) =>
      categoryIndex === 0
        ? firstCategoryGradeColumn(category)
        : remainingCategoryGradeColumns(category, categoryIndex),
    ),
    {
      id: 'totalGrade',
      title: 'Total',
      sortable: true,
      className: 'max-lg:!hidden p-0',
      sortProps: {
        sort: answerSortFn(answerTotalGradeGetter),
      },
      searchProps: {
        getValue: answerTotalGradeGetter,
      },
      cell: (answer: AnswerTableEntry) =>
        answer.evaluation ? (
          <TotalGradeCell
            answer={answer}
            maximumTotalGrade={maximumTotalGrade}
          />
        ) : (
          <div />
        ),
      unless: categories.length <= 1,
      cellUnless: (answer: AnswerTableEntry) =>
        !isAnswerAlreadyEvaluated(answer),
    },
    {
      of: 'answerText',
      title: 'Answer',
      cell: (answer) => <PopoverContentCell content={answer.answerText} />,
    },
    {
      id: 'feedback',
      title: 'Feedback',
      cell: (answer) => (
        <PopoverContentCell content={answer.evaluation?.feedback ?? ''} />
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
