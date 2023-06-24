import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Lock } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import { SessionFormData } from 'types/course/assessment/sessions';
import { object, string } from 'yup';

import FormTextField from 'lib/components/form/fields/TextField';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import translations from '../../../translations';
import { createAssessmentSession } from '../../operations';

const initialValues: SessionFormData = {
  password: '',
  submissionId: '',
};

const validationSchema = object({
  password: string().required(formTranslations.required),
});

const AssessmentSessionNew = (): JSX.Element => {
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const submissionId = params.get('submission_id') ?? '';

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    setFocus,
  } = useForm({
    defaultValues: { ...initialValues, submissionId },
    resolver: yupResolver(validationSchema),
  });
  useEffect(() => {
    if (!submitting) setFocus('password');
  }, [submitting]);

  const onFormSubmit = (data: SessionFormData): void => {
    setSubmitting(true);
    createAssessmentSession(data)
      .then((response) => {
        navigate(response.redirectUrl);
      })
      .catch((error) => {
        setReactHookFormError(setError, error);
        setSubmitting(false);
      });
  };
  return (
    <div className="m-auto h-full max-w-md py-32 text-center">
      <Lock className="text-9xl" />
      <Typography>{t(translations.lockedSessionAssessment)}</Typography>
      <form
        encType="multipart/form-data"
        id="assessment-session-form"
        noValidate
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              className={Object.keys(errors).length > 0 ? 'animate-shake' : ''}
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
          key="assessment-session-form-submit-button"
          className="mt-4"
          color="primary"
          disabled={!isDirty || submitting}
          form="assessment-session-form"
          type="submit"
          variant="outlined"
        >
          {t(formTranslations.submit)}
        </Button>
      </form>
    </div>
  );
};

export default AssessmentSessionNew;
