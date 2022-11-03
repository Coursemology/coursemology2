import { FC, memo } from 'react';
import { defineMessages } from 'react-intl';
import equal from 'fast-deep-equal';
import { Link } from 'react-router-dom';
import DataTable from 'lib/components/core/layouts/DataTable';
import { ForumEntity, ForumTopicEntity } from 'types/course/forums';
import Note from 'lib/components/core/Note';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import useTranslation from 'lib/hooks/useTranslation';
import { Icon, Typography } from '@mui/material';
import { formatLongDateTime } from 'lib/moment';
import ForumTopicManagementButtons from '../buttons/ForumTopicManagementButtons';

interface Props {
  forum?: ForumEntity;
  forumTopics: ForumTopicEntity[];
}

const translations = defineMessages({
  noTopic: {
    id: 'course.forum.components.tables.forumTopicTable.noTopic',
    defaultMessage: 'No Topic',
  },
  hidden: {
    id: 'course.forum.containers.tables.forumTopicTable.hidden',
    defaultMessage: 'This topic is hidden for students.',
  },
  locked: {
    id: 'course.forum.containers.tables.forumTopicTable.locked',
    defaultMessage: 'This topic is closed; it no longer accepts new replies.',
  },
  question: {
    id: 'course.forum.containers.tables.forumTopicTable.question',
    defaultMessage: 'Question',
  },
  resolved: {
    id: 'course.forum.containers.tables.forumTopicTable.resolved',
    defaultMessage: 'Question (Resolved)',
  },
  unresolved: {
    id: 'course.forum.containers.tables.forumTopicTable.unresolved',
    defaultMessage: 'Question (Unresolved)',
  },
  sticky: {
    id: 'course.forum.containers.tables.forumTopicTable.sticky',
    defaultMessage: 'Sticky',
  },
  announcement: {
    id: 'course.forum.containers.tables.forumTopicTable.announcement',
    defaultMessage: 'Announcement',
  },
  topics: {
    id: 'course.forum.containers.tables.forumTopicTable.topics',
    defaultMessage: 'Topics',
  },
  votes: {
    id: 'course.forum.containers.tables.forumTopicTable.votes',
    defaultMessage: 'Votes',
  },
  posts: {
    id: 'course.forum.containers.tables.forumTopicTable.posts',
    defaultMessage: 'Posts',
  },
  views: {
    id: 'course.forum.containers.tables.forumTopicTable.views',
    defaultMessage: 'Views',
  },
  lastPostedBy: {
    id: 'course.forum.containers.tables.forumTopicTable.lastPostedBy',
    defaultMessage: 'Last Posted By',
  },
  startedBy: {
    id: 'course.forum.containers.tables.forumTopicTable.startedBy',
    defaultMessage: 'Started By',
  },
});

const TopicTypeIcon: FC<{ topic: ForumTopicEntity }> = (props) => {
  const { topic } = props;
  const { t } = useTranslation();
  let className = '';
  let tooltip = '';
  switch (topic.topicType) {
    case 'question':
      if (topic.isResolved) {
        className =
          'fa fa-check-circle text-3xl overflow-visible  text-green-700 top-0';
        tooltip = t(translations.resolved);
      } else {
        className =
          'fa fa-question-circle overflow-visible  text-3xl text-yellow-700';
        tooltip = t(translations.unresolved);
      }
      break;
    case 'sticky':
      className = 'fa fa-thumb-tack overflow-visible  text-3xl';
      tooltip = t(translations.sticky);
      break;
    case 'announcement':
      className = 'fa fa-bullhorn overflow-visible  text-3xl';
      tooltip = t(translations.announcement);
      break;
    default:
      return <></>;
  }
  return <Icon className={className} title={tooltip} />;
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const topic = forumTopics[dataIndex];
          return (
            <>
              <div>
                <Link key={topic.id} to={topic.topicUrl}>
                  <Typography
                    className={
                      topic.isUnread
                        ? 'space-x-2 font-bold text-black'
                        : 'space-x-2 text-gray-600'
                    }
                    variant="h6"
                  >
                    {topic.isHidden && (
                      <Icon
                        className="fa fa-eye-slash overflow-visible text-3xl"
                        title={t(translations.hidden)}
                      />
                    )}
                    {topic.isLocked && (
                      <Icon
                        className="fa fa-lock overflow-visible text-3xl"
                        title={t(translations.locked)}
                      />
                    )}
                    <TopicTypeIcon topic={topic} />
                    {topic.title}
                  </Typography>
                </Link>
              </div>
              <div>
                {t(translations.startedBy)}{' '}
                <a href={topic.creator.userUrl}>{topic.creator.name}</a>
              </div>
            </>
          );
        },
      },
    },
    {
      name: 'latestPost',
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
            const latestPost1 = value1.data as ForumTopicEntity['latestPost'];
            const latestPost2 = value2.data as ForumTopicEntity['latestPost'];
            const date1 = new Date(latestPost1.createdAt);
            const date2 = new Date(latestPost2.createdAt);
            return (
              (date1.getTime() - date2.getTime()) * (order === 'asc' ? 1 : -1)
            );
          };
        },
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const latestPost = forumTopics[dataIndex].latestPost;
          if (!latestPost) return <></>;
          return (
            <>
              <a href={latestPost.creator.userUrl}>{latestPost.creator.name}</a>
              <div className="whitespace-nowrap">
                {formatLongDateTime(latestPost.createdAt)}
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
              topic={topic}
              showOnHover={
                topic.permissions.canSetHiddenTopic ||
                topic.permissions.canSetLockedTopic
              }
            />
          );
        },
      },
    },
  ];

  return (
    <DataTable
      data={forumTopics}
      columns={columns}
      options={options}
      withMargin
    />
  );
};

export default memo(ForumTopicTable, (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
