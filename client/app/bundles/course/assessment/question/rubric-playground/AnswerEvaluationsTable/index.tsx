import { FC } from 'react';
import { Close, Refresh } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { RubricCategoryData } from 'types/course/rubrics';

import Table, { ColumnTemplate } from 'lib/components/table';
import { useAppDispatch } from 'lib/hooks/store';

import { RubricState } from '../../reducers/rubrics';
import {
  deleteRowEvaluation,
  requestRowEvaluation,
} from '../operations/rowEvaluation';

import CategoryGradeCell from './CategoryGradeCell';
import PopoverContentCell from './PopoverContentCell';
import TotalGradeCell from './TotalGradeCell';
import { AnswerTableEntry } from './types';
import UnevaluatedCell from './UnevaluatedCell';
import {
  answerCategoryGradeGetter,
  answerSortFn,
  answerTotalGradeGetter,
  isAnswerAlreadyEvaluated,
} from './utils';

interface AnswerEvaluationsTableProps {
  data: AnswerTableEntry[];
  selectedRubric?: RubricState;
  isComparing: boolean;
}

const AnswerEvaluationsTable: FC<AnswerEvaluationsTableProps> = (props) => {
  const { data, selectedRubric, isComparing } = props;

  const dispatch = useAppDispatch();

  if (!selectedRubric) return null;

  const maximumTotalGrade = selectedRubric.categories.reduce(
    (sum, category) => sum + category.maximumGrade,
    0,
  );

  const isRenderingEvaluatedCells = (answer): boolean =>
    isAnswerAlreadyEvaluated(answer) || isComparing;

  const firstCategoryGradeColumn = (
    category: RubricCategoryData,
  ): ColumnTemplate<AnswerTableEntry> => ({
    id: `grade_1`,
    title: (() => (
      <Tooltip title={category.name}>
        <span>{selectedRubric.categories.length === 1 ? 'Grade' : 'C1'}</span>
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
      isRenderingEvaluatedCells(answer) ? (
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
            requestRowEvaluation(dispatch, answer, selectedRubric.id)
          }
        />
      ),
    colSpan: (answer: AnswerTableEntry) =>
      isRenderingEvaluatedCells(answer)
        ? 1
        : selectedRubric.categories.length +
          (selectedRubric.categories.length === 1 ? 0 : 1),
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
    cellUnless: (answer: AnswerTableEntry) =>
      !isRenderingEvaluatedCells(answer),
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
            requestRowEvaluation(dispatch, answer, selectedRubric.id)
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
                  deleteRowEvaluation(dispatch, answer, selectedRubric.id)
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
                    requestRowEvaluation(dispatch, answer, selectedRubric.id)
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
    ...selectedRubric.categories.map((category, categoryIndex) =>
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
      unless: selectedRubric.categories.length <= 1,
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
      data={data}
      getRowEqualityData={(answer) => answer}
      getRowId={(instance): string => instance.id.toString()}
    />
  );
};

export default AnswerEvaluationsTable;
