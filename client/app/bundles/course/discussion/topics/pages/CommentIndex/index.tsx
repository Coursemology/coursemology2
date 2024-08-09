import { FC, useEffect, useState } from 'react';
import {
  defineMessages,
  injectIntl,
  IntlShape,
  WrappedComponentProps,
} from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';
import { tabsStyle } from 'theme/mui-style';
import {
  CommentPermissions,
  CommentTabData,
  CommentTabInfo,
  CommentTabTypes,
} from 'types/course/comments';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import CustomBadge from 'lib/components/extensions/CustomBadge';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import TopicList from '../../components/lists/TopicList';
import { fetchTabData } from '../../operations';
import {
  getPermissions,
  getSettings,
  getTabInfo,
  getTabValue,
} from '../../selectors';
import { actions } from '../../store';

type Props = WrappedComponentProps;

interface CommentTabProps extends WrappedComponentProps {
  tabValue: string;
}

const translations = defineMessages({
  fetchCommentsFailure: {
    id: 'course.discussion.topics.CommentIndex.fetchCommentsFailure',
    defaultMessage: 'Failed to retrieve comments.',
  },
  comments: {
    id: 'course.discussion.topics.CommentIndex.comments',
    defaultMessage: 'Comments',
  },
  myStudentsPending: {
    id: 'course.discussion.topics.CommentIndex.myStudentsPending',
    defaultMessage: 'My Students Pending',
  },
  pending: {
    id: 'course.discussion.topics.CommentIndex.pending',
    defaultMessage: 'Pending',
  },
  myStudents: {
    id: 'course.discussion.topics.CommentIndex.myStudents',
    defaultMessage: 'My Students',
  },
  unread: {
    id: 'course.discussion.topics.CommentIndex.unread',
    defaultMessage: 'Unread',
  },
  all: {
    id: 'course.discussion.topics.CommentIndex.all',
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
  const dispatch = useAppDispatch();
  const [tabTypesToRender, setTabTypesToRender] = useState(
    [] as CommentTabData[],
  );
  const permissions = useAppSelector(getPermissions);
  const tabs = useAppSelector(getTabInfo);

  useEffect(() => {
    setTabTypesToRender(getTabTypesToRender(permissions, tabs));
  }, [permissions, tabs]);

  return (
    <Box className="max-w-full">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          onChange={(_, value): void => {
            dispatch(actions.changeTabValue(value));
          }}
          scrollButtons="auto"
          sx={tabsStyle}
          TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
          value={tabValue}
          variant="scrollable"
        >
          {tabTypesToRender.length > 0 &&
            tabTypesToRender.map((tabData: CommentTabData) => (
              <Tab
                key={tabData.type}
                icon={
                  <CustomBadge badgeContent={tabData.count} color="primary" />
                }
                iconPosition="end"
                id={`${tabData.type}_tab`}
                label={tabTranslation(intl, tabData.type)}
                style={{
                  minHeight: 48,
                  paddingRight:
                    tabData.count === 0 || tabData.count === undefined ? 8 : 26,
                  textDecoration: 'none',
                }}
                value={tabData.type}
              />
            ))}
        </Tabs>
      </Box>
    </Box>
  );
};

const CommentIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useAppDispatch();

  const settings = useAppSelector(getSettings);
  const tabValue = useAppSelector(getTabValue);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchTabData())
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchCommentsFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  return (
    <Page
      title={settings.title || intl.formatMessage(translations.comments)}
      unpadded
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <CommentTabs intl={intl} tabValue={tabValue} />

          <Page.PaddedSection>
            <TopicList key={tabValue} settings={settings} tabValue={tabValue} />
          </Page.PaddedSection>
        </>
      )}
    </Page>
  );
};

export default injectIntl(CommentIndex);
