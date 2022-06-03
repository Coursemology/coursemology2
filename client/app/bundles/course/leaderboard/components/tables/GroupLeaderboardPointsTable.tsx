import { defineMessages, FormattedMessage } from 'react-intl';
import { Avatar, Tooltip, Link, Box, AvatarGroup } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import { GroupLeaderboardPoints } from 'types/course/leaderboard';
import { FC, memo } from 'react';

interface Props {
  data: GroupLeaderboardPoints[];
}

const translations = defineMessages({
  title: {
    id: 'course.leaderboard.containers.tables.LeaderboardPointsTable.title',
    defaultMessage: 'By Experience Points',
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

const GroupLeaderboardPointsTable: FC<Props> = (props: Props) => {
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
        alignCenter: true,
        justifyCenter: true,
        customBodyRenderLite: (_dataIndex: number) => data[_dataIndex].name,
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
            total={data[_dataIndex].group.length}
            max={6}
            sx={styles.avatarGroup}
          >
            {data[_dataIndex].group.map((user) => (
              <Tooltip title={user.name} key={user.id}>
                <Avatar
                  src={user.userPicture}
                  alt={user.name}
                  component={Link}
                  href={user.userLink}
                />
              </Tooltip>
            ))}
          </AvatarGroup>
        ),
      },
    },
    {
      name: 'points',
      label: 'Average Experience',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        justifyCenter: true,
        customBodyRenderLite: (_dataIndex: number) =>
          data[_dataIndex].averageExperiencePoints.toFixed(2),
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

export default memo(GroupLeaderboardPointsTable);
