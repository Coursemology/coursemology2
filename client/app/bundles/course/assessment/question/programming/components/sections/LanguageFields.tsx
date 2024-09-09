import { ChangeEventHandler } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Alert } from '@mui/material';
import {
  LanguageMode,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';

import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import { useProgrammingFormDataContext } from '../../hooks/ProgrammingFormDataContext';
import { LanguageOption } from '../../hooks/useLanguageMode';
import { isLanguageSupported } from '../package/PolyglotEditor';

interface LanguageFieldsProps {
  languageOptions: LanguageOption[];
  getModeFromId: (id: number) => LanguageMode;
  disabled?: boolean;
}

const LanguageFields = (props: LanguageFieldsProps): JSX.Element => {
  const { t } = useTranslation();

  const { control, watch, setValue } = useFormContext<ProgrammingFormData>();

  const { question } = useProgrammingFormDataContext();

  const currentLanguage = props.getModeFromId(watch('question.languageId'));
  const autogradedAssessment = question.autogradedAssessment;
  const autograded = watch('question.autograded');

  return (
    <>
      <Controller
        control={control}
        name="question.languageId"
        render={({ field, fieldState }): JSX.Element => {
          const onChange: ChangeEventHandler<HTMLSelectElement> = (e): void => {
            field.onChange(e.target.value);

            const value = parseInt(e.target.value, 10);
            const language = props.getModeFromId(value);

            setValue('testUi.mode', language);

            if (!isLanguageSupported(language)) {
              setValue('question.autograded', false);
            }
          };
          return (
            <>
              <FormSelectField
                disabled={props.disabled}
                field={{ ...field, onChange }}
                fieldState={fieldState}
                label={t(translations.language)}
                options={props.languageOptions}
                required
                variant="filled"
              />
              {props.languageOptions.find(
                (option) => option.value === field.value && option.disabled,
              ) && (
                <Alert severity="warning">
                  {t(translations.languageDeprecatedWarning)}
                </Alert>
              )}
            </>
          );
        }}
      />

      <Controller
        control={control}
        name="question.autograded"
        render={({ field, fieldState }): JSX.Element => (
          <FormCheckboxField
            description={t(translations.evaluateAndTestCodeHint)}
            disabled={
              !isLanguageSupported(currentLanguage) ||
              question.hasAutoGradings ||
              props.disabled
            }
            disabledHint={
              question.hasAutoGradings
                ? t(translations.cannotDisableHasSubmissions)
                : undefined
            }
            field={field}
            fieldState={fieldState}
            label={t(translations.evaluateAndTestCode)}
          />
        )}
      />

      {autogradedAssessment && !autograded && (
        <Alert severity="warning">
          {t(translations.autogradedAssessmentButNoEvaluationWarning)}
        </Alert>
      )}
    </>
  );
};

export default LanguageFields;
