import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Autocomplete } from '@mui/material';
import { SurveyConditionData } from 'types/course/conditions';

import CourseAPI from 'api/course';
import Prompt from 'lib/components/core/dialogs/Prompt';
import TextField from 'lib/components/core/fields/TextField';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import { formatErrorMessage } from '../../../form/fields/utils/mapError';
import { AnyConditionProps } from '../AnyCondition';
import translations from '../translations';

// TODO: Change string to Survey['title'] once Survey is typed
type SurveyOptions = Record<SurveyConditionData['id'], string>;

const SurveyConditionForm = (
  props: AnyConditionProps<SurveyConditionData> & { surveys: SurveyOptions },
): JSX.Element => {
  const { surveys } = props;
  const { t } = useTranslation();

  const autocompleteOptions = useMemo(() => {
    const keys = Object.keys(surveys);
    return keys.sort((a, b) => {
      const surveyA = surveys[parseInt(a, 10)];
      const surveyB = surveys[parseInt(b, 10)];
      return surveyA.localeCompare(surveyB);
    });
  }, [surveys]);

  const { control, handleSubmit, setError, formState } = useForm({
    defaultValues: props.condition ?? {
      surveyId: parseInt(autocompleteOptions[0], 10),
    },
  });

  const updateSurvey = (data: SurveyConditionData): void => {
    props.onUpdate(data, (errors) =>
      setError('surveyId', { message: errors.errors.survey }),
    );
  };

  const isNewCondition = !props.condition;

  return (
    <Prompt
      onClickPrimary={handleSubmit(updateSurvey)}
      onClose={props.onClose}
      open={props.open}
      primaryDisabled={!isNewCondition && !formState.isDirty}
      primaryLabel={
        isNewCondition
          ? t(translations.createCondition)
          : t(translations.updateCondition)
      }
      title={t(translations.chooseASurvey)}
    >
      <Controller
        control={control}
        name="surveyId"
        render={({ field, fieldState: { error } }): JSX.Element => (
          <Autocomplete
            {...field}
            disableClearable={true}
            fullWidth={true}
            getOptionLabel={(id): string => surveys[id] ?? ''}
            onChange={(_, value): void => field.onChange(parseInt(value, 10))}
            options={autocompleteOptions}
            renderInput={(inputProps): JSX.Element => (
              <TextField
                {...inputProps}
                error={Boolean(error)}
                helperText={error && formatErrorMessage(error.message)}
                label={t(translations.survey)}
                variant="filled"
              />
            )}
            value={field.value?.toString()}
          />
        )}
      />
    </Prompt>
  );
};

const SurveyCondition = (
  props: AnyConditionProps<SurveyConditionData>,
): JSX.Element => {
  const url = props.condition?.url ?? props.conditionAbility?.url;
  if (!url)
    throw new Error(`SurveyCondition received ${url} condition endpoint`);

  const fetchSurveys = async (): Promise<SurveyOptions> => {
    const response = await CourseAPI.conditions.fetchSurveys(url);
    return response.data;
  };

  return (
    <Preload
      onErrorDo={props.onClose}
      render={<LoadingIndicator bare={true} className="p-2" fit={true} />}
      while={fetchSurveys}
    >
      {(data): JSX.Element => <SurveyConditionForm {...props} surveys={data} />}
    </Preload>
  );
};

export default SurveyCondition;
