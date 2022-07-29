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
import { Link, useLocation } from 'react-router-dom';
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
    defaultMessage: `Total Courses: <strong>{count}</strong>`,
  },
  activeCourses: {
    id: 'system.admin.courses.activeCourses',
    defaultMessage: `Active Courses (in the past 7 days): {link}`,
  },
});

const CoursesIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const counts = useSelector((state: AppState) => getAdminCounts(state));
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [tableTitle, setTableTitle] = useState(
    intl.formatMessage(translations.title),
  );

  useEffect(() => {
    const active = getUrlParameter('active');
    if (active === 'true') {
      setTableTitle(`${intl.formatMessage(translations.title)} (Active)`);
    }
    setIsLoading(true);
    dispatch(indexCourses({ 'filter[length]': 100, active }))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchCoursesFailure)),
      )
      .finally(() => setIsLoading(false));
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
              <Link to={{ search: `?active=true` }}>
                <strong>{counts.activeCourses}</strong>
              </Link>
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
        title={tableTitle}
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
