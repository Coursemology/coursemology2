import { defineMessages, FormattedMessage } from 'react-intl';
import { Avatar, Box, Link } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import { FC } from 'react';
import { LeaderboardPoints } from 'types/course/leaderboard';

interface Props {
  data: LeaderboardPoints[];
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
  avatar: {
    maxWidth: '250px',
    wordWrap: 'break-word',
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: '150px',
  },
};

const LeaderboardPointsTable: FC<Props> = (props: Props) => {
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
          <Box sx={styles.avatar} className="course_user" id={`course_user_${data[_dataIndex].id}`}>
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
      name: 'level',
      label: 'Level',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        justifyCenter: true,
        customBodyRenderLite: (_dataIndex: number) => data[_dataIndex].level,
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
          data[_dataIndex].experience,
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

export default LeaderboardPointsTable;
