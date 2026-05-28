import { Controller, useFormContext } from 'react-hook-form';
import { Undo } from '@mui/icons-material';
import { Alert, IconButton, Select, Tooltip } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import { TextResponseEditableFormData } from 'types/course/assessment/question/text-responses';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import FormTextField from 'lib/components/form/fields/TextField';
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

  return (
    <section
      className={`flex border-0 border-b border-solid border-neutral-200 last:border-b-0 ${
        toBeDeleted ? 'bg-red-50' : ''
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
                <FormTextField
                  disabled={toBeDeleted || disabled}
                  disableMargins
                  field={field}
                  fieldState={fieldState}
                  placeholder={t(translations.zeroGrade)}
                />
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
                  <textarea
                    className="w-full h-full resize-none rounded border border-solid border-neutral-400 p-2 disabled:bg-neutral-100 disabled:text-neutral-400"
                    disabled={toBeDeleted || disabled}
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
            <Controller
              control={control}
              name={`solutions.${index}.explanation`}
              render={({ field }): JSX.Element => (
                <CKEditorRichText
                  disabled={toBeDeleted || disabled}
                  disableMargins
                  name={`solutions.${index}.explanation`}
                  onChange={field.onChange}
                  placeholder={t(translations.explanationDescription)}
                  value={field.value ?? ''}
                />
              )}
            />
          </div>
        </div>

        {isDraft && (
          <Alert
            className="border-lime-300"
            severity="warning"
            variant="outlined"
          >
            {t(translations.newSolutionCannotUndo)}
          </Alert>
        )}

        {toBeDeleted && (
          <Alert className="border-red-300" severity="error" variant="outlined">
            {t(translations.solutionWillBeDeleted)}
          </Alert>
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
