import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useSelector } from 'react-redux';
import { AppState } from 'types/store';

import BackendPagination from 'lib/components/core/layouts/BackendPagination';
import PageHeader from 'lib/components/navigation/PageHeader';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId, getCourseUserId } from 'lib/helpers/url-helpers';

import ExperiencePointsTable from '../../components/tables/ExperiencePointsTable';
import { getExperiencePointsRecordsSettings } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  experiencePointsRecordsHeader: {
    id: 'course.users.ExperiencePointsRecords.header',
    defaultMessage: 'Experience Points History - ',
  },
  fetchUsersFailure: {
    id: 'course.users.ExperiencePointsRecords.fetch.failue',
    defaultMessage: 'Failed to fetch records',
  },
});

const ExperiencePointsRecords: FC<Props> = (props) => {
  const { intl } = props;
  const ROWS_PER_PAGE = 25;
  const [pageNum, setPageNum] = useState(1);
  const experiencePointsRecordSettings = useSelector((state: AppState) =>
    getExperiencePointsRecordsSettings(state),
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

export default injectIntl(ExperiencePointsRecords);
