import { ErrorInfo, ReactNode } from 'react';
import errorIllustration from 'assets/error-illustration.svg?url';
import { AxiosError } from 'axios';
import { getMailtoURLWithBody } from 'utilities';

import { SUPPORT_EMAIL } from 'lib/constants/sharedConstants';

interface Message {
  title: string;
  subtitle: string;
}

const messages: Record<number, Message> = {
  413: {
    title: 'Request Entity Too Large (413)',
    subtitle:
      'The size of your attachment or request body is too large. The request size limit is 1 GB.',
  },
  422: {
    title: 'Unprocessable Entity (422)',
    subtitle:
      "The requested change was rejected. Maybe you tried to change something you didn't have access to?",
  },
  500: {
    title: 'Internal Server Error (500)',
    subtitle: 'Something went wrong when processing the request in the server.',
  },
  504: {
    title: 'Gateway Timeout (504)',
    subtitle:
      'The gateway or proxy could not contact the upstream server. The server could be undergoing maintenance. Try again later.',
  },
};

interface UnrecoverableErrorPageProps {
  from: Error | null;
  stack: ErrorInfo | null;
  children: JSX.Element;
}

interface BareLinkProps {
  href: string;
  children: ReactNode;
}

const BareLink = (props: BareLinkProps): JSX.Element => (
  <a
    className="text-inherit"
    href={props.href}
    rel="noopener noreferrer"
    target="_blank"
  >
    {props.children}
  </a>
);

const BareFooter = (): JSX.Element => (
  <footer className="flex flex-col items-center space-y-2 text-center text-neutral-400">
    <p className="m-0 leading-relaxed">
      Graphic of earth is created by&nbsp;
      <BareLink href="https://storyset.com/nature">Storyset</BareLink>
      &nbsp;from&nbsp;
      <BareLink href="https://storyset.com">www.storyset.com</BareLink>, with
      modifications.
      <br />
      Graphic of a fire ball is created by&nbsp;
      <BareLink href="https://storyset.com/nature">Storyset</BareLink>
      &nbsp;from&nbsp;
      <BareLink href="https://storyset.com">www.storyset.com</BareLink>, with
      modifications.
      <br />
      &copy; {FIRST_BUILD_YEAR}&ndash;{LATEST_BUILD_YEAR} Coursemology.
    </p>
  </footer>
);

const getStackMessage = (error: string, component?: string): string => {
  let message = `Page URL:\n${window.location.href}\n`;
  message += `\nError Stack:\n${error}`;
  if (component) message += `\n\nComponent Stack:${component}`;
  return message;
};

/**
 * Renders a contextual network error page, if explicitly defined. Otherwise, renders `children` as a fallback.
 *
 * This page is designed to be friendly for only some known network errors, and should not be used as a generic error
 * page because it is uninformative.
 *
 * Keep the amount of third-party dependencies in this component at a minimum. This component is used by `ErrorBoundary`,
 * so it shouldn't consume any providers or some fancy hook mechanisms.
 */
const ContextualErrorPage = (
  props: UnrecoverableErrorPageProps,
): JSX.Element => {
  const { from: error, stack } = props;

  if (!(error instanceof AxiosError)) return props.children;

  const status = error.response?.status;
  const message = status && messages[status];

  if (!message) return props.children;

  const emailURL = getMailtoURLWithBody(
    SUPPORT_EMAIL,
    message.title,
    getStackMessage(error.stack ?? '', stack?.componentStack),
  );

  return (
    <main className="flex flex-col items-center justify-center px-10 py-10 font-sans">
      <img
        alt="Error illustration"
        className="mb-10 w-full max-w-[40rem]"
        src={errorIllustration}
      />

      <section className="flex max-w-5xl flex-col items-center text-center">
        <h2 className="m-0 mb-5 text-5xl">{message.title}</h2>

        <p className="m-0 mb-20 text-2xl leading-normal text-neutral-800">
          {message.subtitle}
        </p>

        <p className="m-0 mb-20 text-xl leading-relaxed text-neutral-500">
          Try reloading this page again. If this problem persists,&nbsp;
          <BareLink href={emailURL}>contact us</BareLink>.
          <br />
          If you are the application owner, check the gateway or server logs.
        </p>
      </section>

      <BareFooter />
    </main>
  );
};

export default ContextualErrorPage;
