import { FC } from 'react';
import { Grid } from '@mui/material';
import { green, red } from '@mui/material/colors';
import { AchievementCourseUserEntity } from 'types/course/achievements';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import DataTable from 'lib/components/DataTable';

interface Props {
  achievementUsers: AchievementCourseUserEntity[];
  initialObtainedUserIds: number[];
  selectedUserIds: Set<number>;
}

const AchievementAwardSummary: FC<Props> = (props) => {
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

  const awardedTableOptions: TableOptions = {
    download: false,
    filter: false,
    print: false,
    pagination: false,
    search: false,
    selectableRows: 'none',
    setRowProps: (_row, _dataIndex, _rowIndex): Record<string, unknown> => ({
      style: { background: green[100] },
    }),
    viewColumns: false,
  };

  const removedTableOptions: TableOptions = {
    download: false,
    filter: false,
    print: false,
    pagination: false,
    search: false,
    selectableRows: 'none',
    setRowProps: (_row, _dataIndex, _rowIndex) => ({
      style: { background: red[100] },
    }),
    viewColumns: false,
  };

  const awardedTableColumns: TableColumns[] = [
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
        customBodyRenderLite: (dataIndex): string => {
          const isPhantom = awardedUsers[dataIndex].phantom;
          if (isPhantom) {
            return 'Phantom Student';
          }
          return 'Normal Student';
        },
      },
    },
  ];

  const removedTableColumns: TableColumns[] = [
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
        customBodyRenderLite: (dataIndex): string => {
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
