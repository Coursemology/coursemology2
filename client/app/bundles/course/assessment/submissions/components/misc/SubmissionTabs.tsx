import { FC, useEffect } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Tab, Tabs } from '@mui/material';
import CustomBadge from 'lib/components/extensions/CustomBadge';
import { SubmissionsTabData } from 'types/course/assessment/submissions';
import { AppDispatch } from 'types/store';
import { tabsStyle } from 'theme/mui-style';
import {
  fetchAllStudentsPendingSubmissions,
  fetchCategorySubmissions,
  fetchMyStudentsPendingSubmissions,
} from '../../operations';

interface Props extends WrappedComponentProps {
  canManage: boolean;
  isTeachingStaff: boolean;
  tabs: SubmissionsTabData;
  tabValue: number;
  setTabValue: React.Dispatch<React.SetStateAction<number>>;
  setIsTabChanging: React.Dispatch<React.SetStateAction<boolean>>;
  setTableIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPageNum: React.Dispatch<React.SetStateAction<number>>;
}

const translations = defineMessages({
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
});

const SubmissionTabs: FC<Props> = (props) => {
  const {
    intl,
    canManage,
    isTeachingStaff,
    tabs,
    tabValue,
    setTabValue,
    setIsTabChanging,
    setTableIsLoading,
    setPageNum,
  } = props;

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ): void => {
    setTabValue(newValue);
    setPageNum(1);
  };

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isTeachingStaff && tabs.myStudentsPendingCount !== 0) {
      setTabValue(0);
      dispatch(fetchMyStudentsPendingSubmissions()).then(() => {
        setIsTabChanging(false);
        setTableIsLoading(false);
      });
    } else if (canManage && tabs.allStudentsPendingCount !== 0) {
      setTabValue(1);
      dispatch(fetchAllStudentsPendingSubmissions()).then(() => {
        setIsTabChanging(false);
        setTableIsLoading(false);
      });
    } else {
      setIsTabChanging(false);
      setTableIsLoading(false);
    }
  }, []);

  /*
  The Tabs are numbered (values) as such:
  0 - my students pending
  1 - all students pending
  2+ - respective category tabs, category 0 will correspond to value 2 and so on
  */
  if (tabValue === null) return null;
  return (
    <Tabs
      value={tabValue}
      variant="scrollable"
      scrollButtons="auto"
      onChange={handleTabChange}
      TabIndicatorProps={{ style: { transition: 'none' } }}
      sx={tabsStyle}
    >
      {isTeachingStaff && (
        <Tab
          id="my-students-pending-tab"
          value={0}
          label={intl.formatMessage(translations.myStudentsPending)}
          icon={
            <CustomBadge
              badgeContent={tabs.myStudentsPendingCount}
              color="primary"
            />
          }
          iconPosition="end"
          style={{
            minHeight: 48,
            paddingRight: tabs.myStudentsPendingCount === 0 ? 8 : 26,
            textDecoration: 'none',
          }}
          onClick={(): Promise<string | number | void> => {
            // Prevent API calls when spam clicking the tab
            if (tabValue !== 0) {
              setTableIsLoading(true);
              setIsTabChanging(true);
              return dispatch(fetchMyStudentsPendingSubmissions())
                .finally(() => {
                  setTableIsLoading(false);
                  setIsTabChanging(false);
                })
                .catch(() => {
                  setTableIsLoading(false);
                  setIsTabChanging(false);
                  toast.error(
                    intl.formatMessage(translations.fetchSubmissionsFailure),
                  );
                });
            }
            return new Promise(() => {});
          }}
        />
      )}

      {isTeachingStaff && (
        <Tab
          id="all-students-pending-tab"
          value={1}
          label={intl.formatMessage(translations.allStudentsPending)}
          icon={
            <CustomBadge
              badgeContent={tabs.allStudentsPendingCount}
              color="primary"
            />
          }
          iconPosition="end"
          style={{
            paddingRight: tabs.allStudentsPendingCount === 0 ? 8 : 26,
          }}
          onClick={(): Promise<string | number | void> => {
            // Prevent API calls when spam clicking the tab
            if (tabValue !== 1) {
              setTableIsLoading(true);
              setIsTabChanging(true);
              return dispatch(fetchAllStudentsPendingSubmissions())
                .finally(() => {
                  setTableIsLoading(false);
                  setIsTabChanging(false);
                })
                .catch(() => {
                  setTableIsLoading(false);
                  setIsTabChanging(false);
                  toast.error(
                    intl.formatMessage(translations.fetchSubmissionsFailure),
                  );
                });
            }
            return new Promise(() => {});
          }}
        />
      )}

      {tabs.categories.map((tab, index) => (
        <Tab
          id={`category-tab-${tab.id}`}
          key={tab.id}
          value={index + 2}
          label={tab.title}
          onClick={(): Promise<string | number | void> => {
            // Prevent API calls when spam clicking the tab
            if (tabValue !== index + 2) {
              setTableIsLoading(true);
              setIsTabChanging(true);
              dispatch(fetchCategorySubmissions(tab.id))
                .finally(() => {
                  setTableIsLoading(false);
                  setIsTabChanging(false);
                })
                .catch(() => {
                  setTableIsLoading(false);
                  setIsTabChanging(false);
                  toast.error(
                    intl.formatMessage(translations.fetchSubmissionsFailure),
                  );
                });
            }
            return new Promise(() => {});
          }}
        />
      ))}
    </Tabs>
  );
};

export default injectIntl(SubmissionTabs);
