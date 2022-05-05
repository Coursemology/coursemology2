import { FC } from 'react';
import { Grid } from '@mui/material';
import { green, red } from '@mui/material/colors';
import { AchievementCourseUserEntity } from 'types/course/achievements';
import DataTable from 'lib/components/DataTable';

interface OwnProps {
  achievementUsers: AchievementCourseUserEntity[];
  initialObtainedUserIds: number[];
  selectedUserIds: Set<number>;
}

const AchievementAwardSummary: FC<OwnProps> = (props) => {
  const { achievementUsers, initialObtainedUserIds, selectedUserIds } = props;

  const removedUserIds = new Set(
    [...initialObtainedUserIds].filter(
      (element) => !selectedUserIds.has(element),
    ),
  );

  const awardedUsers = achievementUsers.filter(
    (cu) => cu.obtainedAt === null && selectedUserIds.has(cu.id),
  );
  const removedUsers = achievementUsers.filter((cu) =>
    removedUserIds.has(cu.id),
  );

  const awardedTableOptions = {
    download: false,
    filter: false,
    print: false,
    pagination: false,
    search: false,
    selectableRows: 'none',
    setRowProps: (row, dataIndex: number, rowIndex: number) => ({
      style: { background: green[100] },
    }),
    viewColumns: false,
  };

  const removedTableOptions = {
    download: false,
    filter: false,
    print: false,
    pagination: false,
    search: false,
    selectableRows: 'none',
    setRowProps: (row, dataIndex: number, rowIndex: number) => ({
      style: { background: red[100] },
    }),
    viewColumns: false,
  };

  const awardedTableColumns: any = [
    {
      name: 'name',
      label: 'Name',
      options: {
        filter: false,
      },
    },
    {
      name: 'phantom',
      label: 'User Type',
      options: {
        search: false,
        customBodyRenderLite: (dataIndex: number) => {
          const isPhantom = awardedUsers[dataIndex].phantom;
          if (isPhantom) {
            return 'Phantom Student';
          }
          return 'Normal Student';
        },
      },
    },
  ];

  const removedTableColumns: any = [
    {
      name: 'name',
      label: 'Name',
      options: {
        filter: false,
      },
    },
    {
      name: 'phantom',
      label: 'User Type',
      options: {
        search: false,
        customBodyRenderLite: (dataIndex: number) => {
          const isPhantom = removedUsers[dataIndex].phantom;
          if (isPhantom) {
            return 'Phantom Student';
          }
          return 'Normal Student';
        },
      },
    },
  ];

  return (
    <Grid container spacing={1}>
      <Grid item xs={6}>
        <DataTable
          title={`Awarded Students (${awardedUsers.length})`}
          data={awardedUsers}
          columns={awardedTableColumns}
          options={awardedTableOptions}
        />
      </Grid>
      <Grid item xs={6}>
        <DataTable
          title={`Revoked Students (${removedUsers.length})`}
          data={removedUsers}
          columns={removedTableColumns}
          options={removedTableOptions}
        />
      </Grid>
    </Grid>
  );
};

export default AchievementAwardSummary;
