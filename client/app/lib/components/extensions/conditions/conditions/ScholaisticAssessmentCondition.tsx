import { Controller, useForm } from 'react-hook-form';
import { Launch } from '@mui/icons-material';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import {
  AvailableScholaisticAssessments,
  ScholaisticAssessmentConditionData,
} from 'types/course/conditions';

import CourseAPI from 'api/course';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import { AnyConditionProps } from '../AnyCondition';
import translations from '../translations';

const ScholaisticAssessmentConditionForm = ({
  condition,
  conditionAbility,
  onUpdate,
  onClose,
  open,
  assessments: { ids, assessments },
}: AnyConditionProps<ScholaisticAssessmentConditionData> & {
  assessments: AvailableScholaisticAssessments;
}): JSX.Element => {
  const { t } = useTranslation();

  const { control, handleSubmit, setError, formState } = useForm({
    defaultValues: condition ?? { assessmentId: ids[0] },
  });

  const updateAssessment = (data: ScholaisticAssessmentConditionData): void => {
    onUpdate(data, (errors) =>
      setError('assessmentId', { message: errors.errors.assessment }),
    );
  };

  const isNewCondition = !condition;

  return (
    <Prompt
      onClickPrimary={handleSubmit(updateAssessment)}
      onClose={onClose}
      open={open}
      primaryDisabled={!isNewCondition && !formState.isDirty}
      primaryLabel={
        isNewCondition
          ? t(translations.createCondition)
          : t(translations.updateCondition)
      }
      title={t({ defaultMessage: 'Choose an item' })}
    >
      <Controller
        control={control}
        name="assessmentId"
        render={({ field, fieldState: { error } }): JSX.Element => (
          <Autocomplete
            {...field}
            disableClearable
            fullWidth
            getOptionLabel={(id): string => assessments[id].title}
            onChange={(_, value): void => field.onChange(value)}
            options={ids}
            renderInput={(inputProps): JSX.Element => (
              <TextField
                {...inputProps}
                error={Boolean(error)}
                helperText={error && formatErrorMessage(error.message)}
                label={
                  conditionAbility?.displayName ||
                  t({ defaultMessage: 'Role-Playing Assessment' })
                }
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
                <Typography>{assessments[id].title}</Typography>

                <Link
                  className="flex items-center space-x-2"
                  opensInNewTab
                  to={assessments[id].url}
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

const ScholaisticAssessmentCondition = (
  props: AnyConditionProps<ScholaisticAssessmentConditionData>,
): JSX.Element => {
  const { condition, conditionAbility, onClose } = props;

  const url = condition?.url ?? conditionAbility?.url;
  if (!url)
    throw new Error(
      `ScholaisticAssessmentCondition received ${url} condition endpoint`,
    );

  return (
    <Preload
      onErrorDo={onClose}
      render={<LoadingIndicator bare className="p-2" fit />}
      while={async () => {
        const response =
          await CourseAPI.conditions.fetchScholaisticAssessments(url);
        return response.data;
      }}
    >
      {(data): JSX.Element => (
        <ScholaisticAssessmentConditionForm {...props} assessments={data} />
      )}
    </Preload>
  );
};

export default ScholaisticAssessmentCondition;
