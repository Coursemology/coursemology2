import { useState } from 'react';
import { ExperiencePointsNameFilterData } from 'types/course/experiencePointsRecords';

import BackendPagination from 'lib/components/core/layouts/BackendPagination';
import Page from 'lib/components/core/layouts/Page';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import ExperiencePointsTable from './components/ExperiencePointsTable';
import ExperiencePointsFilterDownload from './ExperiencePointsFilterDownload';
import { downloadExperiencePoints } from './operations';
import { getExpPointsRecordsSettings } from './selectors';

const ROWS_PER_PAGE = 25 as const;

const ExperiencePointsDetails = (): JSX.Element => {
  const dispatch = useAppDispatch();

  const [pageNum, setPageNum] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // For filtering
  const [selectedFilter, setSelectedFilter] = useState<{
    name: ExperiencePointsNameFilterData | null;
  }>({
    name: null,
  });

  const studentFilterId = selectedFilter.name?.id;
  const settings = useAppSelector(getExpPointsRecordsSettings);

  const handleOnClick = (): void => {
    downloadExperiencePoints(dispatch, studentFilterId);
  };

  const pagination = (
    <BackendPagination
      handlePageChange={setPageNum}
      pageNum={pageNum}
      rowCount={settings.rowCount}
      rowsPerPage={ROWS_PER_PAGE}
    />
  );

  return (
    <Page unpadded>
      <Page.PaddedSection>
        <ExperiencePointsFilterDownload
          filter={settings.filters}
          onClick={handleOnClick}
          selectedFilter={selectedFilter}
          setPageNum={setPageNum}
          setSelectedFilter={setSelectedFilter}
        />
      </Page.PaddedSection>

      {pagination}

      <ExperiencePointsTable
        isLoading={isLoading}
        pageNum={pageNum}
        setIsLoading={setIsLoading}
        studentId={studentFilterId}
      />

      {!isLoading && pagination}
    </Page>
  );
};

export default ExperiencePointsDetails;
