import { ComponentRef, useRef, useState } from 'react';
import { LoaderFunction, useLoaderData, useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Alert, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { InvitedSignUpData } from 'types/users';
import { ValidationError } from 'yup';

import GlobalAPI from 'api';
import CourseAPI from 'api/course';
import CAPTCHAField from 'lib/components/core/fields/CAPTCHAField';
import PasswordTextField from 'lib/components/core/fields/PasswordTextField';
import TextField from 'lib/components/core/fields/TextField';
import Link from 'lib/components/core/Link';
import { useEmailFromAuthPagesContext } from 'lib/containers/AuthPagesContainer';
import { useAuthenticator } from 'lib/hooks/session';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import Widget from '../components/Widget';
import translations from '../translations';
import { getValidationErrors, signUpValidationSchema } from '../validations';

type InvitedSignUpLoaderData = InvitedSignUpData & { token?: string };
interface EnrolRequestSignUpLoaderData {
  enrolCourseId: number;
  enrolCourseTitle: string;
}

type SignUpLoaderData =
  | null
  | InvitedSignUpLoaderData
  | EnrolRequestSignUpLoaderData;

function getInvitationJoinTitle(invitation: InvitedSignUpData): string {
  if (invitation.courseTitle) {
    return invitation.courseTitle;
  }
  if (invitation.instanceName === 'Default') {
    return `${invitation.instanceHost}`;
  }
  return `${invitation.instanceName} @ ${invitation.instanceHost}`;
}

const SignUpPage = (): JSX.Element => {
  const { t } = useTranslation();

  const [email, setEmail] = useEmailFromAuthPagesContext();

  const loaderData = useLoaderData() as SignUpLoaderData;
  const invitation = loaderData && 'token' in loaderData ? loaderData : null;
  const enrolRequestCourse =
    loaderData && 'enrolCourseId' in loaderData ? loaderData : null;
  if (invitation?.email) setEmail(invitation.email);

  const [name, setName] = useState(invitation?.name ?? '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [requirePasswordConfirmation, setRequirePasswordConfirmation] =
    useState(true);

  const captchaRef = useRef<ComponentRef<typeof CAPTCHAField>>(null);
  const [captchaResponse, setCaptchaResponse] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { authenticate } = useAuthenticator();

  const resetCaptcha = (): void => {
    captchaRef.current?.reset();
  };

  const handleSignUp = async (): Promise<void> => {
    if (!captchaResponse) {
      setErrors({ recaptcha: t(translations.errorRecaptcha) });
      resetCaptcha();
      toast.error(t(translations.errorSigningUp));
      return;
    }

    setErrors({});
    setSubmitting(true);

    const data = { name, email, password, passwordConfirmation };

    try {
      const validatedData = await signUpValidationSchema(t).validate(data, {
        abortEarly: false,
        context: { requirePasswordConfirmation },
      });

      const { data: result } = await GlobalAPI.users.signUp(
        validatedData.name,
        validatedData.email,
        validatedData.password,
        captchaResponse,
        invitation?.token,
      );

      if (!result.id) {
        toast.error(t(translations.errorSigningUp));
        return;
      }

      if (invitation) {
        authenticate();
        if (invitation.courseId) {
          navigate(`/courses/${invitation.courseId}`);
        } else {
          navigate(`/auth`);
        }
        toast.success(
          t(translations.signUpWelcome, {
            course: getInvitationJoinTitle(invitation),
          }),
        );

        return;
      }

      if (enrolRequestCourse) {
        await CourseAPI.courses.submitUnauthenticatedEnrolRequest(
          `/courses/${enrolRequestCourse.enrolCourseId}/enrol_requests/create_unauthenticated`,
          result.id,
          captchaResponse,
        );
      }

      if (!result.confirmed) {
        navigate('completed', { state: validatedData.email });
      } else {
        navigate('/');
        toast.success(t(translations.signUpSuccessful));
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(getValidationErrors(error));
        return;
      }

      if (error instanceof AxiosError && error.response?.status === 422) {
        toast.error(t(translations.errorSigningUp));
        setErrors(error.response.data?.errors);
        return;
      }

      throw error;
    } finally {
      resetCaptcha();
      setSubmitting(false);
    }
  };

  return (
    <Widget
      subtitle={t(translations.createAnAccountSubtitle)}
      title={t(translations.createAnAccount)}
    >
      <Widget.Body>
        {invitation && (
          <Alert severity="info">
            {t(translations.completeSignUpToJoin, {
              course: getInvitationJoinTitle(invitation),
              strong: (chunk) => <strong>{chunk}</strong>,
            })}
          </Alert>
        )}
        {enrolRequestCourse && (
          <Alert severity="info">
            {t(translations.completeSignUpToJoin, {
              course: enrolRequestCourse.enrolCourseTitle,
              strong: (chunk) => <strong>{chunk}</strong>,
            })}
          </Alert>
        )}
        <div className="flex space-x-3">
          <Typography color="text.secondary" variant="body2">
            {t(translations.alreadyHaveAnAccount)}
          </Typography>

          <Link disabled={submitting} to="/users/sign_in">
            {t(translations.signIn)}
          </Link>
        </div>

        <TextField
          autoFocus={!invitation}
          disabled={Boolean(invitation?.name) || submitting}
          error={'name' in errors}
          fullWidth
          helperText={errors.name}
          label={t(translations.name)}
          name="name"
          onChange={(e): void => setName(e.target.value)}
          onPressEnter={handleSignUp}
          required
          trims
          type="text"
          value={name}
          variant="filled"
        />

        <TextField
          autoComplete="off"
          disabled={Boolean(invitation?.email) || submitting}
          error={'email' in errors}
          fullWidth
          helperText={errors.email}
          label={t(translations.emailAddress)}
          name="email"
          onChange={(e): void => setEmail(e.target.value)}
          onPressEnter={handleSignUp}
          required
          trims
          type="email"
          value={email}
          variant="filled"
        />

        <PasswordTextField
          autoComplete="off"
          autoFocus={Boolean(invitation)}
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
          onPressEnter={handleSignUp}
          required
          type="password"
          value={password}
          variant="filled"
        />

        {requirePasswordConfirmation && (
          <PasswordTextField
            autoComplete="off"
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
            onPressEnter={handleSignUp}
            required
            type="password"
            value={passwordConfirmation}
            variant="filled"
          />
        )}

        <CAPTCHAField
          ref={captchaRef}
          error={'recaptcha' in errors}
          helperText={errors.recaptcha}
          onChange={setCaptchaResponse}
        />
      </Widget.Body>

      <LoadingButton
        className="mb-5 mt-10"
        disabled={!captchaResponse}
        fullWidth
        loading={submitting}
        onClick={handleSignUp}
        type="submit"
        variant="contained"
      >
        {t(translations.signUp)}
      </LoadingButton>

      <Typography color="text.secondary" variant="caption">
        {t(translations.signUpAgreement, {
          tos: (chunk) => (
            <Link
              disabled={submitting}
              to="/pages/terms_of_service"
              variant="caption"
            >
              {chunk}
            </Link>
          ),
          pp: (chunk) => (
            <Link
              disabled={submitting}
              to="/pages/privacy_policy"
              variant="caption"
            >
              {chunk}
            </Link>
          ),
        })}
      </Typography>
    </Widget>
  );
};

const loader: LoaderFunction = async ({ request }) => {
  const token = new URL(request.url).searchParams.get('invitation');
  if (!token) {
    const enrolCourseIdParam = new URL(request.url).searchParams.get(
      'enrol_course_id',
    );
    if (enrolCourseIdParam) {
      const id = parseInt(enrolCourseIdParam, 10);
      const { data } = await CourseAPI.courses.fetch(id);
      return {
        enrolCourseId: data.course.id,
        enrolCourseTitle: data.course.title,
      } satisfies EnrolRequestSignUpLoaderData;
    }
    return null;
  }

  try {
    const { data } = await GlobalAPI.users.verifyInvitationToken(token);
    if (!data) return null;

    return { ...data, token } satisfies InvitedSignUpLoaderData;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 409)
      toast.error(error.response.data?.message);

    return null;
  }
};

export default Object.assign(SignUpPage, { loader });
