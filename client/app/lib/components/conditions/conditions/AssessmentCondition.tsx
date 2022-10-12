import produce from 'immer';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Autocomplete, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { isNumber } from 'lodash';

import CourseAPI from 'api/course';
import { AssessmentConditionData } from 'types/course/conditions';
import TextField from 'lib/components/TextField';
import FormTextField from 'lib/components/form/fields/TextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import Checkbox from 'lib/components/Checkbox';
import Preload from 'lib/components/Preload';
import useTranslation from 'lib/hooks/useTranslation';
import Prompt from 'lib/components/Prompt';
import { AnyConditionProps } from '../AnyCondition';
import translations from '../translations';

// TODO: Change string to Assessment['title'] once Assessment is typed
type AssessmentOptions = Record<AssessmentConditionData['id'], string>;

const ERRORS = {
  assessment: 'assessmentId',
  minimum_grade_percentage: 'minimumGradePercentage',
};

const AssessmentConditionForm = (
  props: AnyConditionProps<AssessmentConditionData> & {
    assessments: AssessmentOptions;
  },
): JSX.Element => {
  const { assessments } = props;
  const { t } = useTranslation();

  const autocompleteOptions = useMemo(() => {
    const keys = Object.keys(assessments);
    return keys.sort((a, b) => {
      const assessmentA = assessments[parseInt(a, 10)];
      const assessmentB = assessments[parseInt(b, 10)];
      return assessmentA.localeCompare(assessmentB);
    });
  }, [assessments]);

  const [hasPassingGrade, setHasPassingGrade] = useState(
    isNumber(props.condition?.minimumGradePercentage),
  );

  const { control, handleSubmit, setError, setFocus, formState } = useForm({
    defaultValues: props.condition ?? {
      assessmentId: parseInt(autocompleteOptions[0], 10),
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
      open={props.open}
      onClose={props.onClose}
      title={t(translations.chooseAnAssessment)}
      onClickPrimary={handleSubmit(updateAssessment)}
      primaryLabel={
        isNewCondition
          ? t(translations.createCondition)
          : t(translations.updateCondition)
      }
      primaryDisabled={!isNewCondition && !formState.isDirty}
    >
      <div className="flex flex-col space-y-4">
        <Typography variant="body1" className="whitespace-nowrap">
          {t(translations.completeThisAssessment)}
        </Typography>

        <Controller
          name="assessmentId"
          control={control}
          render={({ field, fieldState: { error } }): JSX.Element => (
            <Autocomplete
              {...field}
              value={field.value?.toString()}
              onChange={(_, value): void => field.onChange(parseInt(value, 10))}
              disableClearable
              options={autocompleteOptions}
              getOptionLabel={(id): string => assessments[id] ?? ''}
              fullWidth
              renderInput={(inputProps): JSX.Element => (
                <TextField
                  {...inputProps}
                  label={t(translations.assessment)}
                  variant="filled"
                  error={Boolean(error)}
                  helperText={error && formatErrorMessage(error.message)}
                />
              )}
            />
          )}
        />

        <Controller
          name="minimumGradePercentage"
          control={control}
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
                field={field}
                fieldState={fieldState}
                value={field.value ?? 50}
                className="w-32"
                size="small"
                type="number"
                variant="filled"
                hiddenLabel
                disableMargins
                disabled={!hasPassingGrade}
              />

              <Typography variant="body1" className="ml-4">
                %
              </Typography>
            </div>
          )}
        />
      </div>

      <Alert severity="info" className="mt-8">
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

  const fetchAssessments = async (): Promise<AssessmentOptions> => {
    const response = await CourseAPI.conditions.fetchAssessments(url);
    return response.data;
  };

  return (
    <Preload
      while={fetchAssessments}
      render={<LoadingIndicator bare fit className="p-2" />}
      onErrorDo={props.onClose}
    >
      {(data): JSX.Element => (
        <AssessmentConditionForm {...props} assessments={data} />
      )}
    </Preload>
  );
};

export default AssessmentCondition;
