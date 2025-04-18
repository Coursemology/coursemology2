import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Launch } from '@mui/icons-material';
import { Alert, Autocomplete, Box, Typography } from '@mui/material';
import { produce } from 'immer';
import isNumber from 'lodash-es/isNumber';
import {
  AssessmentConditionData,
  AvailableAssessments,
} from 'types/course/conditions';

import CourseAPI from 'api/course';
import Checkbox from 'lib/components/core/buttons/Checkbox';
import Prompt from 'lib/components/core/dialogs/Prompt';
import TextField from 'lib/components/core/fields/TextField';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import FormTextField from 'lib/components/form/fields/TextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import { AnyConditionProps } from '../AnyCondition';
import translations from '../translations';

const ERRORS = {
  assessment: 'assessmentId',
  minimum_grade_percentage: 'minimumGradePercentage',
};

const AssessmentConditionForm = (
  props: AnyConditionProps<AssessmentConditionData> & {
    assessments: AvailableAssessments;
  },
): JSX.Element => {
  const { ids, assessments } = props.assessments;
  const { t } = useTranslation();

  const [hasPassingGrade, setHasPassingGrade] = useState(
    isNumber(props.condition?.minimumGradePercentage),
  );

  const { control, handleSubmit, setError, setFocus, formState } = useForm({
    defaultValues: props.condition ?? {
      assessmentId: ids[0],
      minimumGradePercentage: 50,
    },
  });

  useEffect(() => {
    // This no-op try-catch was added because on fresh renders with
    // hasPassingGrade = true, react-hook-form will throw a weird
    // TypeError: Cannot read properties of undefined (reading '_f')
    // which seemed that it cannot find the FormTextField to focus,
    // but this code was executed after render, so theoretically the
    // FormTextField should already be ready to be focused.
    try {
      if (hasPassingGrade)
        setFocus('minimumGradePercentage', { shouldSelect: true });
    } catch (error) {
      if (error instanceof TypeError) return;
      throw error;
    }
  }, [hasPassingGrade]);

  const updateAssessment = (data: AssessmentConditionData): void => {
    const patchData = produce(data, (draft) => {
      draft.minimumGradePercentage = hasPassingGrade
        ? data.minimumGradePercentage
        : null;
    });

    props.onUpdate(patchData, (errors) =>
      Object.entries(errors.errors).forEach(([name, message]) =>
        setError(ERRORS[name], { message: message as string }),
      ),
    );
  };

  const isNewCondition = !props.condition;

  return (
    <Prompt
      onClickPrimary={handleSubmit(updateAssessment)}
      onClose={props.onClose}
      open={props.open}
      primaryDisabled={!isNewCondition && !formState.isDirty}
      primaryLabel={
        isNewCondition
          ? t(translations.createCondition)
          : t(translations.updateCondition)
      }
      title={t(translations.chooseAnAssessment)}
    >
      <div className="flex flex-col space-y-4">
        <Typography className="whitespace-nowrap">
          {t(translations.completeThisAssessment)}
        </Typography>

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
                  label={t(translations.assessment)}
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

        <Controller
          control={control}
          name="minimumGradePercentage"
          render={({ field, fieldState }): JSX.Element => (
            <div className="flex items-center">
              <Checkbox
                checked={hasPassingGrade}
                label={t(translations.scoringAtLeast)}
                onChange={(_, checked): void => {
                  setHasPassingGrade(checked);
                  if (checked) {
                    field.onChange(field.value ?? 50);
                  } else {
                    field.onChange(null);
                  }
                }}
              />

              <FormTextField
                className="w-32"
                disabled={!hasPassingGrade}
                disableMargins
                field={field}
                fieldState={fieldState}
                hiddenLabel
                size="small"
                type="number"
                value={field.value ?? 50}
                variant="filled"
              />

              <Typography className="ml-4">%</Typography>
            </div>
          )}
        />
      </div>

      <Alert className="mt-8" severity="info">
        {t(translations.scoreZeroPercentNotice)}
      </Alert>
    </Prompt>
  );
};

const AssessmentCondition = (
  props: AnyConditionProps<AssessmentConditionData>,
): JSX.Element => {
  const url = props.condition?.url ?? props.conditionAbility?.url;
  if (!url)
    throw new Error(`AssessmentCondition received ${url} condition endpoint`);

  const fetchAssessments = async (): Promise<AvailableAssessments> => {
    const response = await CourseAPI.conditions.fetchAssessments(url);
    return response.data;
  };

  return (
    <Preload
      onErrorDo={props.onClose}
      render={<LoadingIndicator bare className="p-2" fit />}
      while={fetchAssessments}
    >
      {(data): JSX.Element => (
        <AssessmentConditionForm {...props} assessments={data} />
      )}
    </Preload>
  );
};

export default AssessmentCondition;
