import { ChangeEventHandler } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Alert } from '@mui/material';
import {
  LanguageData,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';

import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import { useProgrammingFormDataContext } from '../../hooks/ProgrammingFormDataContext';
import { LanguageOption } from '../../hooks/useLanguageMode';

interface LanguageFieldsProps {
  languageOptions: LanguageOption[];
  getDataFromId: (id: number) => LanguageData;
  disabled?: boolean;
}

const LanguageFields = (props: LanguageFieldsProps): JSX.Element => {
  const { t } = useTranslation();

  const { control, watch, setValue } = useFormContext<ProgrammingFormData>();

  const { question } = useProgrammingFormDataContext();

  const currentLanguage = props.getDataFromId(watch('question.languageId'));
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
            const language = props.getDataFromId(value);

            setValue('testUi.mode', language.editorMode);

            if (
              !language.whitelists.codaveriEvaluator &&
              !language.whitelists.defaultEvaluator
            ) {
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
              (!currentLanguage?.whitelists.codaveriEvaluator &&
                !currentLanguage?.whitelists.defaultEvaluator) ||
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
