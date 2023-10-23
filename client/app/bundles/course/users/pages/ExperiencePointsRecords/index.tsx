import { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';

import ExperiencePointsTable from 'course/experience-points/components/ExperiencePointsTable';
import { fetchUserExperiencePointsRecord } from 'course/experience-points/operations';
import {
  getAllExpPointsRecordsEntities,
  getExpPointsRecordsSettings,
} from 'course/experience-points/selectors';
import BackendPagination from 'lib/components/core/layouts/BackendPagination';
import Page from 'lib/components/core/layouts/Page';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId, getCourseUserId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

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
  fetchRecordsFailure: {
    id: 'course.experiencePoints.fetchRecordsFailure',
    defaultMessage: 'Failed to fetch records',
  },
});

const ExperiencePointsRecords = (): JSX.Element => {
  const { t } = useTranslation();

  const [pageNum, setPageNum] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const settings = useAppSelector(getExpPointsRecordsSettings);
  const records = useAppSelector(getAllExpPointsRecordsEntities);

  const courseId = getCourseId();
  const userId = +getCourseUserId()!;

  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchUserExperiencePointsRecord(userId, pageNum))
      .catch(() => toast.error(t(translations.fetchRecordsFailure)))
      .finally(() => {
        setIsLoading(false);
      });
  }, [pageNum, userId]);

  const pagination = (
    <BackendPagination
      handlePageChange={setPageNum}
      pageNum={pageNum}
      rowCount={settings.rowCount}
      rowsPerPage={ROWS_PER_PAGE}
    />
  );

  return (
    <Page
      backTo={getCourseUserURL(courseId, userId)}
      title={t(translations.experiencePointsHistoryHeader, {
        for: settings.studentName,
      })}
      unpadded
    >
      {pagination}

      <ExperiencePointsTable
        disabled={false}
        isLoading={isLoading}
        isStudentPage
        records={records}
      />

      {!isLoading && pagination}
    </Page>
  );
};

const handle = translations.experiencePointsHistory;

export default Object.assign(ExperiencePointsRecords, { handle });
