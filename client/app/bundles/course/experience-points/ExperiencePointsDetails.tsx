import { useState } from 'react';
import { defineMessages } from 'react-intl';

import DownloadButton from 'lib/components/core/buttons/DownloadButton';
import BackendPagination from 'lib/components/core/layouts/BackendPagination';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import ExperiencePointsTable from './components/ExperiencePointsTable';
import {
  ExperiencePointsData,
  fetchAllExperiencePointsRecord,
} from './operations';

const ROWS_PER_PAGE = 25 as const;

const translations = defineMessages({
  experiencePointsHistory: {
    id: 'course.users.ExperiencePointsRecords.experiencePointsHistory',
    defaultMessage: 'Experience Points History',
  },
});

const ExperiencePointsDetails = (): JSX.Element => {
  const { t } = useTranslation();

  const [pageNum, setPageNum] = useState(1);
  const fetchExperienceInPage = (): ExperiencePointsData => {
    return fetchAllExperiencePointsRecord(pageNum);
  };

  const downloadButton = <DownloadButton href="">Download CSV</DownloadButton>;

  return (
    <Preload
      render={<LoadingIndicator />}
      syncsWith={[pageNum]}
      while={fetchExperienceInPage}
    >
      {(data): JSX.Element => (
        <Page
          actions={downloadButton}
          title={t(translations.experiencePointsHistory)}
          unpadded
        >
          <BackendPagination
            handlePageChange={setPageNum}
            pageNum={pageNum}
            rowCount={data.rowCount}
            rowsPerPage={ROWS_PER_PAGE}
          />

          <ExperiencePointsTable records={data.experiencePointRecords} />
        </Page>
      )}
    </Preload>
  );
};

export default ExperiencePointsDetails;
