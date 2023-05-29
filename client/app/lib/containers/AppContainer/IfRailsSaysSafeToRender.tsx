import { ComponentType, ReactNode, useEffect } from 'react';
import { defineMessages } from 'react-intl';
import {
  ArrowBack,
  ConfirmationNumberOutlined,
  DoNotDisturbOnOutlined,
  SvgIconComponent,
} from '@mui/icons-material';
import { Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  accessDenied: {
    id: 'app.containers.AppContainer.AppErrorPage.accessDenied',
    defaultMessage: 'Oops, access denied!',
  },
  accessDeniedDescription: {
    id: 'app.containers.AppContainer.AppErrorPage.accessDeniedDescription',
    defaultMessage: 'You are not authorised to access this page.',
  },
  goBack: {
    id: 'app.containers.AppContainer.AppErrorPage.goBack',
    defaultMessage: 'Go back',
  },
  sessionExpired: {
    id: 'app.containers.AppContainer.AppErrorPage.sessionExpired',
    defaultMessage: "You'll need to sign in again.",
  },
  sessionExpiredDescription: {
    id: 'app.containers.AppContainer.AppErrorPage.sessionExpiredDescription',
    defaultMessage:
      "Your previous session is expired. We're redirecting you to the sign in page.",
  },
  goToSignInPage: {
    id: 'app.containers.AppContainer.AppErrorPage.goToSignInPage',
    defaultMessage: 'Go to the sign in page now',
  },
});

interface MessageBodyProps {
  Icon: SvgIconComponent;
  iconClassName?: string;
  title: string;
  description: string;
  children?: ReactNode;
}

const MessageBody = ({ Icon, ...props }: MessageBodyProps): JSX.Element => (
  <main className="flex max-w-lg flex-col items-center justify-center">
    <Icon className={`text-9xl ${props.iconClassName ?? ''}`} />

    <section className="mt-6 flex flex-col space-y-3 text-center text-white">
      <Typography variant="h5">{props.title}</Typography>

      <Typography variant="body2">{props.description}</Typography>
    </section>

    {props.children}
  </main>
);

const ForbiddenMessageBody = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <MessageBody
      description={t(translations.accessDeniedDescription)}
      Icon={DoNotDisturbOnOutlined}
      iconClassName="text-red-500"
      title={t(translations.accessDenied)}
    >
      <Link
        className="!mt-8 flex cursor-pointer items-center space-x-2 text-primary"
        onClick={(): void => {
          window.history.back();
        }}
        underline="hover"
      >
        <ArrowBack fontSize="small" />
        <span>{t(translations.goBack)}</span>
      </Link>
    </MessageBody>
  );
};

const SessionExpiredMessageBody = (): JSX.Element => {
  const { t } = useTranslation();

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      window.location.href = '/users/sign_in';
    }, 2000);

    return () => clearTimeout(redirectTimeout);
  }, []);

  return (
    <MessageBody
      description={t(translations.sessionExpiredDescription)}
      Icon={ConfirmationNumberOutlined}
      iconClassName="text-amber-500"
      title={t(translations.sessionExpired)}
    >
      <Link
        className="!mt-8 flex cursor-pointer items-center space-x-2 text-primary"
        href="/users/sign_in"
        underline="hover"
      >
        {t(translations.goToSignInPage)}
      </Link>
    </MessageBody>
  );
};

const messageBodies: Record<number, ComponentType> = {
  403: ForbiddenMessageBody,
  401: SessionExpiredMessageBody,
};

/**
 * Returns the HTTP status code from the Rails' router, if found.
 *
 * This works in unison with `default.slim.html` defining a `meta` tag with the response
 * HTTP status code as integer.
 */
const getRailsResponseStatusCode = (): number | undefined => {
  const statusMeta = document.querySelector('meta[name="status"]');
  const content = statusMeta?.getAttribute('content');
  if (!content) return undefined;

  return parseInt(content, 10);
};

/**
 * Renders the `children` if Rails' router says that the page is safe to render.
 *
 * Since Rails' router still renders parts of the page when we get a 403, the mounted React
 * app will still load the React page and make a HTTP request (if needed), and would probably
 * fail. This component is a TEMPORARY workaround to prevent the (rest of the) React app from
 * rendering if Rails' deem our request NOT to be safe.
 *
 * "Safe" here means that Rails' HTML render response has an HTTP status code listed in
 * `keyof messageBodies`.
 */
const IfRailsSaysSafeToRender = (props: {
  children: JSX.Element;
}): JSX.Element => {
  const status = getRailsResponseStatusCode();

  const StatusMessageBody = status && messageBodies[status];
  if (!StatusMessageBody) return props.children;

  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-900 p-5">
      <StatusMessageBody />
    </div>
  );
};

export default IfRailsSaysSafeToRender;
