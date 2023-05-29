import { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import {
  SubmissionAssessmentFilterData,
  SubmissionGroupFilterData,
  SubmissionUserFilterData,
} from 'types/course/assessment/submissions';

import BackendPagination from 'lib/components/core/layouts/BackendPagination';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import SubmissionFilter from './components/misc/SubmissionFilter';
import SubmissionTabs from './components/misc/SubmissionTabs';
import SubmissionsTable from './components/tables/SubmissionsTable';
import {
  fetchSubmissions,
  filterPendingSubmissions,
  filterSubmissions,
} from './operations';
import {
  getAllSubmissionMiniEntities,
  getFilter,
  getIsGamified,
  getSubmissionCount,
  getSubmissionPermissions,
  getTabs,
} from './selectors';

const translations = defineMessages({
  header: {
    id: 'course.assessment.submissions.SubmissionsIndex.header',
    defaultMessage: 'Submissions',
  },
  fetchSubmissionsFailure: {
    id: 'course.assessment.submissions.SubmissionsIndex.fetchSubmissionsFailure',
    defaultMessage: 'Failed to fetch submissions',
  },
  filterGetFailure: {
    id: 'course.assessment.submissions.SubmissionsIndex.filterGetFailure',
    defaultMessage: 'Failed to filter',
  },
});

const SubmissionsIndex = (): JSX.Element => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const ROWS_PER_PAGE = 25;
  const [pageNum, setPageNum] = useState(1);

  // Selectors
  const isGamified = useAppSelector(getIsGamified);
  const submissionCount = useAppSelector(getSubmissionCount);
  const submissions = useAppSelector(getAllSubmissionMiniEntities);
  const tabs = useAppSelector(getTabs);
  const filter = useAppSelector(getFilter);
  const submissionPermissions = useAppSelector(getSubmissionPermissions);

  // For tab logic and control
  const [tabValue, setTabValue] = useState(2);
  const [isTabChanging, setIsTabChanging] = useState(true);

  const [tableIsLoading, setTableIsLoading] = useState(true);

  // For filtering
  const [selectedFilter, setSelectedFilter] = useState<{
    assessment: SubmissionAssessmentFilterData | null;
    group: SubmissionGroupFilterData | null;
    user: SubmissionUserFilterData | null;
  }>({
    assessment: null,
    group: null,
    user: null,
  });

  const handleFilter = (newPageNumber: number): void => {
    setPageNum(newPageNumber);
    setTableIsLoading(true);

    const assessmentId = selectedFilter.assessment
      ? selectedFilter.assessment.id
      : null;
    const groupId = selectedFilter.group ? selectedFilter.group.id : null;
    const userId = selectedFilter.user ? selectedFilter.user.id : null;

    const categoryId = tabValue > 1 ? tabs.categories[tabValue - 2].id : null;

    dispatch(
      filterSubmissions(
        categoryId,
        assessmentId,
        groupId,
        userId,
        newPageNumber,
      ),
    )
      .then(() => {
        setTableIsLoading(false);
      })
      .catch(() => {
        toast.error(t(translations.filterGetFailure));
      });
  };

  const handlePageChange = (newPageNumber): void => {
    setTableIsLoading(true);
    setPageNum(newPageNumber);
    if (tabValue < 2) {
      dispatch(filterPendingSubmissions(tabValue === 0, newPageNumber))
        .then(() => {
          setTableIsLoading(false);
        })
        .catch(() => {
          toast.error(t(translations.filterGetFailure));
        });
    } else {
      handleFilter(newPageNumber);
    }
  };

  const [pageIsLoading, setPageIsLoading] = useState(true);
  useEffect(() => {
    dispatch(fetchSubmissions())
      .finally(() => {
        setPageIsLoading(false);
      })
      .catch(() => toast.error(t(translations.fetchSubmissionsFailure)));
  }, [dispatch]);

  return (
    <Page title={t(translations.header)} unpadded>
      {pageIsLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <SubmissionTabs
            canManage={submissionPermissions.canManage}
            isTeachingStaff={submissionPermissions.isTeachingStaff}
            setIsTabChanging={setIsTabChanging}
            setPageNum={setPageNum}
            setTableIsLoading={setTableIsLoading}
            setTabValue={setTabValue}
            tabs={tabs}
            tabValue={tabValue}
          />

          {submissionPermissions.canManage && tabValue > 1 && (
            <Page.PaddedSection>
              <SubmissionFilter
                key={`submission-filter-${tabValue}`}
                categoryNum={tabValue - 2}
                filter={filter}
                handleFilterOnClick={handleFilter}
                selectedFilter={selectedFilter}
                setPageNum={setPageNum}
                setSelectedFilter={setSelectedFilter}
                setTableIsLoading={setTableIsLoading}
                tabCategories={tabs.categories}
              />
            </Page.PaddedSection>
          )}

          {!isTabChanging && (
            <BackendPagination
              handlePageChange={handlePageChange}
              pageNum={pageNum}
              rowCount={submissionCount}
              rowsPerPage={ROWS_PER_PAGE}
            />
          )}

          <SubmissionsTable
            isGamified={isGamified}
            isPendingTab={submissionPermissions.isTeachingStaff && tabValue < 2}
            pageNum={pageNum}
            rowsPerPage={ROWS_PER_PAGE}
            submissions={submissions}
            tableIsLoading={tableIsLoading}
          />

          {!isTabChanging && submissions.length > 15 && !tableIsLoading && (
            <BackendPagination
              handlePageChange={handlePageChange}
              pageNum={pageNum}
              rowCount={submissionCount}
              rowsPerPage={ROWS_PER_PAGE}
            />
          )}
        </>
      )}
    </Page>
  );
};

const handle = translations.header;

export default Object.assign(SubmissionsIndex, { handle });
