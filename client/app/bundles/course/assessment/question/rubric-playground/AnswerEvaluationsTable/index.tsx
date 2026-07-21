import { FC } from 'react';
import {
  Close,
  Edit,
  PlayArrow,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import { IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { RubricCategoryData } from 'types/course/rubrics';

import Table, { ColumnTemplate } from 'lib/components/table';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { RubricState } from '../../reducers/rubrics';
import {
  deleteRowEvaluation,
  requestRowEvaluation,
} from '../operations/rowEvaluation';
import translations from '../translations';

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
  onEditMockAnswer: (mockAnswerId: number) => void;
  onViewAnswer: (answerId: number) => void;
}

const EmptyTablePlaceholder: FC = () => {
  const { t } = useTranslation();
  return (
    <Paper variant="outlined">
      <Typography className="text-neutral-500 text-center p-6" variant="body2">
        {t(translations.noAnswers)}
      </Typography>
    </Paper>
  );
};

const AnswerEvaluationsTable: FC<AnswerEvaluationsTableProps> = (props) => {
  const { t } = useTranslation();
  const { data, selectedRubric, isComparing, onEditMockAnswer, onViewAnswer } =
    props;

  const dispatch = useAppDispatch();

  if (!selectedRubric) return null;

  if (data.length === 0) {
    return <EmptyTablePlaceholder />;
  }

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
        <span>
          {selectedRubric.categories.length === 1
            ? t(translations.questionGrade)
            : t(translations.categoryHeading, { index: 1 })}
        </span>
      </Tooltip>
    )) as unknown as string,

    sortable: true,
    sortProps: {
      sort: answerSortFn(answerCategoryGradeGetter(category)),
    },

    searchProps: {
      getValue: answerCategoryGradeGetter(category),
    },

    className: 'max-lg:!hidden align-top',
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
    className: 'max-lg:!hidden align-top',

    title: () => (
      <Tooltip title={category.name}>
        <span>
          {t(translations.categoryHeading, { index: categoryIndex + 1 })}
        </span>
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
    title: t(translations.questionGrade),
    sortable: true,
    className: 'lg:!hidden align-top',
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
      title: t(translations.student),
      searchable: true,
      sortable: true,
      // The cell (td) stretches to the row height, so absolutely positioning the actions against it pins
      // them to the bottom of the row regardless of the name's length (a plain flex child cannot read the
      // stretched row height because a table-cell's percentage height resolves against the table, not the row).
      className: 'relative align-top [&:is(td)]:p-0',
      cell: (answer) => (
        <>
          <div className="p-4 pb-12">
            {answer.title ||
              (answer.isMock ? t(translations.mockAnswerPlaceholderTitle) : '')}
          </div>
          <div className="absolute bottom-2 left-4 flex flex-row items-center gap-1">
            <Tooltip
              title={t(
                answer.evaluation
                  ? translations.reevaluate
                  : translations.evaluate,
              )}
            >
              <IconButton
                className="p-0"
                color="primary"
                disabled={answer.isEvaluating}
                onClick={() =>
                  requestRowEvaluation(dispatch, answer, selectedRubric.id)
                }
                size="small"
              >
                {answer.evaluation ? (
                  <Refresh fontSize="small" />
                ) : (
                  <PlayArrow fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            {!answer.isMock && (
              <Tooltip title={t(translations.viewAnswer)}>
                <IconButton
                  className="p-0"
                  color="primary"
                  disabled={answer.isEvaluating}
                  onClick={() => onViewAnswer(answer.id)}
                  size="small"
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {answer.isMock && (
              <Tooltip title={t(translations.editMockAnswerTooltip)}>
                <IconButton
                  className="p-0"
                  color="primary"
                  onClick={() => onEditMockAnswer(answer.id)}
                  size="small"
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={t(translations.dismiss)}>
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
          </div>
        </>
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
      title: t(translations.totalGrade),
      sortable: true,
      className: 'max-lg:!hidden align-top',
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
      title: t(translations.answer),
      className: 'align-top',
      cell: (answer) => <PopoverContentCell content={answer.answerText} />,
    },
    {
      id: 'feedback',
      title: t(translations.feedback),
      className: 'align-top',
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
