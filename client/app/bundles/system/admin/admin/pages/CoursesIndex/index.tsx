import { FC, ReactNode, useEffect, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppState, AppDispatch } from 'types/store';
import { Typography } from '@mui/material';
import SummaryCard from 'lib/components/SummaryCard';
import { useLocation } from 'react-router-dom';
import { getUrlParameter } from 'lib/helpers/url-helpers';
import { indexCourses } from '../../operations';
import CoursesTable from '../../components/tables/CoursesTable';
import CoursesButtons from '../../components/buttons/CoursesButtons';
import { getAdminCounts } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.courses.header',
    defaultMessage: 'Courses',
  },
  fetchCoursesFailure: {
    id: 'system.admin.courses.fetch.failure',
    defaultMessage: 'Failed to fetch courses.',
  },
  totalCourses: {
    id: 'system.admin.courses.totalCourses',
    defaultMessage: `Total Courses: <strong>{count}</strong>`,
  },
  activeCourses: {
    id: 'system.admin.courses.activeCourses',
    defaultMessage: `Active Courses (in the past 7 days): {link}`,
  },
});

const CoursesIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const counts = useSelector((state: AppState) => getAdminCounts(state));
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  useEffect(() => {
    const active = getUrlParameter('active');
    dispatch(indexCourses({ active }))
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchCoursesFailure)),
      );
  }, [dispatch, location]);

  const renderSummaryContent: JSX.Element = (
    <>
      <Typography variant="body2">
        <FormattedMessage
          {...translations.totalCourses}
          values={{
            strong: (str: ReactNode[]): JSX.Element => <strong>{str}</strong>,
            count: counts.totalCourses,
          }}
        />
      </Typography>
      <Typography variant="body2">
        <FormattedMessage
          {...translations.activeCourses}
          values={{
            link: (
              <a href="?active=true">
                <strong>{counts.activeCourses}</strong>
              </a>
            ),
          }}
        />
      </Typography>
    </>
  );

  const renderBody: JSX.Element = (
    <>
      <SummaryCard renderContent={renderSummaryContent} />
      <CoursesTable
        renderRowActionComponent={(course): JSX.Element => (
          <CoursesButtons course={course} />
        )}
      />
    </>
  );

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      {isLoading ? <LoadingIndicator /> : <>{renderBody}</>}
    </>
  );
};

export default injectIntl(CoursesIndex);
