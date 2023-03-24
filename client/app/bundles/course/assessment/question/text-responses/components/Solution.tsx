import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Undo } from '@mui/icons-material';
import { IconButton, Select, Tooltip, Typography } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import produce from 'immer';
import { SolutionEntity } from 'types/course/assessment/question/text-responses';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import TextField from 'lib/components/core/fields/TextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import useDirty from '../../commons/useDirty';
import { SolutionErrors } from '../commons/validations';

interface SolutionProps {
  for: SolutionEntity;
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

    const handleDelete = (): void => {
      if (!solution.draft) {
        update('toBeDeleted', true);
        setToBeDeleted(true);
      } else {
        props.onDeleteDraft();
      }
    };

    const undoDelete = (): void => {
      if (solution.draft) return;

      update('toBeDeleted', undefined);
      setToBeDeleted(false);
    };

    return (
      <section
        className={`flex border-0 border-b border-solid border-neutral-200 last:border-b-0 ${
          toBeDeleted ? 'border-neutral-300 bg-neutral-200' : ''
        } ${solution.draft ? 'bg-lime-50' : ''}`}
      >
        <div className="mx-8 mt-0 flex w-[calc(100%_-_84px)] flex-col space-y-4 py-4">
          <div className="flex flex-row space-x-4">
            <div className="flex w-2/4 flex-col space-y-2">
              <FormHelperText>{t(translations.solutionType)}</FormHelperText>
              <Select
                disabled={toBeDeleted || disabled}
                error={
                  error?.solutionType && formatErrorMessage(error.solutionType)
                }
                id="solution-type"
                name="solutionType"
                native
                onChange={(type): void =>
                  update(
                    'solutionType',
                    type.target.value as 'exact_match' | 'keyword',
                  )
                }
                value={solution.solutionType}
                variant="outlined"
              >
                <option value="exact_match">
                  {t(translations.exactMatch)}
                </option>
                <option value="keyword">{t(translations.keyword)}</option>
              </Select>
              {error?.solutionType && (
                <FormHelperText error={!!error?.solutionType}>
                  {formatErrorMessage(error.solutionType)}
                </FormHelperText>
              )}
            </div>

            <div className="flex w-2/4 flex-col space-y-2">
              <FormHelperText>{t(translations.grade)}</FormHelperText>
              <TextField
                disabled={toBeDeleted || disabled}
                error={error?.grade && formatErrorMessage(error.grade)}
                name="grade"
                onChange={(e): void => update('grade', e.target.value)}
                placeholder={t(translations.zeroGrade)}
                value={solution.grade}
              />
              {error?.grade && (
                <FormHelperText error={!!error?.grade}>
                  {formatErrorMessage(error.grade)}
                </FormHelperText>
              )}
            </div>
          </div>

          <div className="flex flex-row space-x-4">
            <div className="flex w-2/4 flex-col space-y-2">
              <FormHelperText>{t(translations.solution)}</FormHelperText>
              <TextField
                disabled={toBeDeleted || disabled}
                error={error?.solution && formatErrorMessage(error.solution)}
                multiline
                name="solution"
                onChange={(e): void => update('solution', e.target.value)}
                rows={2}
                value={solution.solution}
              />
              {error?.solution && (
                <FormHelperText error={!!error?.solution}>
                  {formatErrorMessage(error.solution)}
                </FormHelperText>
              )}
            </div>

            <div className="flex w-2/4 flex-col space-y-2">
              <FormHelperText>{t(translations.explanation)}</FormHelperText>
              {toBeDeleted ? (
                <Typography className="italic text-neutral-500" variant="body2">
                  {t(translations.solutionWillBeDeleted)}
                </Typography>
              ) : (
                <CKEditorRichText
                  disabled={toBeDeleted || disabled}
                  disableMargins
                  inputId={`solution-${solution.id}-explanation`}
                  name="explanation"
                  onChange={(explanation): void =>
                    update('explanation', explanation)
                  }
                  placeholder={t(translations.explanationDescription)}
                  value={solution.explanation ?? ''}
                />
              )}
            </div>
          </div>
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
                disabled={disabled}
                onClick={undoDelete}
              >
                <Undo />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={t(translations.deleteSolution)}>
              <IconButton
                color="error"
                disabled={disabled}
                onClick={handleDelete}
              >
                <Undo />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </section>
    );
  },
);

Solution.displayName = 'Solution';

export default Solution;
