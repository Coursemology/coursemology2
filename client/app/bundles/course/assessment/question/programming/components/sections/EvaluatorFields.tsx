import { Controller, useFormContext } from 'react-hook-form';
import { Grid, InputAdornment, RadioGroup, Typography } from '@mui/material';
import {
  LanguageData,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import ExperimentalChip from 'lib/components/core/ExperimentalChip';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import { useProgrammingFormDataContext } from '../../hooks/ProgrammingFormDataContext';

interface EvaluatorFieldsProps {
  disabled?: boolean;
  getDataFromId: (id: number) => LanguageData;
}

const EvaluatorFields = (props: EvaluatorFieldsProps): JSX.Element | null => {
  const { t } = useTranslation();

  const { control, watch } = useFormContext<ProgrammingFormData>();

  const { question } = useProgrammingFormDataContext();

  const currentLanguage = props.getDataFromId(watch('question.languageId'));
  const autograded = watch('question.autograded');
  if (!autograded) return null;

  const autogradedAssessment = question.autogradedAssessment;
  const codaveriDisabled = !question.codaveriEnabled;

  return (
    <>
      <Subsection className="!mt-10" title={t(translations.evaluator)}>
        <Controller
          control={control}
          name="question.isCodaveri"
          render={({ field, fieldState: { error } }): JSX.Element => (
            <RadioGroup
              className="space-y-5"
              {...field}
              onChange={(e): void => {
                if (codaveriDisabled) return;
                field.onChange(e.target.value === 'codaveri');
              }}
              value={field.value ? 'codaveri' : 'default'}
            >
              {error && (
                <Typography color="error" variant="body2">
                  {error.message}
                </Typography>
              )}
              <RadioButton
                className="my-0"
                description={t(translations.defaultEvaluatorHint)}
                disabled={
                  !currentLanguage?.whitelists.defaultEvaluator ||
                  props.disabled
                }
                label={t(translations.defaultEvaluator)}
                value="default"
              />

              <RadioButton
                className="my-0"
                description={t(translations.codaveriEvaluatorHint)}
                disabled={
                  codaveriDisabled ||
                  !currentLanguage?.whitelists.codaveriEvaluator ||
                  props.disabled
                }
                disabledHint={
                  codaveriDisabled &&
                  t(translations.canEnableCodaveriInComponents)
                }
                label={
                  <span className="flex items-center space-x-2">
                    <span>{t(translations.codaveriEvaluator)}</span>

                    <ExperimentalChip
                      disabled={
                        codaveriDisabled ||
                        !currentLanguage?.whitelists.codaveriEvaluator ||
                        props.disabled
                      }
                    />
                  </span>
                }
                value="codaveri"
              />
            </RadioGroup>
          )}
        />
      </Subsection>

      <Subsection
        className="!mt-10"
        spaced
        title={t(translations.evaluationLimits)}
      >
        <Grid container direction="row" spacing={2}>
          <Grid item xs>
            <Controller
              control={control}
              name="question.memoryLimit"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={props.disabled}
                  disableMargins
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {t(translations.megabytes)}
                      </InputAdornment>
                    ),
                  }}
                  label={t(translations.memoryLimit)}
                  variant="filled"
                />
              )}
            />
          </Grid>

          <Grid item xs>
            <Controller
              control={control}
              name="question.timeLimit"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={props.disabled}
                  disableMargins
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {t(translations.seconds)}
                      </InputAdornment>
                    ),
                  }}
                  label={t(translations.timeLimit)}
                  variant="filled"
                />
              )}
            />
          </Grid>

          {!autogradedAssessment && (
            <Grid item xs>
              <Controller
                control={control}
                name="question.attemptLimit"
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    disabled={props.disabled}
                    disableMargins
                    field={field}
                    fieldState={fieldState}
                    fullWidth
                    label={t(translations.attemptLimit)}
                    variant="filled"
                  />
                )}
              />
            </Grid>
          )}
        </Grid>

        <Controller
          control={control}
          name="question.isLowPriority"
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              description={t(translations.lowestGradingPriorityHint)}
              disabled={props.disabled}
              field={field}
              fieldState={fieldState}
              label={t(translations.lowestGradingPriority)}
            />
          )}
        />
      </Subsection>
    </>
  );
};

export default EvaluatorFields;
