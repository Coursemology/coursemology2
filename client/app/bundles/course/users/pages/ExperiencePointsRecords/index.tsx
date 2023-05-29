import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

import BackendPagination from 'lib/components/core/layouts/BackendPagination';
import PageHeader from 'lib/components/navigation/PageHeader';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId, getCourseUserId } from 'lib/helpers/url-helpers';
import { useAppSelector } from 'lib/hooks/store';

import ExperiencePointsTable from '../../components/tables/ExperiencePointsTable';
import { getExperiencePointsRecordsSettings } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  experiencePointsHistory: {
    id: 'course.users.ExperiencePointsRecords.experiencePointsHistory',
    defaultMessage: 'Experience Points History',
  },
  experiencePointsHistoryHeader: {
    id: 'course.users.ExperiencePointsRecords.experiencePointsHistoryHeader',
    defaultMessage: 'Experience Points History: {for}',
  },
  fetchUsersFailure: {
    id: 'course.users.ExperiencePointsRecords.fetchUsersFailure',
    defaultMessage: 'Failed to fetch records',
  },
});

const ExperiencePointsRecords: FC<Props> = (props) => {
  const { intl } = props;
  const ROWS_PER_PAGE = 25;
  const [pageNum, setPageNum] = useState(1);
  const experiencePointsRecordSettings = useAppSelector(
    getExperiencePointsRecordsSettings,
  );

  const handlePageChange = (num: number): void => {
    setPageNum(num);
  };

  return (
    <>
      <PageHeader
        returnLink={getCourseUserURL(getCourseId(), getCourseUserId())}
        title={`${intl.formatMessage(
          translations.experiencePointsRecordsHeader,
        )} ${experiencePointsRecordSettings.courseUserName}`}
      />
      <BackendPagination
        handlePageChange={handlePageChange}
        pageNum={pageNum}
        rowCount={experiencePointsRecordSettings.rowCount}
        rowsPerPage={ROWS_PER_PAGE}
      />
      <ExperiencePointsTable page={pageNum} />
    </>
  );
};

const handle = translations.experiencePointsHistory;

export default Object.assign(ExperiencePointsRecords, { handle });
