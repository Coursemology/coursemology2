import { FC, useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Undo } from '@mui/icons-material';
import {
  Alert,
  Button,
  IconButton,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import { TextResponseEditableFormData } from 'types/course/assessment/question/text-responses';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormSingleFileInput from 'lib/components/form/fields/SingleFileInput';
import SpreadsheetPreview from 'lib/components/form/fields/SingleFileInput/SpreadsheetPreview';
import FormTextField from 'lib/components/form/fields/TextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import { generateRandomSeed } from '../utils';

import SpreadsheetManagerPrompt from './SpreadsheetManagerPrompt';

interface SolutionProps {
  index: number;
  onDelete: () => void;
  onUndoDelete: () => void;
  disabled?: boolean;
}

const Solution: FC<SolutionProps> = ({
  index,
  disabled,
  onDelete,
  onUndoDelete,
}: SolutionProps) => {
  const { t } = useTranslation();
  const { control, watch, setValue } =
    useFormContext<TextResponseEditableFormData>();

  const solution = watch(`solutions.${index}`);

  const [isAdvancedPromptOpen, setIsAdvancedPromptOpen] = useState(false);

  useEffect(() => {
    if (solution?.solutionType === 'spreadsheet_formula') {
      setValue(`solutions.${index}.spreadsheet`, {
        isRandomizationEnabled:
          solution.spreadsheet?.isRandomizationEnabled ?? true,
        isRandomSeedFixed: solution.spreadsheet?.isRandomSeedFixed ?? false,
        randomSeed: solution.spreadsheet?.randomSeed ?? generateRandomSeed(),
        isTimestampFixed: solution.spreadsheet?.isTimestampFixed ?? false,
        testTimestamp: new Date(
          solution.spreadsheet?.testTimestamp ?? Date.now(),
        ),
        numRandomTests: solution.spreadsheet?.numRandomTests ?? 2,
        file: solution.spreadsheet?.file ?? { file: null, name: '', url: '' },
        variables: solution.spreadsheet?.variables,
      });
    }
  }, [solution?.solutionType]);

  const spreadsheetFile = solution?.spreadsheet?.file?.file;

  if (!solution) {
    return null;
  }

  return (
    <section
      className={`flex border-0 border-b border-solid border-neutral-200 last:border-b-0 ${
        solution?.toBeDeleted ? 'bg-red-50' : ''
      } ${solution?.draft ? 'bg-lime-50' : ''}`}
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
                    disabled={solution.toBeDeleted || disabled}
                    error={!!fieldState.error}
                    native
                    size="small"
                    variant="outlined"
                    {...field}
                  >
                    <option value="exact_match">
                      {t(translations.exactMatch)}
                    </option>
                    <option value="keyword">{t(translations.keyword)}</option>
                    <option value="regex">{t(translations.regex)}</option>
                    <option value="spreadsheet_formula">
                      {t(translations.spreadsheetFormula)}
                    </option>
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
                  disabled={solution.toBeDeleted || disabled}
                  disableMargins
                  field={field}
                  fieldState={fieldState}
                  placeholder={t(translations.zeroGrade)}
                  size="small"
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
                    className={`w-full h-full resize-none rounded border border-solid p-2 disabled:bg-neutral-100 disabled:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-inset ${fieldState.error ? 'border-red-500 focus:ring-red-500' : 'border-neutral-400 focus:ring-blue-600'}`}
                    disabled={solution.toBeDeleted || disabled}
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
                  disabled={solution.toBeDeleted || disabled}
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
        {solution.solutionType === 'spreadsheet_formula' && (
          <>
            <div className="flex flex-col space-y-1">
              <Typography variant="body1">
                {t(translations.testSpreadsheet)}
              </Typography>
              <Controller
                control={control}
                defaultValue={{ name: '', url: '' }}
                name={`solutions.${index}.spreadsheet.file`}
                render={({ field, fieldState }): JSX.Element => (
                  <>
                    <Typography className="text-neutral-500" variant="body2">
                      {t(translations.testSpreadsheetDescription)}
                    </Typography>
                    <FormSingleFileInput
                      accept={{
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                          ['.xlsx'],
                        'application/vnd.oasis.opendocument.spreadsheet': [
                          '.ods',
                        ],
                      }}
                      className="p-3"
                      disabled={solution.toBeDeleted || disabled}
                      field={{
                        ...field,
                        onChange: (value) => {
                          if (value?.file instanceof File) {
                            field.onChange({ ...value, name: value.file.name });
                            setValue(
                              `solutions.${index}.spreadsheet.variables`,
                              undefined,
                            );
                          }
                        },
                      }}
                      fieldState={fieldState}
                      previewComponent={SpreadsheetPreview}
                    />
                  </>
                )}
              />
            </div>

            <Controller
              control={control}
              name={`solutions.${index}.spreadsheet.isRandomizationEnabled`}
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  description={t(
                    translations.spreadsheetRandomizationDescription,
                  )}
                  disabled={solution.toBeDeleted || disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.spreadsheetRandomization)}
                />
              )}
            />
            <div className="space-y-2">
              <FormHelperText>
                {t(translations.numberOfRandomTests)}
              </FormHelperText>
              <Controller
                control={control}
                name={`solutions.${index}.spreadsheet.numRandomTests`}
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    disabled={
                      solution.toBeDeleted ||
                      !solution.spreadsheet?.isRandomizationEnabled
                    }
                    disableMargins
                    field={{
                      ...field,
                      onChange: (value) =>
                        field.onChange(
                          typeof value === 'number'
                            ? Math.min(16, Math.max(2, value))
                            : value,
                        ),
                    }}
                    fieldState={fieldState}
                    size="small"
                    type="number"
                  />
                )}
              />
            </div>
            <Button
              className="w-fit"
              disabled={solution.toBeDeleted || disabled}
              onClick={() => setIsAdvancedPromptOpen(true)}
              size="small"
              variant="contained"
            >
              {t(translations.spreadsheetAdvancedOptions)}
            </Button>
            <SpreadsheetManagerPrompt
              file={spreadsheetFile}
              index={index}
              onClose={() => setIsAdvancedPromptOpen(false)}
              open={isAdvancedPromptOpen}
            />
          </>
        )}
        {solution.draft && (
          <Alert
            className="border-lime-300"
            severity="warning"
            variant="outlined"
          >
            {t(translations.newSolutionCannotUndo)}
          </Alert>
        )}

        {solution.toBeDeleted && (
          <Alert className="border-red-300" severity="error" variant="outlined">
            {t(translations.solutionWillBeDeleted)}
          </Alert>
        )}
      </div>

      <div className="py-4">
        {solution.toBeDeleted ? (
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
