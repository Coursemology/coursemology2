import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Autocomplete } from '@mui/material';

import CourseAPI from 'api/course';
import { SurveyConditionData } from 'types/course/conditions';
import TextField from 'lib/components/TextField';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import Preload from 'lib/components/Preload';
import useTranslation from 'lib/hooks/useTranslation';
import Prompt from 'lib/components/Prompt';
import { AnyConditionProps } from '../AnyCondition';
import { formatErrorMessage } from '../../form/fields/utils/mapError';
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
      open={props.open}
      onClose={props.onClose}
      title={t(translations.chooseASurvey)}
      onClickPrimary={handleSubmit(updateSurvey)}
      primaryLabel={
        isNewCondition
          ? t(translations.createCondition)
          : t(translations.updateCondition)
      }
      primaryDisabled={!isNewCondition && !formState.isDirty}
    >
      <Controller
        name="surveyId"
        control={control}
        render={({ field, fieldState: { error } }): JSX.Element => (
          <Autocomplete
            {...field}
            value={field.value?.toString()}
            onChange={(_, value): void => field.onChange(parseInt(value, 10))}
            disableClearable
            options={autocompleteOptions}
            fullWidth
            getOptionLabel={(id): string => surveys[id] ?? ''}
            renderInput={(inputProps): JSX.Element => (
              <TextField
                {...inputProps}
                variant="filled"
                label={t(translations.survey)}
                error={Boolean(error)}
                helperText={error && formatErrorMessage(error.message)}
              />
            )}
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
      while={fetchSurveys}
      render={<LoadingIndicator bare fit className="p-2" />}
      onErrorDo={props.onClose}
    >
      {(data): JSX.Element => <SurveyConditionForm {...props} surveys={data} />}
    </Preload>
  );
};

export default SurveyCondition;
