import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { toast } from 'react-toastify';
import PageHeader from 'lib/components/pages/PageHeader';
import {
  CommentPermissions,
  CommentTabData,
  CommentTabInfo,
  CommentTabTypes,
} from 'types/course/comments';
import { Badge, BadgeProps, styled, Tab, Tabs } from '@mui/material';
import { getSettings } from '../../selectors';
import { fetchTabData } from '../../operations';
import TopicList from '../../components/lists/TopicList';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchCommentsFailure: {
    id: 'course.discussion.topics.index.fetch.failure',
    defaultMessage: 'Failed to retrieve comments.',
  },
  comments: {
    id: 'course.discussion.topics.index.comments',
    defaultMessage: 'Comments',
  },
  myStudentsPending: {
    id: 'course.discussion.topics.index.myStudentsPending',
    defaultMessage: 'My Students Pending',
  },
  pending: {
    id: 'course.discussion.topics.index.pending',
    defaultMessage: 'Pending',
  },
  myStudents: {
    id: 'course.discussion.topics.index.myStudents',
    defaultMessage: 'My Students',
  },
  unread: {
    id: 'course.discussion.topics.index.unread',
    defaultMessage: 'Unread',
  },
  all: {
    id: 'course.discussion.topics.index.all',
    defaultMessage: 'All',
  },
});

const CommentIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const settings = useSelector((state: AppState) => getSettings(state));

  const getInitialTab = (
    permissions: CommentPermissions,
    tabInfo: CommentTabInfo,
  ): CommentTabTypes => {
    if (permissions.canManage) {
      if (tabInfo.myStudentExist) {
        return CommentTabTypes.MY_STUDENTS_PENDING;
      }
      return CommentTabTypes.PENDING;
    }
    return CommentTabTypes.UNREAD;
  };

  const getTabTypesToRender = (
    permissions: CommentPermissions,
    tabInfo: CommentTabInfo,
  ): CommentTabData[] => {
    const tabs = [] as CommentTabTypes[];
    if (permissions.isStudent) {
      tabs.push(CommentTabTypes.UNREAD);
    } else {
      if (tabInfo.myStudentExist) {
        tabs.push(CommentTabTypes.MY_STUDENTS_PENDING);
      }
      if (permissions.canManage) {
        tabs.push(CommentTabTypes.PENDING);
      }
      if (tabInfo.myStudentExist) {
        tabs.push(CommentTabTypes.MY_STUDENTS);
      }
    }
    tabs.push(CommentTabTypes.ALL);
    const tabData: CommentTabData[] = tabs.map(
      (commentType: CommentTabTypes) => {
        let typeCount = 0;
        if (
          commentType === CommentTabTypes.MY_STUDENTS_PENDING &&
          tabInfo.myStudentUnreadCount
        ) {
          typeCount = tabInfo.myStudentUnreadCount;
        } else if (
          commentType === CommentTabTypes.PENDING &&
          tabInfo.allStaffUnreadCount
        ) {
          typeCount = tabInfo.allStaffUnreadCount;
        } else if (
          commentType === CommentTabTypes.UNREAD &&
          tabInfo.allStudentUnreadCount
        ) {
          typeCount = tabInfo.allStudentUnreadCount;
        }
        return {
          type: commentType,
          count: typeCount,
        };
      },
    );
    return tabData;
  };

  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState('');
  const [tabTypesToRender, setTabTypesToRender] = useState(
    [] as CommentTabData[],
  );

  useEffect(() => {
    dispatch(fetchTabData())
      .then((request) => {
        const data = request.data;
        setTabValue(getInitialTab(data.permissions, data.tabs));
        setTabTypesToRender(getTabTypesToRender(data.permissions, data.tabs));
      })
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchCommentsFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  const setCount = (count: number, type: CommentTabTypes): void => {
    const newTabTypesToRender: CommentTabData[] = tabTypesToRender.map(
      (data: CommentTabData) => {
        if (data.type === type) {
          const newData = { ...data, count };
          return newData;
        }
        return data;
      },
    );
    setTabTypesToRender(newTabTypesToRender);
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const tabTranslation = (tabType: CommentTabTypes): string | JSX.Element => {
    switch (tabType) {
      case CommentTabTypes.MY_STUDENTS_PENDING:
        return intl.formatMessage(translations.myStudentsPending);
      case CommentTabTypes.PENDING:
        return intl.formatMessage(translations.pending);
      case CommentTabTypes.MY_STUDENTS:
        return intl.formatMessage(translations.myStudents);
      case CommentTabTypes.UNREAD:
        return intl.formatMessage(translations.unread);
      case CommentTabTypes.ALL:
        return intl.formatMessage(translations.all);
      default:
        return '';
    }
  };

  const CustomBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: -8,
      top: -1,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }));

  return (
    <>
      <PageHeader
        title={
          settings.title ?? intl.formatMessage({ ...translations.comments })
        }
      />
      <Tabs
        onChange={(_, value): void => {
          setTabValue(value);
        }}
        TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
        value={tabValue}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          // to show tab indicator on firefox
          '& .MuiTabs-indicator': {
            bottom: 'auto',
          },
          '.css-117fsft-MuiButtonBase-root-MuiTab-root': { minHeight: 48 },
          minHeight: '50px',
          '& .MuiTab-root:focus': {
            outline: 0,
          },
        }}
      >
        {tabTypesToRender.length > 0 &&
          tabTypesToRender.map((tabData: CommentTabData) => (
            <Tab
              id={`${tabData.type}_tab`}
              key={tabData.type}
              icon={
                <CustomBadge badgeContent={tabData.count} color="primary" />
              }
              iconPosition="end"
              style={{
                paddingRight:
                  tabData.count === 0 || tabData.count === undefined ? 8 : 26,
                textDecoration: 'none',
              }}
              label={tabTranslation(tabData.type)}
              value={tabData.type}
            />
          ))}
      </Tabs>
      <TopicList tabValue={tabValue} settings={settings} setCount={setCount} />
    </>
  );
};

export default injectIntl(CommentIndex);
