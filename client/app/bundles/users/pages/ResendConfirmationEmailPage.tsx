import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LightbulbOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import GlobalAPI from 'api';
import TextField from 'lib/components/core/fields/TextField';
import Link from 'lib/components/core/Link';
import { useEmailFromAuthPagesContext } from 'lib/containers/AuthPagesContainer';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import Widget from '../components/Widget';
import translations from '../translations';
import { emailValidationSchema } from '../validations';

const ResendConfirmationEmailPage = (): JSX.Element => {
  const { t } = useTranslation();

  const [email, setEmail] = useEmailFromAuthPagesContext();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const navigate = useNavigate();

  const handleResendConfirmationEmail = async (): Promise<void> => {
    setSubmitting(true);
    setErrorMessage(undefined);

    try {
      const validatedEmail = await emailValidationSchema(t).validate(email);
      if (!validatedEmail)
        throw new Error(`validatedEmail is ${validatedEmail}`);

      await GlobalAPI.users.resendConfirmationEmail(validatedEmail);
      navigate('completed', { state: validatedEmail });
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrorMessage(error.message);
        return;
      }

      if (error instanceof AxiosError) {
        setErrorMessage(error.response?.data?.errors?.email);
        toast.error(t(translations.errorResendConfirmationEmail));
        return;
      }

      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Widget
      subtitle={t(translations.resendConfirmationEmailSubtitle)}
      title={t(translations.resendConfirmationEmail)}
    >
      <Widget.Body>
        <Alert icon={<LightbulbOutlined />} severity="info">
          {t(translations.checkSpamBeforeRequestNewConfirmationEmail)}
        </Alert>

        <TextField
          autoFocus
          disabled={submitting}
          error={Boolean(errorMessage)}
          fullWidth
          helperText={errorMessage}
          label={t(translations.emailAddress)}
          name="email"
          onChange={(e): void => setEmail(e.target.value)}
          onPressEnter={handleResendConfirmationEmail}
          required
          trims
          type="email"
          value={email}
          variant="filled"
        />
      </Widget.Body>

      <LoadingButton
        className="mt-10"
        disabled={!email.trim()}
        fullWidth
        loading={submitting}
        onClick={handleResendConfirmationEmail}
        type="submit"
        variant="contained"
      >
        {t(translations.resendConfirmationEmail)}
      </LoadingButton>

      <Widget.Foot className="flex space-x-3">
        <Typography color="text.secondary" variant="body2">
          {t(translations.alreadyHaveAnAccount)}
        </Typography>

        <Link disabled={submitting} to="/users/sign_in">
          {t(translations.signIn)}
        </Link>
      </Widget.Foot>

      <Widget.Foot className="flex space-x-3">
        <Typography color="text.secondary" variant="body2">
          {t(translations.dontYetHaveAnAccount)}
        </Typography>

        <Link disabled={submitting} to="/users/sign_up">
          {t(translations.signUp)}
        </Link>
      </Widget.Foot>
    </Widget>
  );
};

export default ResendConfirmationEmailPage;
