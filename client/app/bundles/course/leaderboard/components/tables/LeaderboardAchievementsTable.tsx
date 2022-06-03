import { defineMessages, FormattedMessage } from 'react-intl';
import { AvatarGroup, Avatar, Tooltip, Link, Box } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import { LeaderboardAchievement } from 'types/course/leaderboard';
import { FC, memo } from 'react';

interface Props {
  data: LeaderboardAchievement[];
}

const translations = defineMessages({
  title: {
    id: 'course.leaderboard.containers.tables.LeaderboardAchievementsTable.title',
    defaultMessage: 'By Achievement',
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
      width: 30,
      height: 30,
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

const LeaderboardAchievementsTable: FC<Props> = (props: Props) => {
  const data = props.data;

  const columns: any = [
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
    {
      name: 'name',
      label: 'Name',
      options: {
        filter: false,
        sort: false,
        alignLeft: true,
        justifyCenter: true,
        customBodyRenderLite: (_dataIndex: number) => (
          <Box sx={styles.avatar}>
            <Avatar
              src={data[_dataIndex].userPicture}
              alt={data[_dataIndex].name}
              component={Link}
              href={data[_dataIndex].userLink}
              marginRight={1}
            />
            <a href={data[_dataIndex].userLink}>{data[_dataIndex].name}</a>
          </Box>
        ),
      },
    },
    {
      name: 'achievements',
      label: 'Achievements',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        justifyCenter: true,
        customBodyRenderLite: (_dataIndex: number) => (
          <Link href={data[_dataIndex].userLink} style={styles.link}>
            <AvatarGroup
              total={data[_dataIndex].achievementCount}
              max={6}
              sx={styles.avatarGroup}
            >
              {data[_dataIndex].achievements.map((achievement) => {
                return (
                  <Tooltip title={achievement.name} key={achievement.id}>
                    <Avatar
                      alt={achievement.name}
                      src={achievement.badge}
                      component={Link}
                      href={achievement.link}
                    />
                  </Tooltip>
                );
              })}
            </AvatarGroup>
          </Link>
        ),
      },
    },
  ];

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
      <FormattedMessage {...translations.title} />
    </Box>
  );

  return (
    <DataTable data={data} options={options} columns={columns} title={title} />
  );
};

export default memo(LeaderboardAchievementsTable);
