import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { DragIndicator, Undo } from '@mui/icons-material';
import {
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import produce from 'immer';
import { SolutionEntity } from 'types/course/assessment/question/text-responses';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import NumberTextField from 'lib/components/core/fields/NumberTextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import useDirty from './useDirty';
import { SolutionErrors } from './validations';

interface SolutionProps {
  for: SolutionEntity;
  index: number;
  onDeleteDraft: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  disabled?: boolean;
}

export interface SolutionRef {
  getSolution: () => SolutionEntity;
  reset: () => void;
  resetError: () => void;
  setError: (error: SolutionErrors) => void;
}

const Solution = forwardRef<SolutionRef, SolutionProps>(
  (props, ref): JSX.Element => {
    const { disabled, for: originalSolution } = props;

    const [solution, setSolution] = useState(originalSolution);
    const [toBeDeleted, setToBeDeleted] = useState(false);
    const [error, setError] = useState<SolutionErrors>();

    const { isDirty, mark, reset } = useDirty<keyof SolutionEntity>();

    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
      getSolution: () => solution,
      reset: (): void => {
        setSolution(originalSolution);
        setToBeDeleted(false);
        reset();
      },
      setError,
      resetError: () => setError(undefined),
    }));

    useEffect(() => {
      props.onDirtyChange(isDirty);
    }, [isDirty]);

    const update = <T extends keyof SolutionEntity>(
      field: T,
      value: SolutionEntity[T],
    ): void => {
      setSolution(
        produce((draft) => {
          draft[field] = value;
        }),
      );

      mark(field, originalSolution[field] !== value);
    };

    const undoDelete = (): void => {
      if (solution.draft) return;

      update('toBeDeleted', undefined);
      setToBeDeleted(false);
    };

    return (
      <Draggable
        draggableId={`solution-${solution.id}`}
        index={props.index}
        isDragDisabled={disabled}
      >
        {(draggable, { isDragging }): JSX.Element => (
          <section
            ref={draggable.innerRef}
            {...draggable.draggableProps}
            className={`flex border-0 border-b border-solid border-neutral-200 last:border-b-0 ${
              toBeDeleted ? 'border-neutral-300 bg-neutral-200' : ''
            } ${solution.draft ? 'bg-lime-50' : ''} ${
              isDragging ? 'rounded-lg border-b-0 bg-white drop-shadow-md' : ''
            }`}
          >
            <div
              {...draggable.dragHandleProps}
              className="min-w-[44px] space-y-4 py-4 pl-4"
            >
              {!disabled && <DragIndicator color="disabled" fontSize="small" />}
            </div>
            <div className="mt-0 flex w-[calc(100%_-_84px)] flex-col space-y-4 py-4">
              <FormHelperText>{t(translations.solutionType)}</FormHelperText>
              <Select
                disabled={toBeDeleted || isDragging || disabled}
                error={
                  error?.solution && formatErrorMessage(error.solutionType)
                }
                name="solutionType"
                onChange={(type): void =>
                  update('solutionType', type.target.value)
                }
                value={solution.solutionType}
                variant="outlined"
              >
                <MenuItem value="exact_match">Exact Match</MenuItem>
                <MenuItem value="keyword">Keyword</MenuItem>
              </Select>

              <FormHelperText>{t(translations.solution)}</FormHelperText>
              <CKEditorRichText
                autofocus={solution.draft}
                disabled={toBeDeleted || isDragging || disabled}
                disableMargins
                error={error?.solution && formatErrorMessage(error.solution)}
                name="solution"
                onChange={(value): void => update('solution', value)}
                placeholder={t(translations.solution)}
                value={solution.solution}
              />

              <FormHelperText>{t(translations.grade)}</FormHelperText>
              <NumberTextField
                disabled={toBeDeleted || isDragging || disabled}
                error={error?.solution && formatErrorMessage(error.grade)}
                name="grade"
                onChange={(_, grade): void => {
                  const value = grade === '' ? 0 : grade;
                  update('grade', value);
                }}
                value={solution.grade}
              />

              <FormHelperText>{t(translations.explanation)}</FormHelperText>
              {toBeDeleted ? (
                <Typography className="italic text-neutral-500" variant="body2">
                  {t(translations.solutionWillBeDeleted)}
                </Typography>
              ) : (
                <CKEditorRichText
                  disabled={toBeDeleted || isDragging || disabled}
                  disableMargins
                  inputId={`solution-${solution.id}-explanation`}
                  name="explanation"
                  onChange={(explanation): void =>
                    update('explanation', explanation)
                  }
                  placeholder={t(translations.explanation)}
                  value={solution.explanation ?? ''}
                />
              )}

              {solution.draft && (
                <Typography className="italic text-neutral-500" variant="body2">
                  {t(translations.newSolutionCannotUndo)}
                </Typography>
              )}
            </div>

            <div className="py-4">
              {toBeDeleted ? (
                <Tooltip title={t(translations.undoDeleteSolution)}>
                  <IconButton
                    color="error"
                    disabled={isDragging || disabled}
                    onClick={undoDelete}
                  >
                    <Undo />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={t(translations.deleteSolution)}>
                  <IconButton
                    color="error"
                    disabled={isDragging || disabled}
                    onClick={undoDelete}
                  >
                    <Undo />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </section>
        )}
      </Draggable>
    );
  },
);

Solution.displayName = 'Solution';

export default Solution;
