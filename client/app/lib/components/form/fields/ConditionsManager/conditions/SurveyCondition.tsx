import { useForm, Controller } from 'react-hook-form';
import { Autocomplete } from '@mui/material';

import CourseAPI from 'api/course';
import { SurveyConditionData } from 'types/course/conditions';
import TextField from 'lib/components/TextField';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import Preload from 'lib/components/Preload';
import useTranslation from 'lib/hooks/useTranslation';
import Prompt from 'lib/components/Prompt';
import { AnyConditionProps } from './AnyCondition';
import { formatErrorMessage } from '../../utils/mapError';
import translations from '../translations';

// TODO: Change string to Survey['title'] once Survey is typed
type SurveyOptions = Record<SurveyConditionData['id'], string>;

const SurveyConditionForm = (
  props: AnyConditionProps<SurveyConditionData> & { surveys: SurveyOptions },
): JSX.Element => {
  const { surveys } = props;
  const autocompleteOptions = Object.keys(surveys);

  const { t } = useTranslation();

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

const fetchSurveys =
  (exclude: (id: number) => boolean): (() => Promise<SurveyOptions>) =>
  async () => {
    const response = await CourseAPI.survey.surveys.index();
    const fetchedSurveys = response.data.surveys;

    // TODO: Add <SurveyOptions> to reduce once SurveyAPI is typed
    return fetchedSurveys.reduce((options, survey) => {
      if (!exclude(survey.id)) options[survey.id] = survey.title;
      return options;
    }, {});
  };

const SurveyCondition = (
  props: AnyConditionProps<SurveyConditionData>,
): JSX.Element => (
  <Preload
    while={fetchSurveys(
      (id): boolean =>
        id !== props.condition?.surveyId && props.otherConditions?.has(id),
    )}
    render={<LoadingIndicator bare fit className="p-2" />}
    onErrorDo={props.onClose}
  >
    {(data): JSX.Element => <SurveyConditionForm {...props} surveys={data} />}
  </Preload>
);

export default SurveyCondition;
