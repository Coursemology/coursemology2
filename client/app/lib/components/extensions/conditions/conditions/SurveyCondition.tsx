import { Controller, useForm } from 'react-hook-form';
import { Launch } from '@mui/icons-material';
import { Autocomplete, Box, Typography } from '@mui/material';
import { AvailableSurveys, SurveyConditionData } from 'types/course/conditions';

import CourseAPI from 'api/course';
import Prompt from 'lib/components/core/dialogs/Prompt';
import TextField from 'lib/components/core/fields/TextField';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import { formatErrorMessage } from '../../../form/fields/utils/mapError';
import { AnyConditionProps } from '../AnyCondition';
import translations from '../translations';

const SurveyConditionForm = (
  props: AnyConditionProps<SurveyConditionData> & { surveys: AvailableSurveys },
): JSX.Element => {
  const { ids, surveys } = props.surveys;
  const { t } = useTranslation();

  const { control, handleSubmit, setError, formState } = useForm({
    defaultValues: props.condition ?? { surveyId: ids[0] },
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
            disableClearable
            fullWidth
            getOptionLabel={(id): string => surveys[id].title}
            onChange={(_, value): void => field.onChange(value)}
            options={ids}
            renderInput={(inputProps): JSX.Element => (
              <TextField
                {...inputProps}
                error={Boolean(error)}
                helperText={error && formatErrorMessage(error.message)}
                label={t(translations.survey)}
                variant="filled"
              />
            )}
            renderOption={(optionProps, id): JSX.Element => (
              <Box
                component="li"
                {...optionProps}
                key={id}
                className={`${optionProps.className} justify-between space-x-4`}
              >
                <Typography>{surveys[id].title}</Typography>

                <Link
                  className="flex items-center space-x-2"
                  opensInNewTab
                  to={surveys[id].url}
                >
                  <Typography variant="caption">
                    {t(translations.details)}
                  </Typography>

                  <Launch fontSize="small" />
                </Link>
              </Box>
            )}
            value={field.value}
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

  const fetchSurveys = async (): Promise<AvailableSurveys> => {
    const response = await CourseAPI.conditions.fetchSurveys(url);
    return response.data;
  };

  return (
    <Preload
      onErrorDo={props.onClose}
      render={<LoadingIndicator bare className="p-2" fit />}
      while={fetchSurveys}
    >
      {(data): JSX.Element => <SurveyConditionForm {...props} surveys={data} />}
    </Preload>
  );
};

export default SurveyCondition;
