import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import { useSelector } from 'react-redux';
import { AppState } from 'types/store';
import { getExperiencePointsRecordsSettings } from '../../selectors';
import ExperiencePointsTable from '../../components/tables/ExperiencePointsTable';
import PointPagination from '../../components/pagination/PointPagination';

type Props = WrappedComponentProps;

const translations = defineMessages({
  experiencePointsRecordsHeader: {
    id: 'course.users.xperiencePointsRecords.header',
    defaultMessage: 'Experience Points History for ',
  },
  fetchUsersFailure: {
    id: 'course.users.manage.fetch.failue',
    defaultMessage: 'Failed to fetch users',
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
        title={`${intl.formatMessage(
          translations.experiencePointsRecordsHeader,
        )} ${experiencePointsRecordSettings.name}`}
      />
      <PointPagination
        rowCount={experiencePointsRecordSettings.rowCount}
        rowsPerPage={ROWS_PER_PAGE}
        pageNum={pageNum}
        handlePageChange={handlePageChange}
      />
      <ExperiencePointsTable page={pageNum} />
      <PointPagination
        rowCount={experiencePointsRecordSettings.rowCount}
        rowsPerPage={ROWS_PER_PAGE}
        pageNum={pageNum}
        handlePageChange={handlePageChange}
      />
    </>
  );
};

export default injectIntl(ExperiencePointsRecords);
