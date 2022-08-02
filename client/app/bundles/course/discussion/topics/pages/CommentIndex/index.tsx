import { FC, useEffect, useState } from 'react';
import {
  defineMessages,
  injectIntl,
  WrappedComponentProps,
  IntlShape,
} from 'react-intl';
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
import { Tab, Tabs } from '@mui/material';
import CustomBadge from 'lib/components/misc/CustomBadge';
import { tabsStyle } from 'theme/mui-style';
import {
  getPermissions,
  getSettings,
  getTabInfo,
  getTabValue,
} from '../../selectors';
import { fetchTabData } from '../../operations';
import { changeTabValue } from '../../actions';
import TopicList from '../../components/lists/TopicList';

type Props = WrappedComponentProps;

interface CommentTabProps extends WrappedComponentProps {
  tabValue: string;
}

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

const getTabTypesToRender = (
  permissions: CommentPermissions,
  tabInfo: CommentTabInfo,
): CommentTabData[] => {
  const tabs = [] as CommentTabTypes[];
  if (permissions.isTeachingStaff || permissions.canManage) {
    if (tabInfo.myStudentExist) {
      tabs.push(CommentTabTypes.MY_STUDENTS_PENDING);
    }
    tabs.push(CommentTabTypes.PENDING);
    if (tabInfo.myStudentExist) {
      tabs.push(CommentTabTypes.MY_STUDENTS);
    }
  } else if (permissions.isStudent) {
    tabs.push(CommentTabTypes.UNREAD);
  }
  tabs.push(CommentTabTypes.ALL);
  const tabData: CommentTabData[] = tabs.map((commentType: CommentTabTypes) => {
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
  });
  return tabData;
};

const tabTranslation = (
  intl: IntlShape,
  tabType: CommentTabTypes,
): string | JSX.Element => {
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

const CommentTabs: FC<CommentTabProps> = (props) => {
  const { tabValue, intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [tabTypesToRender, setTabTypesToRender] = useState(
    [] as CommentTabData[],
  );
  const permissions = useSelector((state: AppState) => getPermissions(state));
  const tabs = useSelector((state: AppState) => getTabInfo(state));

  useEffect(() => {
    setTabTypesToRender(getTabTypesToRender(permissions, tabs));
  }, [permissions, tabs]);

  return (
    <Tabs
      onChange={(_, value): void => {
        dispatch(changeTabValue(value));
      }}
      TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
      value={tabValue}
      variant="scrollable"
      scrollButtons="auto"
      sx={tabsStyle}
    >
      {tabTypesToRender.length > 0 &&
        tabTypesToRender.map((tabData: CommentTabData) => (
          <Tab
            id={`${tabData.type}_tab`}
            key={tabData.type}
            icon={<CustomBadge badgeContent={tabData.count} color="primary" />}
            iconPosition="end"
            style={{
              minHeight: 48,
              paddingRight:
                tabData.count === 0 || tabData.count === undefined ? 8 : 26,
              textDecoration: 'none',
            }}
            label={tabTranslation(intl, tabData.type)}
            value={tabData.type}
          />
        ))}
    </Tabs>
  );
};

const CommentIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useDispatch<AppDispatch>();

  const settings = useSelector((state: AppState) => getSettings(state));
  const tabValue = useSelector((state: AppState) => getTabValue(state));

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchTabData())
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchCommentsFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <PageHeader
        title={
          settings.title ?? intl.formatMessage({ ...translations.comments })
        }
      />
      <CommentTabs tabValue={tabValue} intl={intl} />
      <TopicList key={tabValue} tabValue={tabValue} settings={settings} />
    </>
  );
};

export default injectIntl(CommentIndex);
