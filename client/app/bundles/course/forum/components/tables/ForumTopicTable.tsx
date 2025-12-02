import { FC, memo } from 'react';
import { defineMessages } from 'react-intl';
import {
  Campaign,
  CheckCircle,
  Help,
  Lock,
  StickyNote2,
  VisibilityOff,
} from '@mui/icons-material';
import { Icon } from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { ForumEntity, ForumTopicEntity } from 'types/course/forums';

import DataTable from 'lib/components/core/layouts/DataTable';
import Link from 'lib/components/core/Link';
import Note from 'lib/components/core/Note';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import forumTranslations from '../../translations';
import ForumTopicManagementButtons from '../buttons/ForumTopicManagementButtons';
import SubscribeButton from '../buttons/SubscribeButton';
import PostCreatorObject from '../misc/PostCreatorObject';

interface Props {
  forum?: ForumEntity;
  forumTopics: ForumTopicEntity[];
}

const translations = defineMessages({
  noTopic: {
    id: 'course.forum.ForumTopicTable.noTopic',
    defaultMessage: 'No Topic',
  },
  hidden: {
    id: 'course.forum.ForumTopicTable.hidden',
    defaultMessage: 'This topic is hidden for students.',
  },
  locked: {
    id: 'course.forum.ForumTopicTable.locked',
    defaultMessage: 'This topic is closed; it no longer accepts new replies.',
  },
  resolved: {
    id: 'course.forum.ForumTopicTable.resolved',
    defaultMessage: 'Question (Resolved)',
  },
  unresolved: {
    id: 'course.forum.ForumTopicTable.unresolved',
    defaultMessage: 'Question (Unresolved)',
  },
  topics: {
    id: 'course.forum.ForumTopicTable.topics',
    defaultMessage: 'Topics',
  },
  votes: {
    id: 'course.forum.ForumTopicTable.votes',
    defaultMessage: 'Votes',
  },
  posts: {
    id: 'course.forum.ForumTopicTable.posts',
    defaultMessage: 'Posts',
  },
  views: {
    id: 'course.forum.ForumTopicTable.views',
    defaultMessage: 'Views',
  },
  lastPostedBy: {
    id: 'course.forum.ForumTopicTable.lastPostedBy',
    defaultMessage: 'Last Posted By',
  },
  startedBy: {
    id: 'course.forum.ForumTopicTable.startedBy',
    defaultMessage: 'Started By',
  },
  isSubscribed: {
    id: 'course.forum.ForumTopicTable.isSubscribed',
    defaultMessage: 'Subscribed?',
  },
});

const TopicTypeIcon: FC<{ topic: ForumTopicEntity }> = (props) => {
  const { topic } = props;
  const { t } = useTranslation();
  let icon = <Icon />;
  switch (topic.topicType) {
    case 'question':
      if (topic.isResolved) {
        icon = (
          <CheckCircle
            className="text-green-700"
            fontSize="small"
            titleAccess={t(translations.resolved)}
          />
        );
      } else {
        icon = (
          <Help
            className="text-yellow-700"
            fontSize="small"
            titleAccess={t(translations.unresolved)}
          />
        );
      }
      break;
    case 'sticky':
      icon = (
        <StickyNote2
          fontSize="small"
          titleAccess={t(forumTranslations.sticky)}
        />
      );
      break;
    case 'announcement':
      icon = (
        <Campaign
          fontSize="small"
          titleAccess={t(forumTranslations.announcement)}
        />
      );
      break;
    default:
      return null;
  }
  return icon;
};

