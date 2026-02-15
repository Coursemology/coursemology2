import { defineMessages } from 'react-intl';
import { Navigate } from 'react-router-dom';
import { ArrowForward } from '@mui/icons-material';
import { Avatar, Stack, Typography } from '@mui/material';
import { HomeLayoutCourseData } from 'types/home';

import { getCourseLogoUrl } from 'course/helper';
import SearchField from 'lib/components/core/fields/SearchField';
import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import { useAppContext } from 'lib/containers/AppContainer';
import { getUrlParameter } from 'lib/helpers/url-helpers';
import useItems from 'lib/hooks/items/useItems';
import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';

import NewCourseButton from './components/NewCourseButton';

const translations = defineMessages({
  searchCourses: {
    id: 'app.DashboardPage.searchCourses',
    defaultMessage: 'Search your courses',
  },
  allCourses: {
    id: 'app.DashboardPage.allCourses',
    defaultMessage: 'Courses',
  },
  yourCourses: {
    id: 'app.DashboardPage.yourCourses',
    defaultMessage: 'Your Courses',
  },
  lastAccessed: {
    id: 'app.DashboardPage.lastAccessed',
    defaultMessage: 'Last accessed {at}',
  },
  noCoursesMatch: {
    id: 'app.DashboardPage.noCoursesMatch',
    defaultMessage: 'Oops, no courses matched your search keyword.',
  },
});

interface CourseListItemProps {
  course: HomeLayoutCourseData;
}

const CourseListItem = (props: CourseListItemProps): JSX.Element => {
  const { course } = props;

  const { t } = useTranslation();

  return (
    <Link
      className="group flex items-center justify-between rounded-xl border border-solid border-neutral-200 p-5 transition-transform hover:bg-neutral-100 active:scale-95 active:bg-neutral-200"
      color="inherit"
      to={course.url}
      underline="none"
    >
      <div className="flex space-x-5">
        <Avatar
          alt={course.title}
          className="wh-20"
          src={getCourseLogoUrl(course.logoUrl)}
          variant="rounded"
        />

        <div className="flex flex-col justify-center">
          <Typography variant="body1">{course.title}</Typography>

          {course.lastActiveAt && (
            <Typography color="text.secondary" variant="body2">
              {t(translations.lastAccessed, {
                at: moment(course.lastActiveAt).fromNow(),
              })}
            </Typography>
          )}
        </div>
      </div>

      <ArrowForward className="invisible group-hover:visible" color="primary" />
    </Link>
  );
};

const DashboardPage = (): JSX.Element => {
  const { courses, user } = useAppContext();

  const { t } = useTranslation();

  const { processedItems: filteredCourses, handleSearch } = useItems(
    courses ?? [],
    ['title'],
  );

  return (
    <Page className="m-auto flex max-w-7xl flex-col justify-center space-y-7">
      <Stack alignItems="center" direction="row" justifyContent="space-between">
        <Typography className="max-w-7xl" variant="h4">
          {t(translations.yourCourses)}
        </Typography>

        {user?.canCreateNewCourse && <NewCourseButton />}
      </Stack>

      <SearchField
        autoFocus
        onChangeKeyword={handleSearch}
        placeholder={t(translations.searchCourses)}
      />

      {Boolean(courses?.length) && (
        <section className="flex flex-col space-y-5">
          {filteredCourses?.map((course) => (
            <CourseListItem key={course.id} course={course} />
          ))}

          {!filteredCourses?.length && (
            <Typography color="text.secondary">
              {t(translations.noCoursesMatch)}
            </Typography>
          )}
        </section>
      )}
    </Page>
  );
};

const DashboardPageRedirects = (): JSX.Element => {
  const { courses } = useAppContext();

  if (!courses?.length) return <Navigate to="/courses" />;

  if (courses?.length === 1) return <Navigate to={courses[0].url} />;

  if (getUrlParameter('from') === 'auth') {
    const visitedCourses = courses.filter((c) => !!c.lastActiveAt);

    if (visitedCourses.length > 0) {
      const lastVisitedCourse = visitedCourses.reduce((c1, c2) =>
        new Date(c1.lastActiveAt!) > new Date(c2.lastActiveAt!) ? c1 : c2,
      );

      return <Navigate to={lastVisitedCourse.url} />;
    }
    return <Navigate to="/courses" />;
  }

  return <DashboardPage />;
};

export default DashboardPageRedirects;
