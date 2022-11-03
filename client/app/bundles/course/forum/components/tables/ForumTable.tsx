import { FC, memo } from 'react';
import { defineMessages } from 'react-intl';
import equal from 'fast-deep-equal';
import { Link } from 'react-router-dom';
import DataTable from 'lib/components/core/layouts/DataTable';
import CustomBadge from 'lib/components/extensions/CustomBadge';
import useTranslation from 'lib/hooks/useTranslation';
import { ForumEntity } from 'types/course/forums';
import Note from 'lib/components/core/Note';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { Icon, Typography } from '@mui/material';
import ForumManagementButtons from '../buttons/ForumManagementButtons';

interface Props {
  forums: ForumEntity[];
}

const translations = defineMessages({
  noForum: {
    id: 'course.forum.components.tables.forumTable.noForum',
    defaultMessage: 'No Forum',
  },
  hasUnresolved: {
    id: 'course.forum.components.tables.forumTable.hasUnresolved',
    defaultMessage: 'Has unresolved question(s)',
  },
  forum: {
    id: 'course.forum.containers.tables.forumTable.forum',
    defaultMessage: 'Forum',
  },
  topics: {
    id: 'course.forum.containers.tables.forumTable.topics',
    defaultMessage: 'Topics',
  },
  votes: {
    id: 'course.forum.containers.tables.forumTable.votes',
    defaultMessage: 'Votes',
  },
  posts: {
    id: 'course.forum.containers.tables.forumTable.posts',
    defaultMessage: 'Posts',
  },
  views: {
    id: 'course.forum.containers.tables.forumTable.views',
    defaultMessage: 'Views',
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
              <div>
                <Link className="font-bold" key={forum.id} to={forum.forumUrl}>
                  <Typography variant="h6" className="space-x-2">
                    {forum.isUnresolved && (
                      <Icon
                        className="fa fa-question-circle text-3xl"
                        title={t(translations.hasUnresolved)}
                      />
                    )}
                    {forum.name}{' '}
                    <CustomBadge
                      badgeContent={forum.topicUnreadCount}
                      color="info"
                    />
                  </Typography>
                </Link>
              </div>
              <Typography
                variant="body2"
                className="whitespace-normal"
                dangerouslySetInnerHTML={{
                  __html: forum.description,
                }}
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
    <DataTable data={forums} columns={columns} options={options} withMargin />
  );
};

export default memo(ForumTable, (prevProps, nextProps) => {
  return equal(prevProps.forums, nextProps.forums);
});
