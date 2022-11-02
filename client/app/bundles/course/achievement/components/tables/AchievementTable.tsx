import { FC, memo } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Icon, Switch } from '@mui/material';
import equal from 'fast-deep-equal';
import DataTable from 'lib/components/core/layouts/DataTable';
import {
  AchievementMiniEntity,
  AchievementPermissions,
} from 'types/course/achievements';
import Note from 'lib/components/core/Note';
import { getCourseId } from 'lib/helpers/url-helpers';
import { getAchievementURL } from 'lib/helpers/url-builders';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import AchievementManagementButtons from '../buttons/AchievementManagementButtons';

interface Props {
  achievements: AchievementMiniEntity[];
  permissions: AchievementPermissions | null;
  onTogglePublished: (achievementId: number, data: boolean) => void;
}

const translations = defineMessages({
  noAchievement: {
    id: 'course.achievement.containers.tables.AchievementTable.noAchievement',
    defaultMessage: 'No achievement',
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
    return (
      <Note message={<FormattedMessage {...translations.noAchievement} />} />
    );
  }

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
    search: false,
    selectableRows: 'none',
    setRowProps: (_row, dataIndex, _rowIndex) => {
      const achievementStatus = achievements[dataIndex].achievementStatus;
      let backgroundColor: unknown = null;
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

  const columns: TableColumns[] = [
    {
      name: 'id',
      label: ' ',
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (_dataIndex) => (
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const achievement = achievements[dataIndex];

          return (
            <Link
              key={achievement.id}
              to={getAchievementURL(getCourseId(), achievement.id)}
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const conditions = achievements[dataIndex].conditions;
          return (
            <div key={achievements[dataIndex].id}>
              {conditions.map((condition) => (
                <li key={condition.id}>{condition.description}</li>
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
        customBodyRenderLite: (dataIndex) => {
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

export default memo(AchievementTable, (prevProps, nextProps) => {
  return equal(prevProps.achievements, nextProps.achievements);
});
