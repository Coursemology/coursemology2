import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link, Typography } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';

import SummaryCard from 'lib/components/core/layouts/SummaryCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import { TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';

import CoursesButtons from '../../components/buttons/CoursesButtons';
import CoursesTable from '../../components/tables/CoursesTable';
import { deleteCourse, indexCourses } from '../../operations';
import { getAdminCounts, getAllCourseMiniEntities } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.courses.header',
    defaultMessage: 'Courses',
  },
  title: {
    id: 'system.admin.courses.title',
    defaultMessage: 'Courses',
  },
  fetchCoursesFailure: {
    id: 'system.admin.courses.fetch.failure',
    defaultMessage: 'Failed to fetch courses.',
  },
  totalCourses: {
    id: 'system.admin.courses.totalCourses',
    defaultMessage: `Total Courses: {count}`,
  },
  activeCourses: {
    id: 'system.admin.courses.activeCourses',
    defaultMessage: `Active Courses (in the past 7 days): {count}`,
  },
});

const CoursesIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState({ active: false });
  const courseCounts = useSelector((state: AppState) => getAdminCounts(state));
  const courses = useSelector((state: AppState) =>
    getAllCourseMiniEntities(state),
  );
  const dispatch = useDispatch<AppDispatch>();
  const totalCount =
    filter.active && courseCounts.totalCourses !== 0 ? (
      <Link
        component="button"
        onClick={(): void => setFilter({ active: false })}
      >
        <strong>{courseCounts.totalCourses}</strong>
      </Link>
    ) : (
      <strong>{courseCounts.totalCourses}</strong>
    );

  const activeCount =
    !filter.active && courseCounts.activeCourses !== 0 ? (
      <Link
        component="button"
        onClick={(): void => setFilter({ active: true })}
      >
        <strong>{courseCounts.activeCourses}</strong>
      </Link>
    ) : (
      <strong>{courseCounts.activeCourses}</strong>
    );

  useEffect(() => {
    setIsLoading(true);
    dispatch(
      indexCourses({
        'filter[length]': TABLE_ROWS_PER_PAGE,
        active: filter.active,
      }),
    )
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchCoursesFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch, filter.active]);

  const renderSummaryContent: JSX.Element = (
    <>
      <Typography variant="body2">
        {intl.formatMessage(translations.totalCourses, {
          count: totalCount,
        })}
      </Typography>
      <Typography variant="body2">
        {intl.formatMessage(translations.activeCourses, {
          count: activeCount,
        })}
      </Typography>
    </>
  );

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      <SummaryCard renderContent={renderSummaryContent} />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <CoursesTable
          courseCounts={courseCounts}
          courses={courses}
          filter={filter}
          indexOperation={indexCourses}
          renderRowActionComponent={(course): JSX.Element => (
            <CoursesButtons course={course} deleteOperation={deleteCourse} />
          )}
          title={intl.formatMessage(translations.title)}
        />
      )}
    </>
  );
};

export default injectIntl(CoursesIndex);
