import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Lock } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import {
  AssessmentAuthenticationFormData,
  UnauthenticatedAssessmentData,
} from 'types/course/assessment/assessments';
import { object, string } from 'yup';

import { authenticateAssessment } from 'course/assessment/operations/assessments';
import FormTextField from 'lib/components/form/fields/TextField';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { getAssessmentURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';
import { formatFullDateTime } from 'lib/moment';
import formTranslations from 'lib/translations/form';

import translations from '../../translations';

interface AssessmentAuthenticateProps {
  for: UnauthenticatedAssessmentData;
}

const initialValues: AssessmentAuthenticationFormData = { password: '' };

const validationSchema = object({
  password: string().required(formTranslations.required),
});

const AssessmentAuthenticate = (
  props: AssessmentAuthenticateProps,
): JSX.Element => {
  const { for: assessment } = props;
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    setFocus,
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (!submitting) setFocus('password');
    if (assessment.isAuthenticated) {
      navigate(getAssessmentURL(getCourseId(), assessment.id));
    }
  }, [submitting, assessment.isAuthenticated]);

  const onFormSubmit = (data: AssessmentAuthenticationFormData): void => {
    setSubmitting(true);
    authenticateAssessment(assessment.id, data)
      .then(() => navigate(0))
      .catch((error) => {
        setReactHookFormError(setError, error);
        setSubmitting(false);
      });
  };

  return (
    <div className="absolute left-1/2 top-1/4 max-w-md text-center">
      <Lock className="text-9xl" />
      {!assessment.isStartTimeBegin ? (
        <Typography>
          {t(translations.assessmentNotStarted, {
            startDate: formatFullDateTime(assessment.startAt),
          })}
        </Typography>
      ) : (
        <>
          <Typography>{t(translations.lockedAssessment)}</Typography>
          <form
            encType="multipart/form-data"
            id="assessment-authenticate-form"
            noValidate
            onSubmit={handleSubmit(onFormSubmit)}
          >
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  className={
                    Object.keys(errors).length > 0 ? 'animate-shake' : ''
                  }
                  disabled={submitting}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  label={t(translations.password)}
                  type="password"
                  variant="filled"
                />
              )}
            />
            <Button
              key="assessment-authenticate-form-submit-button"
              className="mt-4"
              color="primary"
              disabled={!isDirty || submitting}
              form="assessment-authenticate-form"
              type="submit"
              variant="outlined"
            >
              {t(formTranslations.submit)}
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default AssessmentAuthenticate;
