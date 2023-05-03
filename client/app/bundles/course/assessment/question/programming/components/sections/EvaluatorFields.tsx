import { Controller, useFormContext } from 'react-hook-form';
import { Grid, InputAdornment, RadioGroup } from '@mui/material';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import ExperimentalChip from 'lib/components/core/ExperimentalChip';
import Subsection from 'lib/components/core/layouts/Subsection';
import Link from 'lib/components/core/Link';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import { useProgrammingFormDataContext } from '../../hooks/ProgrammingFormDataContext';

interface EvaluatorFieldsProps {
  disabled?: boolean;
}

const EvaluatorFields = (props: EvaluatorFieldsProps): JSX.Element | null => {
  const { t } = useTranslation();

  const { control, watch } = useFormContext<ProgrammingFormData>();

  const { question } = useProgrammingFormDataContext();

  const autograded = watch('question.autograded');
  if (!autograded) return null;

  const hasSubmissions = question.hasSubmissions;
  const codaveriDisabled = !question.codaveriEnabled || hasSubmissions;
  const componentsSettingsUrl = question.componentsSettingsUrl;

  return (
    <>
      <Subsection
        className="!mt-10"
        subtitle={t(translations.evaluatorHint)}
        title={t(translations.evaluator)}
      >
        <Controller
          control={control}
          name="question.isCodaveri"
          render={({ field }): JSX.Element => (
            <RadioGroup
              className="space-y-5"
              {...field}
              onChange={(e): void => {
                if (codaveriDisabled) return;

                field.onChange(e.target.value === 'codaveri');
              }}
              value={field.value ? 'codaveri' : 'default'}
            >
              <RadioButton
                className="my-0"
                description={t(translations.defaultEvaluatorHint)}
                disabled={hasSubmissions || props.disabled}
                label={t(translations.defaultEvaluator)}
                value="default"
              />

              <RadioButton
                className="my-0"
                description={t(translations.codaveriEvaluatorHint)}
                disabled={codaveriDisabled || props.disabled}
                disabledHint={
                  codaveriDisabled &&
                  t(translations.canEnableCodaveriInComponents, {
                    url: (chunk) => (
                      <Link href={componentsSettingsUrl} opensInNewTab>
                        {chunk}
                      </Link>
                    ),
                  })
                }
                label={
                  <span className="flex items-center space-x-2">
                    <span>{t(translations.codaveriEvaluator)}</span>

                    <ExperimentalChip
                      disabled={codaveriDisabled || props.disabled}
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
                        {t(translations.mb)}
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
                        {t(translations.s)}
                      </InputAdornment>
                    ),
                  }}
                  label={t(translations.timeLimit)}
                  variant="filled"
                />
              )}
            />
          </Grid>

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
