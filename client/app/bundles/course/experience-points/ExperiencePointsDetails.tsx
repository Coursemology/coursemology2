import { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { AxiosError } from 'axios';
import { ExperiencePointsNameFilterData } from 'types/course/experiencePointsRecords';
import { JobCompleted, JobErrored } from 'types/jobs';

import BackendPagination from 'lib/components/core/layouts/BackendPagination';
import Page from 'lib/components/core/layouts/Page';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import loadingToast, { LoadingToast } from 'lib/hooks/toast/loadingToast';
import useTranslation from 'lib/hooks/useTranslation';

import ExperiencePointsDownload from './components/ExperiencePointsDownload';
import ExperiencePointsFiltering from './components/ExperiencePointsFiltering';
import ExperiencePointsTable from './components/ExperiencePointsTable';
import {
  downloadExperiencePoints,
  fetchAllExperiencePointsRecord,
} from './operations';
import {
  getAllExpPointsRecordsEntities,
  getExpPointsRecordsSettings,
} from './selectors';

const translations = defineMessages({
  fetchRecordsFailure: {
    id: 'course.experiencePoints.fetchRecordsFailure',
    defaultMessage: 'Failed to fetch records',
  },
  downloadRequestSuccess: {
    id: 'course.experiencePoints.downloadRequestSuccess',
    defaultMessage: 'Your request to download is successful',
  },
  downloadFailure: {
    id: 'course.experiencePoints.downloadFailure',
    defaultMessage: 'An error occurred while doing your request for download.',
  },
  downloadPending: {
    id: 'course.experiencePoints.downloadPending',
    defaultMessage:
      'Please wait as your request to download is being processed.',
  },
});

const ROWS_PER_PAGE = 25 as const;

const ExperiencePointsDetails = (): JSX.Element => {
  const [pageNum, setPageNum] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  // For filtering
  const [selectedFilter, setSelectedFilter] = useState<{
    name: ExperiencePointsNameFilterData | null;
  }>({
    name: null,
  });

  const studentFilterId = selectedFilter.name?.id;
  const settings = useAppSelector(getExpPointsRecordsSettings);
  const records = useAppSelector(getAllExpPointsRecordsEntities);

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchAllExperiencePointsRecord(studentFilterId, pageNum))
      .catch(() => toast.error(t(translations.fetchRecordsFailure)))
      .finally(() => {
        setIsLoading(false);
      });
  }, [pageNum, studentFilterId]);

  const handleSuccess =
    (loadToast: LoadingToast) =>
    (successData: JobCompleted): void => {
      window.location.href = successData.redirectUrl!;
      loadToast.success(t(translations.downloadRequestSuccess));
      setIsDownloading(false);
    };

  const handleFailure =
    (loadToast: LoadingToast) =>
    (error: JobErrored | AxiosError): void => {
      const message = error?.message || t(translations.downloadFailure);
      loadToast.error(message);
      setIsDownloading(false);
    };

  const handleOnClick = (): void => {
    setIsDownloading(true);
    const loadToast = loadingToast(t(translations.downloadPending));
    downloadExperiencePoints(
      handleSuccess(loadToast),
      handleFailure(loadToast),
      studentFilterId,
    );
  };

  const disabled = isDownloading || settings.rowCount === 0;

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
        <div className="flex w-full justify-between">
          <ExperiencePointsFiltering
            disabled={disabled}
            filter={settings.filters}
            setPageNum={setPageNum}
            setSelectedFilter={setSelectedFilter}
            studentName={selectedFilter.name}
          />
          <ExperiencePointsDownload
            disabled={disabled}
            onClick={handleOnClick}
          />
        </div>
      </Page.PaddedSection>

      {pagination}

      <ExperiencePointsTable
        disabled={disabled}
        isLoading={isLoading}
        records={records}
      />

      {!isLoading && pagination}
    </Page>
  );
};

export default ExperiencePointsDetails;
