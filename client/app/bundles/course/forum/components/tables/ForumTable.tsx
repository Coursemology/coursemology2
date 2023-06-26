import { FC, memo } from 'react';
import { defineMessages } from 'react-intl';
import Email from '@mui/icons-material/Email';
import Help from '@mui/icons-material/Help';
import { Tooltip, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { ForumEntity } from 'types/course/forums';

import DataTable from 'lib/components/core/layouts/DataTable';
import Link from 'lib/components/core/Link';
import Note from 'lib/components/core/Note';
import CustomBadge from 'lib/components/extensions/CustomBadge';
import useTranslation from 'lib/hooks/useTranslation';

import ForumManagementButtons from '../buttons/ForumManagementButtons';
import SubscribeButton from '../buttons/SubscribeButton';

interface Props {
  forums: ForumEntity[];
}

const translations = defineMessages({
  noForum: {
    id: 'course.forum.ForumTable.noForum',
    defaultMessage: 'No Forum',
  },
  hasUnresolved: {
    id: 'course.forum.ForumTable.hasUnresolved',
    defaultMessage: 'Has unresolved question(s)',
  },
  forum: {
    id: 'course.forum.ForumTable.forum',
    defaultMessage: 'Forum',
  },
  topics: {
    id: 'course.forum.ForumTable.topics',
    defaultMessage: 'Topics',
  },
  votes: {
    id: 'course.forum.ForumTable.votes',
    defaultMessage: 'Votes',
  },
  posts: {
    id: 'course.forum.ForumTable.posts',
    defaultMessage: 'Posts',
  },
  views: {
    id: 'course.forum.ForumTable.views',
    defaultMessage: 'Views',
  },
  isSubscribed: {
    id: 'course.forum.ForumTable.isSubscribed',
    defaultMessage: 'Subscribed?',
  },
  autoSubscribe: {
    id: 'course.forum.ForumTable.autoSubscribe',
    defaultMessage:
      'Users will be automatically subscribed to a topic in this forum when they create a post in the topic.',
  },
});

const ForumTable: FC<Props> = (props) => {
  const { forums } = props;
  const { t } = useTranslation();
  if (forums && forums.length === 0) {
    return <Note message={t(translations.noForum)} />;
  }

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
    rowHover: false,
    search: false,
    selectableRows: 'none',
    setRowProps: (_row, dataIndex, _rowIndex) => {
      const forum = forums[dataIndex];
      return {
        className: `forum_${forum.id} relative hover:bg-neutral-100`,
      };
    },
    viewColumns: false,
  };

  const columns: TableColumns[] = [
    {
      name: 'name',
      label: t(translations.forum),
      options: {
        filter: false,
        sort: true,
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const forum = forums[dataIndex];

          return (
            <>
              {/* Abstract the following */}
              <div className="flex flex-col items-start justify-between xl:flex-row xl:items-center">
                <label
                  className="m-0 flex flex-row space-x-4 font-normal"
                  title={forum.name}
                >
                  <Link
                    key={forum.id}
                    // TODO: Change to lg:line-clamp-1 once the current sidebar is gone
                    className="line-clamp-2 xl:line-clamp-1"
                    to={forum.forumUrl}
                  >
                    {forum.name}
                  </Link>
                  <CustomBadge
                    badgeContent={forum.topicUnreadCount}
                    color="info"
                  />
                </label>
                <div className="flex items-center space-x-2 max-xl:mt-2 xl:ml-2">
                  {forum.isUnresolved && (
                    <Tooltip
                      disableInteractive
                      title={t(translations.hasUnresolved)}
                    >
                      <Help className="text-3xl text-yellow-500 hover?:text-yellow-600" />
                    </Tooltip>
                  )}
                  {forum.forumTopicsAutoSubscribe && (
                    <Tooltip
                      disableInteractive
                      title={t(translations.autoSubscribe)}
                    >
                      <Email className="text-3xl text-neutral-500 hover?:text-neutral-600" />
                    </Tooltip>
                  )}
                </div>
              </div>
              <Typography
                className="whitespace-normal"
                dangerouslySetInnerHTML={{
                  __html: forum.description,
                }}
                variant="body2"
              />
            </>
          );
        },
      },
    },
    {
      name: 'topicCount',
      label: t(translations.topics),
      options: {
        filter: false,
        sort: true,
        hideInSmallScreen: true,
      },
    },
    {
      name: 'topicPostCount',
      label: t(translations.posts),
      options: {
        filter: false,
        sort: true,
        hideInSmallScreen: true,
      },
    },
    {
      name: 'topicViewCount',
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
          const forum = forums[dataIndex];
          return (
            <SubscribeButton
              emailSubscription={forum.emailSubscription}
              entityId={forum.id}
              entityTitle={forum.name}
              entityType="forum"
              entityUrl={forum.forumUrl}
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
          return (
            <ForumManagementButtons
              forum={forums[dataIndex]}
              showOnHover={
                forums[dataIndex].permissions.canEditForum ||
                forums[dataIndex].permissions.canDeleteForum
              }
            />
          );
        },
      },
    },
  ];

  return (
    <DataTable columns={columns} data={forums} options={options} withMargin />
  );
};

export default memo(ForumTable, (prevProps, nextProps) => {
  return equal(prevProps.forums, nextProps.forums);
});