const ForumTopicTable: FC<Props> = (props) => {
  const { forum, forumTopics } = props;
  const { t } = useTranslation();

  if (!forum || forumTopics.length === 0) {
    return <Note message={t(translations.noTopic)} />;
  }

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
    search: false,
    selectableRows: 'none',
    viewColumns: false,
    rowHover: false,
    setRowProps: (_row, dataIndex, _rowIndex) => {
      const topic = forumTopics[dataIndex];
      return {
        className: `topic_${topic.id} relative hover:bg-neutral-100`,
      };
    },
    sortOrder: {
      name: 'latestPost',
      direction: 'desc',
    },
  };

  const columns: TableColumns[] = [
    {
      name: 'title',
      label: t(translations.topics),
      options: {
        filter: false,
        sort: true,
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element | null => {
          const topic = forumTopics[dataIndex];
          const firstPostCreator = topic.firstPostCreator;
          const postCreatorObject =
            firstPostCreator &&
            PostCreatorObject({
              creator: firstPostCreator.creator,
              isAnonymous: firstPostCreator.isAnonymous,
              canViewAnonymous: firstPostCreator.permissions.canViewAnonymous,
            });
          return (
            <>
              <div className="flex flex-col items-start justify-between xl:flex-row xl:items-center">
                <label
                  className="m-0 flex flex-row font-normal"
                  title={topic.title}
                >
                  <Link
                    key={topic.id}
                    // TODO: Change to lg:line-clamp-1 once the current sidebar is gone
                    className={`line-clamp-2 xl:line-clamp-1 ${
                      topic.isUnread ? 'font-bold text-black' : 't4ext-gray-600'
                    }`}
                    to={topic.topicUrl}
                  >
                    {topic.title}
                  </Link>
                </label>
                <div className="flex items-center space-x-2 max-xl:mt-2 xl:ml-2">
                  {topic.isHidden && (
                    <VisibilityOff
                      fontSize="small"
                      titleAccess={t(translations.hidden)}
                    />
                  )}
                  {topic.isLocked && (
                    <Lock
                      fontSize="small"
                      titleAccess={t(translations.locked)}
                    />
                  )}
                  <TopicTypeIcon topic={topic} />
                </div>
              </div>
              {postCreatorObject && (
                <div>
                  {t(translations.startedBy)}{' '}
                  <Link opensInNewTab to={postCreatorObject.userUrl}>
                    {postCreatorObject.name}
                  </Link>
                  {postCreatorObject.visibilityIcon}
                </div>
              )}
            </>
          );
        },
      },
    },
    {
      name: 'latestPostCreator',
      label: t(translations.lastPostedBy),
      options: {
        filter: false,
        sort: true,
        setCellHeaderProps: () => ({
          className: '!hidden sm:!table-cell whitespace-nowrap',
        }),
        setCellProps: () => ({
          className: '!hidden sm:!table-cell',
        }),
        sortCompare: (order: string) => {
          return (value1, value2) => {
            const latestPost1 =
              value1.data as ForumTopicEntity['latestPostCreator'];
            const latestPost2 =
              value2.data as ForumTopicEntity['latestPostCreator'];
            const date1 = new Date(latestPost1?.createdAt ?? 0);
            const date2 = new Date(latestPost2?.createdAt ?? 0);
            return (
              (date1.getTime() - date2.getTime()) * (order === 'asc' ? 1 : -1)
            );
          };
        },
        customBodyRenderLite: (dataIndex): JSX.Element | null => {
          const latestPostCreator = forumTopics[dataIndex].latestPostCreator;
          if (!latestPostCreator) return null;
          const postCreatorObject = PostCreatorObject({
            creator: latestPostCreator.creator,
            isAnonymous: latestPostCreator.isAnonymous,
            canViewAnonymous: latestPostCreator.permissions.canViewAnonymous,
          });
          return (
            <>
              <Link opensInNewTab to={postCreatorObject.userUrl}>
                {postCreatorObject.name}
              </Link>

              {postCreatorObject.visibilityIcon}
              <div className="whitespace-nowrap">
                {formatLongDateTime(latestPostCreator.createdAt)}
              </div>
            </>
          );
        },
      },
    },
    {
      name: 'voteCount',
      label: t(translations.votes),
      options: {
        filter: false,
        sort: true,
        hideInSmallScreen: true,
      },
    },
    {
      name: 'postCount',
      label: t(translations.posts),
      options: {
        filter: false,
        sort: true,
        hideInSmallScreen: true,
      },
    },
    {
      name: 'viewCount',
      label: t(translations.views),
      options: {
        filter: false,
        sort: true,
        hideInSmallScreen: true,
      },
    },
    {
      name: 'subscribed',
      label: t(translations.isSubscribed),
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const forumTopic = forumTopics[dataIndex];
          return (
            <SubscribeButton
              emailSubscription={forumTopic.emailSubscription}
              entityId={forumTopic.id}
              entityTitle={forumTopic.title}
              entityType="topic"
              entityUrl={forumTopic.topicUrl}
              type="checkbox"
            />
          );
        },
      },
    },
    {
      name: 'id',
      label: ' ',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const topic = forumTopics[dataIndex];
          return (
            <ForumTopicManagementButtons
              pageType="TopicIndex"
              showOnHover={
                topic.permissions.canSetHiddenTopic ||
                topic.permissions.canSetLockedTopic
              }
              topic={topic}
            />
          );
        },
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={forumTopics}
      options={options}
      withMargin
    />
  );
};

export default memo(ForumTopicTable, (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
