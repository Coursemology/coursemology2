import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  SubmissionAssessmentFilterData,
  SubmissionGroupFilterData,
  SubmissionUserFilterData,
} from 'types/course/assessment/submissions';
import { AppDispatch, AppState } from 'types/store';

import BackendPagination from 'lib/components/core/layouts/BackendPagination';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';

import SubmissionFilter from '../../components/misc/SubmissionFilter';
import SubmissionTabs from '../../components/misc/SubmissionTabs';
import SubmissionsTable from '../../components/tables/SubmissionsTable';
import {
  fetchSubmissions,
  filterPendingSubmissions,
  filterSubmissions,
} from '../../operations';
import {
  getAllSubmissionMiniEntities,
  getFilter,
  getIsGamified,
  getSubmissionCount,
  getSubmissionPermissions,
  getTabs,
} from '../../selectors';

interface Props extends WrappedComponentProps {}

const translations = defineMessages({
  header: {
    id: 'course.assessments.submissions.header',
    defaultMessage: 'Submissions',
  },
  fetchSubmissionsFailure: {
    id: 'course.assessments.submissions.fetchSubmissionsFailure',
    defaultMessage: 'Failed to fetch submissions',
  },
  filterGetFailure: {
    id: 'course.assessments.submissions.filterGetFailure',
    defaultMessage: 'Failed to filter',
  },
});

const SubmissionsIndex: FC<Props> = (props) => {
  const { intl } = props;

  const dispatch = useDispatch<AppDispatch>();

  const ROWS_PER_PAGE = 25;
  const [pageNum, setPageNum] = useState(1);

  // Selectors
  const isGamified = useSelector((state: AppState) => getIsGamified(state));
  const submissionCount = useSelector((state: AppState) =>
    getSubmissionCount(state),
  );
  const submissions = useSelector((state: AppState) =>
    getAllSubmissionMiniEntities(state),
  );
  const tabs = useSelector((state: AppState) => getTabs(state));
  const filter = useSelector((state: AppState) => getFilter(state));
  const submissionPermissions = useSelector((state: AppState) =>
    getSubmissionPermissions(state),
  );

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
        toast.error(intl.formatMessage(translations.filterGetFailure));
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
          toast.error(intl.formatMessage(translations.filterGetFailure));
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
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchSubmissionsFailure)),
      );
  }, [dispatch]);

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
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

          <SubmissionFilter
            key={`submission-filter-${tabValue}`}
            categoryNum={tabValue - 2}
            filter={filter}
            handleFilterOnClick={handleFilter}
            selectedFilter={selectedFilter}
            setPageNum={setPageNum}
            setSelectedFilter={setSelectedFilter}
            setTableIsLoading={setTableIsLoading}
            showDetailFilter={submissionPermissions.canManage && tabValue > 1}
            tabCategories={tabs.categories}
          />

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
    </>
  );
};

export default injectIntl(SubmissionsIndex);
