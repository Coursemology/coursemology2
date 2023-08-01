import { useState } from 'react';
import {
  LoaderFunction,
  Navigate,
  redirect,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import GlobalAPI from 'api';
import PasswordTextField from 'lib/components/core/fields/PasswordTextField';
import TextField from 'lib/components/core/fields/TextField';
import Link from 'lib/components/core/Link';
import toast from 'lib/hooks/toast';
import useEffectOnce from 'lib/hooks/useEffectOnce';
import useTranslation from 'lib/hooks/useTranslation';

import Widget from '../components/Widget';
import translations from '../translations';
import { getValidationErrors, passwordValidationSchema } from '../validations';

interface ResetPasswordLoaderData {
  email: string;
  token: string;
}

const ResetPasswordPage = (): JSX.Element => {
  const { t } = useTranslation();

  const { email, token } = useLoaderData() as ResetPasswordLoaderData;

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [requirePasswordConfirmation, setRequirePasswordConfirmation] =
    useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  const handleResetPassword = async (): Promise<void> => {
    setSubmitting(true);
    setErrors({});

    const data = { password, passwordConfirmation };
    try {
      const validatedData = await passwordValidationSchema(t).validate(data, {
        abortEarly: false,
        context: { requirePasswordConfirmation },
      });

      await GlobalAPI.users.resetPassword(token, validatedData.password);

      toast.success(t(translations.passwordSuccessfullyReset));
      navigate('/users/sign_in');
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(getValidationErrors(error));
        return;
      }

      if (error instanceof AxiosError && error.response?.status === 422) {
        const responseErrors = error.response.data?.errors;

        if (responseErrors?.reset_password_token) {
          toast.error(t(translations.resetPasswordLinkInvalidOrExpired));
          navigate('/users/password/new');
        } else {
          toast.error(t(translations.errorResettingPassword));
        }

        return;
      }

      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Widget
      subtitle={t(translations.resetPasswordSubtitle)}
      title={t(translations.resetPassword)}
    >
      <Widget.Body>
        <TextField
          autoFocus
          disabled
          fullWidth
          label={t(translations.emailAddress)}
          name="email"
          required
          trims
          type="email"
          value={email}
          variant="filled"
        />

        <PasswordTextField
          disabled={submitting}
          error={'password' in errors}
          fullWidth
          helperText={errors.password}
          inputProps={{ autoComplete: 'new-password' }}
          label={t(translations.password)}
          name="password"
          onChange={(e): void => setPassword(e.target.value)}
          onChangePasswordVisibility={(visible): void =>
            setRequirePasswordConfirmation(!visible)
          }
          onPressEnter={handleResetPassword}
          required
          type="password"
          value={password}
          variant="filled"
        />

        {requirePasswordConfirmation && (
          <PasswordTextField
            disabled={submitting}
            disablePasswordVisibilitySwitch
            error={'passwordConfirmation' in errors}
            fullWidth
            helperText={errors.passwordConfirmation}
            inputProps={{ autoComplete: 'new-password' }}
            label={t(translations.confirmPassword)}
            name="passwordConfirmation"
            onChange={(e): void => setPasswordConfirmation(e.target.value)}
            onCopy={(e): void => e.preventDefault()}
            onCut={(e): void => e.preventDefault()}
            onPaste={(e): void => e.preventDefault()}
            onPressEnter={handleResetPassword}
            required
            type="password"
            value={passwordConfirmation}
            variant="filled"
          />
        )}
      </Widget.Body>

      <LoadingButton
        className="mt-10"
        fullWidth
        loading={submitting}
        onClick={handleResetPassword}
        type="submit"
        variant="contained"
      >
        {t(translations.resetPassword)}
      </LoadingButton>

      <Widget.Foot className="flex space-x-3">
        <Typography color="text.secondary" variant="body2">
          {t(translations.suddenlyRememberPassword)}
        </Typography>

        <Link disabled={submitting} to="/users/sign_in">
          {t(translations.signInAgain)}
        </Link>
      </Widget.Foot>
    </Widget>
  );
};

const loader: LoaderFunction = async ({ request }) => {
  const token = new URL(request.url).searchParams.get('reset_password_token');
  if (!token) return redirect('/users/password/new');

  const { data } = await GlobalAPI.users.verifyResetPasswordToken(token);
  return { email: data.email, token } satisfies ResetPasswordLoaderData;
};

const ResetPasswordInvalidRedirect = (): JSX.Element => {
  const { t } = useTranslation();

  useEffectOnce(() => {
    toast.error(t(translations.resetPasswordLinkInvalidOrExpired));
  });

  return <Navigate replace to="/users/password/new" />;
};

export default Object.assign(ResetPasswordPage, {
  loader,
  InvalidRedirect: ResetPasswordInvalidRedirect,
});
