import { ReactNode } from 'react';
import { defineMessages } from 'react-intl';
import {
  LoaderFunction,
  redirect,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';
import { Typography } from '@mui/material';
import forbiddenIllustration from 'assets/forbidden-illustration.svg?url';
import notFoundIllustration from 'assets/not-found-illustration.svg?url';

import { loadCourse } from 'course/courses/operations';
import { getCourseEntity } from 'course/courses/selectors';
import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import {
  Attributions,
  useSetAttributions,
} from 'lib/components/wrappers/AttributionsProvider';
import { getCourseIdFromString } from 'lib/helpers/url-helpers';
import {
  getForbiddenSourceURL,
  getSuspendedSourceURL,
} from 'lib/hooks/router/redirect';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast/toast';
import useEffectOnce from 'lib/hooks/useEffectOnce';
import useTranslation from 'lib/hooks/useTranslation';
import courseTranslations from 'lib/translations/course';

const translations = defineMessages({
  notFound: {
    id: 'app.ErrorPage.notFound',
    defaultMessage: "That location doesn't exist in this universe...",
  },
  notFoundSubtitle: {
    id: 'app.ErrorPage.notFoundSubtitle',
    defaultMessage:
      "Check if you've typed the correct address, try again later, or <home>go back home</home>.",
  },
  notFoundIllustrationAttribution: {
    id: 'app.ErrorPage.notFoundIllustrationAttribution',
    defaultMessage:
      'Graphic of a dog floating in space is created by <author>Storyset</author> from ' +
      '<source>www.storyset.com</source>, with modifications.',
  },
  forbidden: {
    id: 'app.ErrorPage.forbidden',
    defaultMessage: 'Hold up, this galaxy is off-limits to you!',
  },
  forbiddenSubtitle: {
    id: 'app.ErrorPage.forbiddenSubtitle',
    defaultMessage:
      "You don't have permission to access the information behind this page. If you believe this is a mistake, " +
      'contact your administrator.',
  },
  forbiddenIllustrationAttribution: {
    id: 'app.ErrorPage.forbiddenIllustrationAttribution',
    defaultMessage:
      'Graphic of an astronaut floating in space is created by <author>Storyset</author> from ' +
      '<source>www.storyset.com</source>, with modifications.',
  },
  suspended: {
    id: 'app.ErrorPage.suspended',
    defaultMessage: 'Your access to this course has been suspended.',
  },
  error: {
    id: 'app.ErrorPage.error',
    defaultMessage: 'KABOOM, a meteor has just crashed.',
  },
  errorSubtitle: {
    id: 'app.ErrorPage.errorSubtitle',
    defaultMessage:
      'A fatal error has occurred. You may try again later. If the problem persists, <contact>contact us</contact>.',
  },
  errorIllustrationAttribution1: {
    id: 'app.ErrorPage.errorIllustrationAttribution1',
    defaultMessage:
      'Graphic of a planet earth in space is created by <author>Storyset</author> from ' +
      '<source>www.storyset.com</source>, with modifications.',
  },
  errorIllustrationAttribution2: {
    id: 'app.ErrorPage.errorIllustrationAttribution2',
    defaultMessage:
      'Graphic of a fire ball is created by <author>Storyset</author> from ' +
      '<source>www.storyset.com</source>, with modifications.',
  },
});

interface ErrorPageProps {
  illustrationSrc: string;
  illustrationAlt: string;
  title: ReactNode;
  subtitle: ReactNode;
  attributions?: Attributions;
  tip?: ReactNode | false;
  children?: ReactNode;
}

const ErrorPage = (props: ErrorPageProps): JSX.Element => {
  useSetAttributions(props.attributions);

  return (
    <Page className="m-auto flex min-h-[calc(100vh_-_4.5rem)] flex-col items-center justify-center text-center">
      <img
        alt={props.illustrationAlt}
        className="mb-14 w-full max-w-[45rem]"
        src={props.illustrationSrc}
      />

      {props.tip !== false && (
        <Typography className="mb-6 break-all" component="code">
          {props.tip ?? window.location.pathname}
        </Typography>
      )}

      <Typography className="mb-4 max-w-5xl" variant="h4">
        {props.title}
      </Typography>

      <Typography className="mb-28 max-w-3xl" color="text.secondary">
        {props.subtitle}
      </Typography>

      {props.children}
    </Page>
  );
};

const NotFoundPage = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <ErrorPage
      attributions={[
        {
          name: 'Not found illustration',
          content: t(translations.notFoundIllustrationAttribution, {
            author: (chunk) => (
              <Link
                color="inherit"
                external
                href="https://storyset.com/online"
                variant="caption"
              >
                {chunk}
              </Link>
            ),
            source: (chunk) => (
              <Link
                color="inherit"
                external
                href="https://storyset.com"
                variant="caption"
              >
                {chunk}
              </Link>
            ),
          }),
        },
      ]}
      illustrationAlt="Not found illustration"
      illustrationSrc={notFoundIllustration}
      subtitle={t(translations.notFoundSubtitle, {
        home: (chunk) => (
          <Link to="/" variant="body1">
            {chunk}
          </Link>
        ),
      })}
      title={t(translations.notFound)}
    />
  );
};

