import { FC, memo } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { DragIndicator } from '@mui/icons-material';
import { Switch, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import {
  AchievementMiniEntity,
  AchievementPermissions,
} from 'types/course/achievements';

import { getAchievementBadgeUrl } from 'course/helper/achievements';
import DataTable from 'lib/components/core/layouts/DataTable';
import Link from 'lib/components/core/Link';
import Note from 'lib/components/core/Note';
import { getAchievementURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

import AchievementManagementButtons from '../buttons/AchievementManagementButtons';

interface Props {
  achievements: AchievementMiniEntity[];
  permissions: AchievementPermissions | null;
  onTogglePublished: (achievementId: number, data: boolean) => void;
  isReordering: boolean;
}

const translations = defineMessages({
  noAchievement: {
    id: 'course.achievement.AchievementTable.noAchievement',
    defaultMessage: 'No achievement',
  },
  badge: {
    id: 'course.achievement.AchievementTable.badge',
    defaultMessage: 'Badge',
  },
  title: {
    id: 'course.achievement.AchievementTable.title',
    defaultMessage: 'Title',
  },
  description: {
    id: 'course.achievement.AchievementTable.description',
    defaultMessage: 'Description',
  },
  requirements: {
    id: 'course.achievement.AchievementTable.requirements',
    defaultMessage: 'Requirements',
  },
  published: {
    id: 'course.achievement.AchievementTable.published',
    defaultMessage: 'Published',
  },
  actions: {
    id: 'course.achievement.AchievementTable.actions',
    defaultMessage: 'Actions',
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
  const { achievements, permissions, onTogglePublished, isReordering } = props;
  const { t } = useTranslation();

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
        customBodyRenderLite: (_) => (isReordering ? <DragIndicator /> : null),
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
      label: t(translations.badge),
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const badge = achievements[dataIndex].badge;
          const badgeUrl = getAchievementBadgeUrl(
            badge.url,
            achievements[dataIndex].permissions.canDisplayBadge,
          );

          return (
            <img
              key={achievements[dataIndex].id}
              alt={badge.name}
              src={badgeUrl}
              style={styles.badge}
            />
          );
        },
      },
    },
    {
      name: 'title',
      label: t(translations.title),
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
      label: t(translations.description),
      options: {
        filter: false,
        sort: false,
        alignCenter: false,
        hideInSmallScreen: true,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const achievement = achievements[dataIndex];
          return (
            <Typography
              key={achievements[dataIndex].id}
              dangerouslySetInnerHTML={{ __html: achievement.description }}
              style={{ whiteSpace: 'normal' }}
              variant="body2"
            />
          );
        },
      },
    },
    {
      name: 'conditions',
      label: t(translations.requirements),
      options: {
        filter: false,
        sort: false,
        hideInSmallScreen: true,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const conditions = achievements[dataIndex].conditions;
          return (
            <div key={achievements[dataIndex].id}>
              {conditions.map((condition) => (
                <Typography key={condition.id} component="li" variant="body2">
                  {condition.description}
                </Typography>
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
      label: t(translations.published),
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        hideInSmallScreen: true,
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
      label: t(translations.actions),
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

  return (
    <DataTable
      columns={columns}
      data={achievements}
      options={options}
      withMargin
    />
  );
};

export default memo(AchievementTable, equal);
