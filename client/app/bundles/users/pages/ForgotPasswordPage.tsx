import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Typography } from '@mui/material';
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

const ForgotPasswordPage = (): JSX.Element => {
  const { t } = useTranslation();

  const [email, setEmail] = useEmailFromAuthPagesContext();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const navigate = useNavigate();

  const handleRequestResetPassword = async (): Promise<void> => {
    setSubmitting(true);
    setErrorMessage(undefined);

    try {
      const validatedEmail = await emailValidationSchema(t).validate(email);
      if (!validatedEmail)
        throw new Error(`validatedEmail is ${validatedEmail}`);

      await GlobalAPI.users.requestResetPassword(validatedEmail);
      navigate('completed', { state: validatedEmail });
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrorMessage(error.message);
        return;
      }

      if (error instanceof AxiosError) {
        setErrorMessage(error.response?.data?.errors?.email);
        toast.error(t(translations.errorRequestingResetPassword));
        return;
      }

      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Widget
      subtitle={t(translations.forgotPasswordSubtitle)}
      title={t(translations.forgotPassword)}
    >
      <Widget.Body>
        <TextField
          autoFocus
          disabled={submitting}
          error={Boolean(errorMessage)}
          fullWidth
          helperText={errorMessage}
          label={t(translations.emailAddress)}
          name="email"
          onChange={(e): void => setEmail(e.target.value)}
          onPressEnter={handleRequestResetPassword}
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
        onClick={handleRequestResetPassword}
        type="submit"
        variant="contained"
      >
        {t(translations.requestToResetPassword)}
      </LoadingButton>

      <Widget.Foot className="flex space-x-3">
        <Typography color="text.secondary" variant="body2">
          {t(translations.suddenlyRememberPassword)}
        </Typography>

        <Link disabled={submitting} to="/users/sign_in">
          {t(translations.signInAgain)}
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

export default ForgotPasswordPage;
