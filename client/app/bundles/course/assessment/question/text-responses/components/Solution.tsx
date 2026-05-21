import { Controller, useFormContext } from 'react-hook-form';
import { Undo } from '@mui/icons-material';
import { IconButton, Select, Tooltip, Typography } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import { TextResponseEditableFormData } from 'types/course/assessment/question/text-responses';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import TextField from 'lib/components/core/fields/TextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

interface SolutionProps {
  index: number;
  onDelete: () => void;
  onUndoDelete: () => void;
  disabled?: boolean;
}

const Solution = ({
  index,
  disabled,
  onDelete,
  onUndoDelete,
}: SolutionProps): JSX.Element => {
  const { t } = useTranslation();
  const { control, watch } = useFormContext<TextResponseEditableFormData>();

  const toBeDeleted = watch(`solutions.${index}.toBeDeleted`);
  const isDraft = watch(`solutions.${index}.draft`);
  const solutionId = watch(`solutions.${index}.id`);

  return (
    <section
      className={`flex border-0 border-b border-solid border-neutral-200 last:border-b-0 ${
        toBeDeleted ? 'border-neutral-300 bg-neutral-200' : ''
      } ${isDraft ? 'bg-lime-50' : ''}`}
    >
      <div className="mx-8 mt-0 flex w-[calc(100%_-_84px)] flex-col space-y-4 py-4">
        <div className="flex flex-row space-x-4">
          <div className="flex w-2/4 flex-col space-y-2">
            <FormHelperText>{t(translations.solutionType)}</FormHelperText>
            <Controller
              control={control}
              name={`solutions.${index}.solutionType`}
              render={({ field, fieldState }): JSX.Element => (
                <>
                  <Select
                    disabled={toBeDeleted || disabled}
                    error={!!fieldState.error}
                    id="solution-type"
                    native
                    variant="outlined"
                    {...field}
                  >
                    <option value="exact_match">
                      {t(translations.exactMatch)}
                    </option>
                    <option value="keyword">{t(translations.keyword)}</option>
                  </Select>
                  {fieldState.error && (
                    <FormHelperText error>
                      {formatErrorMessage(fieldState.error.message)}
                    </FormHelperText>
                  )}
                </>
              )}
            />
          </div>

          <div className="flex w-2/4 flex-col space-y-2">
            <FormHelperText>{t(translations.grade)}</FormHelperText>
            <Controller
              control={control}
              name={`solutions.${index}.grade`}
              render={({ field, fieldState }): JSX.Element => (
                <>
                  <TextField
                    disabled={toBeDeleted || disabled}
                    error={!!fieldState.error}
                    placeholder={t(translations.zeroGrade)}
                    {...field}
                  />
                  {fieldState.error && (
                    <FormHelperText error>
                      {formatErrorMessage(fieldState.error.message)}
                    </FormHelperText>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div className="flex flex-row space-x-4">
          <div className="flex w-2/4 flex-col space-y-2">
            <FormHelperText>{t(translations.solution)}</FormHelperText>
            <Controller
              control={control}
              name={`solutions.${index}.solution`}
              render={({ field, fieldState }): JSX.Element => (
                <>
                  <TextField
                    disabled={toBeDeleted || disabled}
                    error={!!fieldState.error}
                    multiline
                    rows={2}
                    {...field}
                  />
                  {fieldState.error && (
                    <FormHelperText error>
                      {formatErrorMessage(fieldState.error.message)}
                    </FormHelperText>
                  )}
                </>
              )}
            />
          </div>

          <div className="flex w-2/4 flex-col space-y-2">
            <FormHelperText>{t(translations.explanation)}</FormHelperText>
            {toBeDeleted ? (
              <Typography className="italic text-neutral-500" variant="body2">
                {t(translations.solutionWillBeDeleted)}
              </Typography>
            ) : (
              <Controller
                control={control}
                name={`solutions.${index}.explanation`}
                render={({ field }): JSX.Element => (
                  <CKEditorRichText
                    disabled={disabled}
                    disableMargins
                    inputId={`solution-${solutionId}-explanation`}
                    name="explanation"
                    onChange={field.onChange}
                    placeholder={t(translations.explanationDescription)}
                    value={field.value ?? ''}
                  />
                )}
              />
            )}
          </div>
        </div>

        {isDraft && (
          <Typography className="italic text-neutral-500" variant="body2">
            {t(translations.newSolutionCannotUndo)}
          </Typography>
        )}
      </div>

      <div className="py-4">
        {toBeDeleted ? (
          <Tooltip title={t(translations.undoDeleteSolution)}>
            <IconButton
              aria-label={t(translations.undoDeleteSolution)}
              color="error"
              disabled={disabled}
              onClick={onUndoDelete}
            >
              <Undo />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={t(translations.deleteSolution)}>
            <IconButton
              aria-label={t(translations.deleteSolution)}
              color="error"
              disabled={disabled}
              onClick={onDelete}
            >
              <Undo />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </section>
  );
};

Solution.displayName = 'Solution';

export default Solution;
