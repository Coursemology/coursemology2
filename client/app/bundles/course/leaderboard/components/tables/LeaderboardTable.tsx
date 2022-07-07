import { defineMessages, FormattedMessage } from 'react-intl';
import {
  Avatar,
  AvatarGroup,
  Box,
  Link,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import DataTable from 'lib/components/DataTable';
import { FC, memo, useEffect, useState } from 'react';
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
  average: {
    id: 'course.leaderboard.components.LeaderboardTable.average',
    defaultMessage: 'Average',
  },
  experience: {
    id: 'course.leaderboard.components.LeaderboardTable.experience',
    defaultMessage: 'Experience',
  },
  achievements: {
    id: 'course.leaderboard.components.LeaderboardTable.achievements',
    defaultMessage: 'Achievements',
  },
});

const styles = {
  title: {
    flexDirection: 'column',
    textAlign: 'center',
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
    display: 'flex',
    alignItems: 'center',
    minWidth: '150px',
  },
};

const LeaderboardTable: FC<Props> = (props: Props) => {
  const { data, id: tableType } = props;
  const tabletView = useMediaQuery('(max-width:600px)');
  const phoneView = useMediaQuery('(max-width:450px)');
  const [maxAvatars, setMaxAvatars] = useState(6);

  useEffect(() => {
    if (phoneView) {
      setMaxAvatars(2);
    } else if (tabletView) {
      setMaxAvatars(4);
    } else {
      setMaxAvatars(6);
    }
  }, [phoneView, tabletView]);

  const columns: TableColumns[] = [
    {
      name: 'id',
      label: 'Rank',
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: { padding: '16px', textAlign: 'center' },
        }),
        setCellProps: () => ({
          style: { textAlign: 'center', maxWidth: '50px' },
        }),
        customBodyRenderLite: (dataIndex) => dataIndex + 1,
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
        setCellProps: () => ({
          style: { width: '100%' },
        }),
        setCellHeaderProps: () => ({
          style: { padding: '0px' },
        }),
        customBodyRenderLite: (dataIndex) => (
          <Box
            sx={styles.avatar}
            className="course_user"
            id={`course_user_${individualData[dataIndex].id}`}
          >
            <Avatar
              src={individualData[dataIndex].imageUrl}
              alt={individualData[dataIndex].name}
              component={Link}
              href={getCourseUserURL(
                getCourseId(),
                individualData[dataIndex].id,
              )}
              marginRight={1}
            />
            <a
              href={getCourseUserURL(
                getCourseId(),
                individualData[dataIndex].id,
              )}
            >
              {individualData[dataIndex].name}
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
          setCellHeaderProps: () => ({
            style: { padding: '0px', textAlign: 'center' },
          }),
          setCellProps: () => ({
            style: { textAlign: 'center' },
          }),
          customBodyRenderLite: (dataIndex) => pointData[dataIndex].level,
        },
      },
      {
        name: 'experience',
        label: 'Experience',
        options: {
          filter: false,
          sort: false,
          setCellHeaderProps: () => ({
            style: { padding: '16px', textAlign: 'center' },
          }),
          setCellProps: () => ({
            style: { textAlign: 'center' },
          }),
          customBodyRenderLite: (dataIndex) => pointData[dataIndex].experience,
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
        setCellHeaderProps: () => ({
          style: { padding: '0px 16px 0px 1px' },
        }),
        setCellProps: () => ({
          style: { padding: '0px 16px 0px 0px' },
        }),
        customBodyRenderLite: (dataIndex) => (
          <AvatarGroup
            total={achievementData[dataIndex].achievementCount}
            max={maxAvatars}
            sx={styles.avatarGroup}
            componentsProps={{
              additionalAvatar: {
                onClick: (): void => {
                  window.location.href = getCourseUserURL(
                    getCourseId(),
                    achievementData[dataIndex].id,
                  );
                },
                sx: { cursor: 'pointer' },
              },
            }}
          >
            {achievementData[dataIndex].achievements.map((achievement) => {
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
          setCellHeaderProps: () => ({
            style: { padding: '0px 16px 0px 1px', minWidth: '80px' },
          }),
          setCellProps: () => ({
            style: { padding: '0px 16px 0px 0px', minWidth: '80px' },
          }),
          customBodyRenderLite: (dataIndex) => (
            <Box className="group" id={`group_${groupData[dataIndex].id}`}>
              {groupData[dataIndex].name}
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
          setCellHeaderProps: () => ({
            style: { padding: '0px 16px 0px 1px', width: '100%' },
          }),
          setCellProps: () => ({
            style: { padding: '0px 16px 0px 0px', width: '100%' },
          }),
          customBodyRenderLite: (dataIndex) => (
            <AvatarGroup
              total={groupData[dataIndex].group.length}
              max={maxAvatars}
              sx={styles.avatarGroup}
            >
              {groupData[dataIndex].group.map((user) => (
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
        customHeadLabelRender: () => (
          <>
            <div>
              <FormattedMessage {...translations.average} />
            </div>
            <div>
              <FormattedMessage {...translations.experience} />
            </div>
          </>
        ),
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
        customHeadLabelRender: () => (
          <>
            <div>
              <FormattedMessage {...translations.average} />
            </div>
            <div>
              <FormattedMessage {...translations.achievements} />
            </div>
          </>
        ),
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
    <DataTable
      data={data}
      options={options}
      columns={columns}
      title={title}
      titleGrid
      titleAlignCenter
      padding="0px"
    />
  );
};

export default memo(
  LeaderboardTable,
  (prevProps, nextProps) => prevProps.data.length === nextProps.data.length,
);
