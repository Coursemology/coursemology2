import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Delete, Tune, Undo } from '@mui/icons-material';
import { Button, IconButton, Select, Tooltip, Typography } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import { produce } from 'immer';
import { ExistingSpreadsheet, SolutionEntity, SolutionType } from 'types/course/assessment/question/text-responses';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import TextField from 'lib/components/core/fields/TextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormSingleFileInput from 'lib/components/form/fields/SingleFileInput';
import Prompt from 'lib/components/core/dialogs/Prompt';
import SpreadsheetPreview, { type CellRandomConfig } from './SpreadsheetPreview';
import SpreadsheetPreviewCompact from './SpreadsheetPreviewCompact';
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

    const existingSpreadsheet = (() => {
      const s = originalSolution.spreadsheet;
      return s && 'filename' in s ? (s as ExistingSpreadsheet) : null;
    })();
    const existingVars = originalSolution.spreadsheet?.variables ?? {};

    const spreadsheetForm = useForm({
      defaultValues: {
        spreadsheetFile: { file: undefined as File | undefined, url: '', name: existingSpreadsheet?.filename ?? '' },
        isRandomizationEnabled: originalSolution.spreadsheet?.isRandomizationEnabled ?? false,
        isRandomSeedFixed: 'random_seed' in existingVars,
        randomSeed: ('random_seed' in existingVars ? existingVars.random_seed : 0) as number,
        isDateFixed: 'timestamp' in existingVars,
        fixedDate: ('timestamp' in existingVars ? existingVars.timestamp : '') as string,
      },
    });

    const { isDirty: isFormDirty } = spreadsheetForm.formState;
    const watchedSpreadsheetFile = spreadsheetForm.watch('spreadsheetFile');

    const [spreadsheetRandomConfig, setSpreadsheetRandomConfig] = useState<Record<string, CellRandomConfig>>({});
    const [spreadsheetSubstitutions, setSpreadsheetSubstitutions] = useState<Record<string, string>>({});

    // Reset randomization/substitution config whenever a new file is selected.
    useEffect(() => {
      setSpreadsheetRandomConfig({});
      setSpreadsheetSubstitutions({});
    }, [watchedSpreadsheetFile?.file]);

    const advancedSnapshot = useRef<{
      isRandomSeedFixed: boolean;
      randomSeed: number;
      isDateFixed: boolean;
      fixedDate: string;
    } | null>(null);

    useImperativeHandle(ref, () => ({
      getSolution: () => {
        const { spreadsheetFile, isRandomizationEnabled, isRandomSeedFixed, randomSeed, isDateFixed, fixedDate } =
          spreadsheetForm.getValues();
        if (solution.solutionType !== 'spreadsheet_formula') return solution;
        const base = solution.spreadsheet ?? { isRandomizationEnabled: false, variables: {} };
        const vars = { ...base.variables };
        if (isRandomSeedFixed) {
          vars.random_seed = randomSeed;
        } else {
          delete vars.random_seed;
        }
        if (isDateFixed) {
          vars.timestamp = typeof fixedDate === 'string' ? fixedDate : (fixedDate as any)?.toISOString?.() ?? '';
        } else {
          delete vars.timestamp;
        }
        return {
          ...solution,
          spreadsheet: {
            ...base,
            isRandomizationEnabled,
            variables: vars,
            ...(spreadsheetFile?.file ? { raw: spreadsheetFile.file } : {}),
          },
        };
      },
      reset: (): void => {
        setSolution(originalSolution);
        setToBeDeleted(false);
        reset();
        spreadsheetForm.reset();
        setSpreadsheetRandomConfig({});
        setSpreadsheetSubstitutions({});
      },
      setError,
      resetError: () => setError(undefined),
    }));

    useEffect(() => {
      props.onDirtyChange(isDirty || isFormDirty);
    }, [isDirty, isFormDirty]);

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

    const [advancedOpen, setAdvancedOpen] = useState(false);

    const openAdvanced = (): void => {
      const { isRandomSeedFixed, randomSeed, isDateFixed, fixedDate } = spreadsheetForm.getValues();
      advancedSnapshot.current = { isRandomSeedFixed, randomSeed, isDateFixed, fixedDate };
      setAdvancedOpen(true);
    };

    const cancelAdvanced = (): void => {
      if (advancedSnapshot.current) {
        const { isRandomSeedFixed, randomSeed, isDateFixed, fixedDate } = advancedSnapshot.current;
        spreadsheetForm.setValue('isRandomSeedFixed', isRandomSeedFixed);
        spreadsheetForm.setValue('randomSeed', randomSeed);
        spreadsheetForm.setValue('isDateFixed', isDateFixed);
        spreadsheetForm.setValue('fixedDate', fixedDate);
        advancedSnapshot.current = null;
      }
      setAdvancedOpen(false);
    };

    const saveAdvanced = (): void => {
      advancedSnapshot.current = null;
      setAdvancedOpen(false);
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
                onChange={(type): void => {
                  update(
                    'solutionType',
                    type.target.value as SolutionType,
                  )}
                }
                value={solution.solutionType}
                variant="outlined"
              >
                <option value="exact_match">
                  {t(translations.exactMatch)}
                </option>
                <option value="keyword">{t(translations.keyword)}</option>
                <option value="spreadsheet_formula">
                  {t(translations.spreadsheetFormula)}
                </option>
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
              <textarea
                name="solution"
                onChange={(e): void => update('solution', e.target.value)}
                value={solution.solution || ''}
                className='h-full'
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


            
          {solution.solutionType === 'spreadsheet_formula' && (
            <>
            <div className="flex flex-col space-y-1">
              <Typography variant="body1">{t(translations.testSpreadsheet)}</Typography>
              <Typography className="text-neutral-500" variant="body2">
                {t(translations.testSpreadsheetDescription)}
              </Typography>
            <Controller
              control={spreadsheetForm.control}
              name="spreadsheetFile"
              render={({ field, fieldState }): JSX.Element => (
                <FormSingleFileInput
                  accept={{
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
                  }}
                  disabled={toBeDeleted || disabled}
                  field={field}
                  fieldState={fieldState}
                  variant="outlined"
                  padding="p-3"
                />
              )}
            />
            {watchedSpreadsheetFile?.file && (
              <SpreadsheetPreviewCompact
                file={watchedSpreadsheetFile.file}
                randomConfig={spreadsheetRandomConfig}
                substitutions={spreadsheetSubstitutions}
              />
            )}
            </div>

            <Controller
              control={spreadsheetForm.control}
              name="isRandomizationEnabled"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  disabled={toBeDeleted || disabled}
                  field={field}
                  fieldState={fieldState}
                  label="Enable variable randomization"
                  description="If enabled, some spreadsheet values will be randomly adjusted when autograding. This is useful to ensure the formula actually computes the right answer instead of setting a predetermined value."
                />
              )}
            />

            <Button
              disabled={toBeDeleted || disabled}
              onClick={openAdvanced}
              size="small"
              variant="contained"
              className='w-fit'
            >
              Advanced options
            </Button>

            <Prompt
              open={advancedOpen}
              title="Advanced options"
              onClose={cancelAdvanced}
              primaryLabel="Save"
              onClickPrimary={saveAdvanced}
              maxWidth="lg"
            >
              <div className="flex flex-col space-y-4">
                <Controller
                  control={spreadsheetForm.control}
                  name="isRandomSeedFixed"
                  render={({ field, fieldState }): JSX.Element => (
                    <div className="flex flex-col space-y-2">
                      <FormCheckboxField
                        field={field}
                        fieldState={fieldState}
                        label="Fixed random seed"
                        description="If checked, formulas that produce random output (RAND, RANDBETWEEN, etc.) will produce consistent results between grading runs. The randomization applied to spreadsheet values by the grader itself will not be affected."
                      />
                      <div className="ml-[3.4rem]">
                        <Controller
                          control={spreadsheetForm.control}
                          name="randomSeed"
                          disabled={!spreadsheetForm.watch('isRandomSeedFixed')}
                          render={({ field: seedField, fieldState: seedFieldState }): JSX.Element => (
                            <FormTextField
                              disableMargins
                              field={seedField}
                              fieldState={seedFieldState}
                              inputProps={{ min: 0 }}
                              size="small"
                              type="number"
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}
                />

                <Controller
                  control={spreadsheetForm.control}
                  name="isDateFixed"
                  render={({ field, fieldState }): JSX.Element => (
                    <div className="flex flex-col space-y-2">
                      <FormCheckboxField
                        field={field}
                        fieldState={fieldState}
                        label="Fixed date functions"
                        description="If checked, formulas that depend on the current date/time (NOW, TODAY, etc.) will return this specific date instead. If unchecked, these formulas will return the date/time when autograding starts."
                      />
                      <div className="ml-[3.4rem]">
                        <Controller
                          control={spreadsheetForm.control}
                          name="fixedDate"
                          render={({ field: dateField, fieldState: dateFieldState }): JSX.Element => (
                            <FormDateTimePickerField
                              disableMargins
                              disabled={!spreadsheetForm.watch('isDateFixed')}
                              field={dateField}
                              fieldState={dateFieldState}
                              suppressesFormatErrors
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}
                />

            {watchedSpreadsheetFile?.file && (
              <SpreadsheetPreview
                file={watchedSpreadsheetFile.file}
                randomConfig={spreadsheetRandomConfig}
                onRandomConfigChange={setSpreadsheetRandomConfig}
                substitutions={spreadsheetSubstitutions}
                onSubstitutionsChange={setSpreadsheetSubstitutions}
              />
            )}
              </div>
            </Prompt>

            </>
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
