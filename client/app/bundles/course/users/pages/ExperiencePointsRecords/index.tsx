import { useState } from 'react';
import { defineMessages } from 'react-intl';

import BackendPagination from 'lib/components/core/layouts/BackendPagination';
import Page from 'lib/components/core/layouts/Page';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId, getCourseUserId } from 'lib/helpers/url-helpers';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import ExperiencePointsTable from '../../components/tables/ExperiencePointsTable';
import { getExperiencePointsRecordsSettings } from '../../selectors';

const ROWS_PER_PAGE = 25 as const;

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

const ExperiencePointsRecords = (): JSX.Element => {
  const { t } = useTranslation();

  const [pageNum, setPageNum] = useState(1);

  const records = useAppSelector(getExperiencePointsRecordsSettings);

  return (
    <Page
      backTo={getCourseUserURL(getCourseId(), getCourseUserId())}
      title={t(translations.experiencePointsHistoryHeader, {
        for: records.courseUserName,
      })}
      unpadded
    >
      <BackendPagination
        handlePageChange={setPageNum}
        pageNum={pageNum}
        rowCount={records.rowCount}
        rowsPerPage={ROWS_PER_PAGE}
      />

      <ExperiencePointsTable page={pageNum} />
    </Page>
  );
};

const handle = translations.experiencePointsHistory;

export default Object.assign(ExperiencePointsRecords, { handle });
