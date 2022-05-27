import { FC } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Icon, Switch } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import {
  AchievementMiniEntity,
  AchievementPermissions,
} from 'types/course/achievements';
import Note from 'lib/components/Note';
import { getCourseId } from 'lib/helpers/url-helpers';
import AchievementManagementButtons from '../buttons/AchievementManagementButtons';

interface Props {
  achievements: AchievementMiniEntity[];
  permissions: AchievementPermissions | null;
  onTogglePublished: (achievementId: number, data: boolean) => void;
}

const translations = defineMessages({
  noCategory: {
    id: 'course.achievement.containers.tables.AchievementTable.noCategory',
    defaultMessage: "You don't have an achievement created! Create one now!",
  },
  achievementDraft: {
    id: 'course.achievement.containers.tables.AchievementTable.AchievementDraft',
    defaultMessage: 'Draft',
  },
});

const styles = {
  badge: {
    maxHeight: 75,
    maxWidth: 75,
  },
  toggle: {},
};

const AchievementTable: FC<Props> = (props) => {
  const { achievements, permissions, onTogglePublished } = props;

  if (achievements && achievements.length === 0) {
    return <Note message={<FormattedMessage {...translations.noCategory} />} />;
  }

  const options = {
    download: false,
    filter: false,
    // jumpToPage: true,
    pagination: false,
    print: false,
    search: false,
    selectableRows: 'none',
    setRowProps: (
      _row: Array<any>,
      dataIndex: number,
      _rowIndex: number,
    ): Record<string, unknown> => {
      const achievementStatus = achievements[dataIndex].achievementStatus;
      let backgroundColor: any = null;
      if (achievementStatus === 'granted') {
        backgroundColor = '#dff0d8';
      } else if (
        achievementStatus === 'locked' ||
        !achievements[dataIndex].published
      ) {
        backgroundColor = '#eeeeee';
      }
      return {
        // achievementid is added to the props of every row to allow
        // jquery-ui sortable to identify and extract the achievement id for each row.
        achievementid: `achievement_${achievements[dataIndex].id}`,
        style: { background: backgroundColor },
      };
    },
    // By default, sort displayed achievements by weight
    sortOrder: {
      name: 'weight',
      direction: 'asc',
    },
    viewColumns: false,
  };

  const columns: any = [
    {
      name: 'id',
      label: ' ',
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (_dataIndex: number) => (
          <Icon className="fa fa-reorder hidden" />
        ),
      },
    },
    {
      name: 'weight',
      label: 'weight',
      options: {
        // To enable default weight sorting but column is hidden
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'badge',
      label: 'Badge',
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const badge = achievements[dataIndex].badge;
          return (
            <img
              key={achievements[dataIndex].id}
              style={styles.badge}
              src={badge.url}
              alt={badge.name}
            />
          );
        },
      },
    },
    {
      name: 'title',
      label: 'Title',
      options: {
        filter: false,
        sort: false,
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const achievement = achievements[dataIndex];

          return (
            <Link
              key={achievement.id}
              to={`/courses/${getCourseId()}/achievements/${achievement.id}`}
            >
              {achievement.title}
            </Link>
          );
        },
      },
    },
    {
      name: 'description',
      label: 'Description',
      options: {
        filter: false,
        sort: false,
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const achievement = achievements[dataIndex];
          return (
            <p
              key={achievements[dataIndex].id}
              style={{ whiteSpace: 'normal' }}
              dangerouslySetInnerHTML={{ __html: achievement.description }}
            />
          );
        },
      },
    },
    {
      name: 'conditions',
      label: 'Requirements',
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const conditions = achievements[dataIndex].conditions;
          return (
            <div key={achievements[dataIndex].id}>
              {conditions.map((condition) => (
                <li key={condition.id}>{condition.title}</li>
              ))}
            </div>
          );
        },
      },
    },
  ];

  if (permissions?.canManage) {
    columns.push({
      name: 'published',
      label: 'Published',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const achievementId = achievements[dataIndex].id;
          const isPublished = achievements[dataIndex].published;
          return (
            <Switch
              key={achievementId}
              checked={isPublished}
              color="primary"
              onChange={(_, checked): void =>
                onTogglePublished(achievementId, checked)
              }
            />
          );
        },
      },
    });
    columns.push({
      name: 'id',
      label: 'Actions',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        customBodyRenderLite: (dataIndex: number) => {
          const achievement = achievements[dataIndex];
          return (
            <AchievementManagementButtons
              achievement={achievement}
              navigateToIndex={false}
            />
          );
        },
      },
    });
  }

  return <DataTable data={achievements} columns={columns} options={options} />;
};

export default AchievementTable;
