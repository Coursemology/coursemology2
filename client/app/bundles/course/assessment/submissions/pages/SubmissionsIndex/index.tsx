/* eslint-disable no-nested-ternary */
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';

import { toast } from 'react-toastify';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import { Badge, BadgeProps, styled, Tab, Tabs } from '@mui/material';

import PageHeader from 'lib/components/pages/PageHeader';
import {
  getAllSubmissionMiniEntities,
  getFilter,
  getIsGamified,
  getSubmissionCount,
  getSubmissionPermissions,
  getTabs,
} from '../../selectors';
import {
  fetchAllStudentsPendingSubmissions,
  fetchCategorySubmissions,
  fetchMyStudentsPendingSubmissions,
  fetchSubmissions,
} from '../../operations';
import SubmissionsTable from '../../components/tables/SubmissionsTable';
import SubmissionFilter from '../../components/misc/SubmissionFilter';

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
  allStudentsPending: {
    id: 'course.assessments.submissions.allStudentsPending',
    defaultMessage: 'All Pending Submissions',
  },
  myStudentsPending: {
    id: 'course.assessments.submissions.myStudentsPending',
    defaultMessage: 'My Students Pending',
  },
  noSubmissionsMessage: {
    id: 'course.assessments.submissions.noSubmissionsMessage',
    defaultMessage: 'There are no submissions',
  },
});

const CustomBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -5,
    top: 0,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const SubmissionsIndex: FC<Props> = (props) => {
  const { intl } = props;

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
  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ): void => {
    setTabValue(newValue);
  };
  const [tableIsLoading, setTableIsLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchSubmissions())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchSubmissionsFailure)),
      );
  }, [dispatch]);
  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      {submissionPermissions.isTeachingStaff ? (
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          TabIndicatorProps={{ style: { transition: 'none' } }}
        >
          <Tab
            value={0}
            label={intl.formatMessage(translations.myStudentsPending)}
            icon={
              <CustomBadge
                badgeContent={tabs.myStudentsPendingCount}
                color="primary"
              />
            }
            iconPosition="end"
            onClick={(): Promise<string | number | void> => {
              // Prevent API calls when spam clicking the tab
              if (tabValue !== 0) {
                setTableIsLoading(true);
                return dispatch(fetchMyStudentsPendingSubmissions())
                  .finally(() => setTableIsLoading(false))
                  .catch(() => {
                    setTableIsLoading(false);
                    toast.error(
                      intl.formatMessage(translations.fetchSubmissionsFailure),
                    );
                  });
              }
              return new Promise(() => {});
            }}
          />

          <Tab
            value={1}
            label={intl.formatMessage(translations.allStudentsPending)}
            icon={
              <CustomBadge
                badgeContent={tabs.allStudentsPendingCount}
                color="primary"
              />
            }
            iconPosition="end"
            onClick={(): Promise<string | number | void> => {
              // Prevent API calls when spam clicking the tab
              if (tabValue !== 1) {
                setTableIsLoading(true);
                return dispatch(fetchAllStudentsPendingSubmissions())
                  .finally(() => setTableIsLoading(false))
                  .catch(() => {
                    setTableIsLoading(false);
                    toast.error(
                      intl.formatMessage(translations.fetchSubmissionsFailure),
                    );
                  });
              }
              return new Promise(() => {});
            }}
          />

          {tabs.categories.map((tab, index) => (
            <Tab
              key={tab.id}
              value={index + 2}
              label={tab.title}
              onClick={(): Promise<string | number | void> => {
                // Prevent API calls when spam clicking the tab
                if (tabValue !== index + 2) {
                  setTableIsLoading(true);
                  return dispatch(fetchCategorySubmissions(tab.id))
                    .finally(() => setTableIsLoading(false))
                    .catch(() => {
                      setTableIsLoading(false);
                      toast.error(
                        intl.formatMessage(
                          translations.fetchSubmissionsFailure,
                        ),
                      );
                    });
                }
                return new Promise(() => {});
              }}
            />
          ))}
        </Tabs>
      ) : (
        <Tabs value={tabValue} onChange={handleTabChange}>
          {tabs.categories.map((tab, index) => (
            <Tab
              key={tab.id}
              value={index + 2}
              label={tab.title}
              onClick={(): Promise<string | number | void> => {
                // Prevent API calls when spam clicking the tab
                if (tabValue !== index + 2) {
                  setTableIsLoading(true);
                  dispatch(fetchCategorySubmissions(tab.id))
                    .finally(() => setTableIsLoading(false))
                    .catch(() => {
                      setTableIsLoading(false);
                      toast.error(
                        intl.formatMessage(
                          translations.fetchSubmissionsFailure,
                        ),
                      );
                    });
                }
                return new Promise(() => {});
              }}
            />
          ))}
        </Tabs>
      )}

      <SubmissionFilter
        showDetailFilter={submissionPermissions.canManage && tabValue >= 2}
        tabCategories={tabs.categories}
        categoryNum={tabValue - 2}
        filter={filter}
        submissionCount={submissionCount}
        rowsPerPage={ROWS_PER_PAGE}
        pageNum={pageNum}
        setPageNum={setPageNum}
      />

      {submissions.length === 0 ? (
        <div style={{ marginTop: 10 }}>
          {intl.formatMessage(translations.noSubmissionsMessage)}
        </div>
      ) : (
        <>
          <SubmissionsTable
            isGamified={isGamified}
            submissions={submissions}
            isPendingTab={submissionPermissions.isTeachingStaff && tabValue < 2}
            tableIsLoading={tableIsLoading}
            rowsPerPage={ROWS_PER_PAGE}
            pageNum={pageNum}
          />
        </>
      )}
    </>
  );
};

export default injectIntl(SubmissionsIndex);
