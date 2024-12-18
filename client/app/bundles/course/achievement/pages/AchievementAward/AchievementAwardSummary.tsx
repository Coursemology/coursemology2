import { FC } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Grid } from '@mui/material';
import { green, red } from '@mui/material/colors';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { AchievementCourseUserEntity } from 'types/course/achievements';

import DataTable from 'lib/components/core/layouts/DataTable';

interface Props {
  achievementUsers: AchievementCourseUserEntity[];
  initialObtainedUserIds: number[];
  selectedUserIds: Set<number>;
}

const translations = defineMessages({
  name: {
    id: 'course.achievement.AchievementAward.AchievementAwardSummary.name',
    defaultMessage: 'Name',
  },
  userType: {
    id: 'course.achievement.AchievementAward.AchievementAwardSummary.userType',
    defaultMessage: 'User Type',
  },
  awardedStudents: {
    id: 'course.achievement.AchievementAward.AchievementAwardSummary.awardedStudents',
    defaultMessage: 'Awarded Students',
  },
  revokedStudents: {
    id: 'course.achievement.AchievementAward.AchievementAwardSummary.revokedStudents',
    defaultMessage: 'Revoked Students',
  },
  phantomStudent: {
    id: 'course.achievement.AchievementAward.AchievementAwardSummary.phantomStudent',
    defaultMessage: 'Phantom Student',
  },
  normalStudent: {
    id: 'course.achievement.AchievementAward.AchievementAwardSummary.normalStudent',
    defaultMessage: 'Normal Student',
  },
});

const AchievementAwardSummary: FC<Props> = (props) => {
  const { achievementUsers, initialObtainedUserIds, selectedUserIds } = props;
  const { formatMessage: t } = useIntl();

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
      label: t(translations.name),
      options: {
        filter: false,
      },
    },
    {
      name: 'phantom',
      label: t(translations.userType),
      options: {
        search: false,
        customBodyRenderLite: (dataIndex): string => {
          const isPhantom = awardedUsers[dataIndex].phantom;
          return isPhantom
            ? t(translations.phantomStudent)
            : t(translations.normalStudent);
        },
      },
    },
  ];

  const removedTableColumns: TableColumns[] = [
    {
      name: 'name',
      label: t(translations.name),
      options: {
        filter: false,
      },
    },
    {
      name: 'phantom',
      label: t(translations.userType),
      options: {
        search: false,
        customBodyRenderLite: (dataIndex): string => {
          const isPhantom = removedUsers[dataIndex].phantom;
          return isPhantom
            ? t(translations.phantomStudent)
            : t(translations.normalStudent);
        },
      },
    },
  ];

  return (
    <Grid container spacing={1}>
      <Grid item xs={6}>
        <DataTable
          columns={awardedTableColumns}
          data={awardedUsers}
          options={awardedTableOptions}
          title={`${t(translations.awardedStudents)} (${awardedUsers.length})`}
        />
      </Grid>
      <Grid item xs={6}>
        <DataTable
          columns={removedTableColumns}
          data={removedUsers}
          options={removedTableOptions}
          title={`${t(translations.revokedStudents)} (${removedUsers.length})`}
        />
      </Grid>
    </Grid>
  );
};

export default AchievementAwardSummary;