const ForbiddenPage = (): JSX.Element => {
  const { t } = useTranslation();

  const sourceURL = useLoaderData() as string | null;

  useEffectOnce(() => {
    if (sourceURL) window.history.replaceState(null, '', sourceURL);
  });

  return (
    <ErrorPage
      attributions={[
        {
          name: 'Forbidden illustration',
          content: t(translations.forbiddenIllustrationAttribution, {
            author: (chunk) => (
              <Link
                color="inherit"
                external
                href="https://storyset.com/people"
                variant="caption"
              >
                {chunk}
              </Link>
            ),
            source: (chunk) => (
              <Link
                color="inherit"
                external
                href="https://storyset.com"
                variant="caption"
              >
                {chunk}
              </Link>
            ),
          }),
        },
      ]}
      illustrationAlt="Forbidden illustration"
      illustrationSrc={forbiddenIllustration}
      subtitle={t(translations.forbiddenSubtitle)}
      tip={sourceURL}
      title={t(translations.forbidden)}
    />
  );
};

const forbiddenPageLoader: LoaderFunction = async ({ request }) => {
  const sourceURL = getForbiddenSourceURL(request.url);
  if (!sourceURL) return redirect('/');

  return sourceURL;
};

const SuspendedPage = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { courseId, sourceURL } = useLoaderData() as {
    courseId: string;
    sourceURL: string | null;
  };

  const dispatch = useAppDispatch();
  const course = useAppSelector((state) => getCourseEntity(state, +courseId!));

  useEffectOnce(() => {
    if (sourceURL) window.history.replaceState(null, '', sourceURL);
    if (courseId) {
      dispatch(loadCourse(+courseId))
        .then(({ course: courseResponse }) => {
          if (!courseResponse.isSuspendedUser) {
            navigate(sourceURL ?? `/courses/${courseId}`, { replace: true });
          }
        })
        .catch(() => toast.error(t(courseTranslations.fetchCourseFailure)));
    }
  });

  return (
    <ErrorPage
      attributions={[
        {
          name: 'Forbidden illustration',
          content: t(translations.forbiddenIllustrationAttribution, {
            author: (chunk) => (
              <Link
                color="inherit"
                external
                href="https://storyset.com/people"
                variant="caption"
              >
                {chunk}
              </Link>
            ),
            source: (chunk) => (
              <Link
                color="inherit"
                external
                href="https://storyset.com"
                variant="caption"
              >
                {chunk}
              </Link>
            ),
          }),
        },
      ]}
      illustrationAlt="Forbidden illustration"
      illustrationSrc={forbiddenIllustration}
      subtitle={
        course?.suspensionMessage ?? t(courseTranslations.suspendedSubtitle)
      }
      tip={sourceURL}
      title={t(translations.suspended)}
    />
  );
};

const suspendedPageLoader: LoaderFunction = async ({ request }) => {
  const sourceURL = getSuspendedSourceURL(request.url);
  if (!sourceURL) return redirect('/');
  const courseId = getCourseIdFromString(sourceURL);
  if (!courseId) return redirect('/');

  return { sourceURL, courseId };
};

export default {
  NotFound: NotFoundPage,
  Forbidden: Object.assign(ForbiddenPage, { loader: forbiddenPageLoader }),
  Suspended: Object.assign(SuspendedPage, { loader: suspendedPageLoader }),
};
