import { defineMessages, FormattedMessage } from 'react-intl';
import { Avatar, AvatarGroup, Box, Link, Tooltip } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import { FC, memo } from 'react';
import {
  GroupLeaderboardAchievement,
  GroupLeaderboardPoints,
  LeaderboardAchievement,
  LeaderboardPoints,
} from 'types/course/leaderboard';
import { TableColumns } from 'types/components/DataTable';
import { getAchievementURL, getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { LeaderboardTableType } from '../../types';

interface Props {
  data:
    | LeaderboardPoints[]
    | LeaderboardAchievement[]
    | GroupLeaderboardPoints[]
    | GroupLeaderboardAchievement[];
  id: LeaderboardTableType;
}

const translations = defineMessages({
  titlePoints: {
    id: 'course.leaderboard.components.LeaderboardTable.titlePoints',
    defaultMessage: 'By Experience Points',
  },
  titleAchievements: {
    id: 'course.leaderboard.components.LeaderboardTable.titleAcheivements',
    defaultMessage: 'By Achievements',
  },
});

const styles = {
  title: {
    flexDirection: 'column',
    textAlign: 'right',
    fontSize: 20,
  },
  link: {
    textDecoration: 'none',
  },
  avatarGroup: {
    justifyContent: 'left',
    '& .MuiAvatar-root': {
      width: 40,
      height: 40,
      marginLeft: '0.1px',
    },
  },
  avatar: {
    maxWidth: '250px',
    wordWrap: 'break-word',
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: '150px',
  },
};

const LeaderboardTable: FC<Props> = (props: Props) => {
  const { data, id: tableType } = props;

  const columns: TableColumns[] = [
    {
      name: 'id',
      label: 'Rank',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        justifyCenter: true,
        customBodyRenderLite: (_dataIndex: number) => _dataIndex + 1,
      },
    },
  ];

  const addIndividual = (): void => {
    const individualData = data as
      | LeaderboardPoints[]
      | LeaderboardAchievement[];
    columns.push({
      name: 'name',
      label: 'Name',
      options: {
        filter: false,
        sort: false,
        alignLeft: true,
        justifyCenter: true,
        customBodyRenderLite: (_dataIndex: number) => (
          <Box
            sx={styles.avatar}
            className="course_user"
            id={`course_user_${individualData[_dataIndex].id}`}
          >
            <Avatar
              src={individualData[_dataIndex].imageUrl}
              alt={individualData[_dataIndex].name}
              component={Link}
              href={getCourseUserURL(
                getCourseId(),
                individualData[_dataIndex].id,
              )}
              marginRight={1}
            />
            <a
              href={getCourseUserURL(
                getCourseId(),
                individualData[_dataIndex].id,
              )}
            >
              {individualData[_dataIndex].name}
            </a>
          </Box>
        ),
      },
    });
  };

  const addPoints = (): void => {
    const pointData = data as LeaderboardPoints[];
    columns.push(
      {
        name: 'level',
        label: 'Level',
        options: {
          filter: false,
          sort: false,
          alignCenter: true,
          justifyCenter: true,
          customBodyRenderLite: (_dataIndex: number) =>
            pointData[_dataIndex].level,
        },
      },
      {
        name: 'experience',
        label: 'Experience',
        options: {
          filter: false,
          sort: false,
          alignCenter: true,
          justifyCenter: true,
          customBodyRenderLite: (_dataIndex: number) =>
            pointData[_dataIndex].experience,
        },
      },
    );
  };

  const addAchievements = (): void => {
    const achievementData = data as LeaderboardAchievement[];
    columns.push({
      name: 'achievements',
      label: 'Achievements',
      options: {
        filter: false,
        sort: false,
        alignLeft: true,
        justifyCenter: true,
        customBodyRenderLite: (_dataIndex: number) => (
          <AvatarGroup
            total={achievementData[_dataIndex].achievementCount}
            max={6}
            sx={styles.avatarGroup}
            componentsProps={{
              additionalAvatar: {
                onClick: (): void => {
                  window.location.href = getCourseUserURL(
                    getCourseId(),
                    achievementData[_dataIndex].id,
                  );
                },
                sx: { cursor: 'pointer' },
              },
            }}
          >
            {achievementData[_dataIndex].achievements.map((achievement) => {
              return (
                <Tooltip title={achievement.title} key={achievement.id}>
                  <Avatar
                    src={achievement.badge.url}
                    alt={achievement.badge.name}
                    component={Link}
                    href={getAchievementURL(getCourseId(), achievement.id)}
                    className="achievement"
                    id={`achievement_${achievement.id}`}
                  />
                </Tooltip>
              );
            })}
          </AvatarGroup>
        ),
      },
    });
  };

  const addGroup = (): void => {
    const groupData = data as
      | GroupLeaderboardPoints[]
      | GroupLeaderboardAchievement[];
    columns.push(
      {
        name: 'name',
        label: 'Name',
        options: {
          filter: false,
          sort: false,
          alignCenter: true,
          justifyCenter: true,
          customBodyRenderLite: (_dataIndex: number) => (
            <Box className="group" id={`group_${groupData[_dataIndex].id}`}>
              {groupData[_dataIndex].name}
            </Box>
          ),
        },
      },
      {
        name: 'members',
        label: 'Members',
        options: {
          filter: false,
          sort: false,
          alignLeft: true,
          justifyCenter: true,
          customBodyRenderLite: (_dataIndex: number) => (
            <AvatarGroup
              total={groupData[_dataIndex].group.length}
              max={6}
              sx={styles.avatarGroup}
            >
              {groupData[_dataIndex].group.map((user) => (
                <Tooltip title={user.name} key={user.id}>
                  <Avatar
                    src={user.imageUrl}
                    alt={user.name}
                    component={Link}
                    href={getCourseUserURL(getCourseId(), user.id)}
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
          ),
        },
      },
    );
  };

  const addAverageExperience = (): void => {
    const groupPointData = data as GroupLeaderboardPoints[];
    columns.push({
      name: 'points',
      label: 'Average Experience',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        justifyCenter: true,
        customBodyRenderLite: (_dataIndex: number) =>
          groupPointData[_dataIndex].averageExperiencePoints.toFixed(2),
      },
    });
  };

  const addAverageAchievements = (): void => {
    const groupAchievementData = data as GroupLeaderboardAchievement[];
    columns.push({
      name: 'achievements',
      label: 'Average Achievements',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        justifyCenter: true,
        customBodyRenderLite: (_dataIndex: number) =>
          groupAchievementData[_dataIndex].averageAchievementCount.toFixed(2),
      },
    });
  };

  const updateColumns = (): void => {
    switch (tableType) {
      case LeaderboardTableType.LeaderboardPoints:
        addIndividual();
        addPoints();
        break;
      case LeaderboardTableType.LeaderboardAchievement:
        addIndividual();
        addAchievements();
        break;
      case LeaderboardTableType.GroupLeaderboardPoints:
        addGroup();
        addAverageExperience();
        break;
      case LeaderboardTableType.GroupLeaderboardAchievement:
        addGroup();
        addAverageAchievements();
        break;
      default:
        break;
    }
  };

  const options = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
    search: false,
    selectableRows: 'none',
    viewColumns: false,
  };

  const title = (
    <Box sx={styles.title}>
      {tableType === LeaderboardTableType.LeaderboardPoints ||
      tableType === LeaderboardTableType.GroupLeaderboardPoints ? (
        <FormattedMessage {...translations.titlePoints} />
      ) : (
        <FormattedMessage {...translations.titleAchievements} />
      )}
    </Box>
  );

  // Update columns based on table type
  updateColumns();
  return (
    <DataTable data={data} options={options} columns={columns} title={title} />
  );
};

export default memo(
  LeaderboardTable,
  (prevProps, nextProps) => prevProps.data.length === nextProps.data.length,
);
