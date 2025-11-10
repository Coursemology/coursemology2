import { FC, memo, useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Avatar, AvatarGroup, Box, Tooltip } from '@mui/material';
import { TableColumns } from 'types/components/DataTable';
import {
  GroupLeaderboardAchievement,
  GroupLeaderboardPoints,
  LeaderboardAchievement,
  LeaderboardPoints,
} from 'types/course/leaderboard';

import { getAchievementBadgeUrl } from 'course/helper/achievements';
import DataTable from 'lib/components/core/layouts/DataTable';
import Link from 'lib/components/core/Link';
import { getAchievementURL, getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import useMedia from 'lib/hooks/useMedia';
import useTranslation from 'lib/hooks/useTranslation';

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
    id: 'course.leaderboard.LeaderboardTable.titlePoints',
    defaultMessage: 'By Experience Points',
  },
  titleAchievements: {
    id: 'course.leaderboard.LeaderboardTable.titleAchievements',
    defaultMessage: 'By Achievements',
  },
  average: {
    id: 'course.leaderboard.LeaderboardTable.average',
    defaultMessage: 'Average',
  },
  experience: {
    id: 'course.leaderboard.LeaderboardTable.experience',
    defaultMessage: 'Experience',
  },
  achievements: {
    id: 'course.leaderboard.LeaderboardTable.achievements',
    defaultMessage: 'Achievements',
  },
  rank: {
    id: 'course.leaderboard.LeaderboardTable.rank',
    defaultMessage: 'Rank',
  },
  name: {
    id: 'course.leaderboard.LeaderboardTable.name',
    defaultMessage: 'Name',
  },
  level: {
    id: 'course.leaderboard.LeaderboardTable.level',
    defaultMessage: 'Level',
  },
  averageExperience: {
    id: 'course.leaderboard.LeaderboardTable.averageExperience',
    defaultMessage: 'Average Experience',
  },
  averageAchievements: {
    id: 'course.leaderboard.LeaderboardTable.averageAchievements',
    defaultMessage: 'Average Achievements',
  },
  members: {
    id: 'course.leaderboard.LeaderboardTable.members',
    defaultMessage: 'Members',
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
  const { t } = useTranslation();
  const tabletView = useMedia.MinWidth('sm');
  const phoneView = useMedia.MinWidth('xs');
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
      label: t(translations.rank),
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
      label: t(translations.name),
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
            className="course_user"
            id={`course_user_${individualData[dataIndex].id}`}
            sx={styles.avatar}
          >
            <Avatar
              alt={individualData[dataIndex].name}
              component={Link}
              marginRight={1}
              src={individualData[dataIndex].imageUrl}
              to={getCourseUserURL(getCourseId(), individualData[dataIndex].id)}
              underline="none"
            />
            <Link
              to={getCourseUserURL(getCourseId(), individualData[dataIndex].id)}
              underline="hover"
            >
              {individualData[dataIndex].name}
            </Link>
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
        label: t(translations.level),
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
        label: t(translations.experience),
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
      label: t(translations.achievements),
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
            max={maxAvatars}
            sx={styles.avatarGroup}
            total={achievementData[dataIndex].achievementCount}
          >
            {achievementData[dataIndex].achievements.map((achievement) => {
              return (
                <Tooltip key={achievement.id} title={achievement.title}>
                  <Avatar
                    alt={achievement.badge.name}
                    className="achievement"
                    component={Link}
                    id={`achievement_${achievement.id}`}
                    src={getAchievementBadgeUrl(achievement.badge.url, true)}
                    to={getAchievementURL(getCourseId(), achievement.id)}
                    underline="none"
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
        label: t(translations.name),
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
        label: t(translations.members),
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
              max={maxAvatars}
              sx={styles.avatarGroup}
              total={groupData[dataIndex].group.length}
            >
              {groupData[dataIndex].group.map((user) => (
                <Tooltip key={user.id} title={user.name}>
                  <Avatar
                    alt={user.name}
                    component={Link}
                    src={user.imageUrl}
                    to={getCourseUserURL(getCourseId(), user.id)}
                    underline="none"
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
      label: t(translations.averageExperience),
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
        customBodyRenderLite: (_dataIndex) =>
          groupPointData[_dataIndex].averageExperiencePoints.toFixed(2),
      },
    });
  };

  const addAverageAchievements = (): void => {
    const groupAchievementData = data as GroupLeaderboardAchievement[];
    columns.push({
      name: 'achievements',
      label: t(translations.averageAchievements),
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
        customBodyRenderLite: (_dataIndex) =>
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
      columns={columns}
      data={data}
      options={options}
      title={title}
      titleAlignCenter
      titleGrid
      withMargin
    />
  );
};

export default memo(
  LeaderboardTable,
  (prevProps, nextProps) => prevProps.data.length === nextProps.data.length,
);
