import { ReactElement, useMemo } from 'react';
import { MenuItem, Typography } from '@mui/material';
import { CourseUserMiniEntity, CourseUserRole } from 'types/course/courseUsers';

import Note from 'lib/components/core/Note';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import roleTranslations from 'lib/translations/course/users/roles';
import tableTranslations from 'lib/translations/table';

import { getManageCourseUserPermissions } from '../../../selectors';

import ActiveTableToolbar from './ActiveTableToolbar';
import AlgorithmMenu from './AlgorithmMenu';
import PhantomSwitch from './PhantomSwitch';
import RoleMenu from './RoleMenu';
import TimelineMenu from './TimelineMenu';
import translations from './translations';
import UserNameField from './UserNameField';

interface ManageUsersTableProps {
  users: CourseUserMiniEntity[];
  manageStaff?: boolean;
  renderRowActionComponent?: (user: CourseUserMiniEntity) => ReactElement;
  csvDownloadFilename: string;
  timelinesMap?: Record<number, string>;
  className?: string;
}

const ManageUsersTable = (props: ManageUsersTableProps): JSX.Element => {
  const { users, manageStaff, timelinesMap, renderRowActionComponent } = props;

  const { t } = useTranslation();

  const permissions = useAppSelector(getManageCourseUserPermissions);

  const timelines = useMemo(
    () =>
      timelinesMap &&
      Object.entries(timelinesMap).map(([id, timelineTitle]) => (
        <MenuItem key={id} value={id}>
          {timelineTitle ?? t(translations.defaultTimeline)}
        </MenuItem>
      )),
    [timelinesMap],
  );

  if (!users?.length) return <Note message={t(translations.noUsers)} />;

  const columns: ColumnTemplate<CourseUserMiniEntity>[] = [
    {
      of: 'name',
      title: t(tableTranslations.name),
      sortable: true,
      searchable: true,
      cell: (user) => <UserNameField for={user} />,
      csvDownloadable: true,
    },
    {
      of: 'email',
      sortable: true,
      searchable: true,
      title: t(tableTranslations.email),
      cell: (user) => user.email,
      csvDownloadable: true,
    },
    {
      of: 'phantom',
      sortable: true,
      title: t(tableTranslations.phantom),
      cell: (user) => <PhantomSwitch for={user} />,
      csvDownloadable: true,
      sortProps: {
        sort: (a, b) => +(a.phantom ?? 0) - +(b.phantom ?? 0),
      },
    },
    {
      of: 'groups',
      sortable: true,
      title: t(tableTranslations.groups),
      filterable: true,
      filterProps: {
        getValue: (user) => user.groups ?? [],
        shouldInclude: (user, filterValue?: string[]): boolean => {
          if (!user.groups) return false;
          if (!filterValue?.length) return true;

          const filterSet = new Set(filterValue);
          return user.groups.some((group) => filterSet.has(group));
        },
      },
      cell: (user) => (
        <ul className="m-0 list-none p-0">
          {user.groups?.map((group) => (
            <Typography key={group} component="li" variant="body2">
              {group}
            </Typography>
          ))}
        </ul>
      ),
      unless: manageStaff,
      csvDownloadable: true,
      csvValue: (value?: number[]) => value?.join('; ') ?? '',
      sortProps: {
        sort: (a, b) =>
          a.groups?.join(';')?.localeCompare(b.groups?.join(';') ?? '') ?? 0,
      },
    },
    {
      of: 'referenceTimelineId',
      sortable: true,
      title: t(tableTranslations.referenceTimeline),
      filterable: true,
      filterProps: {
        beforeFilter: (value: string) => parseInt(value, 10),
        shouldInclude: (user, filterValue?: number | null) =>
          user.referenceTimelineId === filterValue,
        getLabel: (value?: number | null) =>
          (timelinesMap && value && timelinesMap[value]) ||
          t(translations.defaultTimeline),
      },
      cell: (user) => (
        <TimelineMenu
          for={user}
          timelines={timelines!}
          timelinesMap={timelinesMap!}
        />
      ),
      unless:
        !permissions?.canManageReferenceTimelines ||
        !timelines ||
        !timelinesMap,
      csvDownloadable: true,
      csvValue: (value?: number): string => {
        let title = t(translations.defaultTimeline);
        if (timelinesMap && value) title = timelinesMap[value] || title;
        return title;
      },
    },
    {
      of: 'timelineAlgorithm',
      sortable: true,
      title: t(tableTranslations.timelineAlgorithm),
      cell: (user) => <AlgorithmMenu for={user} />,
      unless: !permissions?.canManagePersonalTimes,
      csvDownloadable: true,
    },
    {
      of: 'role',
      sortable: true,
      title: t(tableTranslations.role),
      cell: (user) => <RoleMenu for={user} />,
      unless: !manageStaff || !permissions?.canManageCourseUsers,
      csvDownloadable: true,
      csvValue: (value: CourseUserRole) => t(roleTranslations[value]),
    },
    {
      id: 'actions',
      title: t(tableTranslations.actions),
      cell: (user) => renderRowActionComponent?.(user),
      unless: !renderRowActionComponent,
    },
  ];

  return (
    <Table
      className={`border-none ${props.className ?? ''}`}
      columns={columns}
      csvDownload={{ filename: props.csvDownloadFilename }}
      data={users}
      getRowClassName={(user): string => `course_user course_user_${user.id}`}
      getRowEqualityData={(user): CourseUserMiniEntity => user}
      getRowId={(user): string => user.id.toString()}
      indexing={{ indices: true, rowSelectable: !manageStaff }}
      pagination={{
        rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
        showAllRows: true,
      }}
      search={{
        searchPlaceholder: t(translations.searchText),
        searchProps: {
          shouldInclude: (user, filterValue?: string): boolean => {
            if (!user.name && !user.email) return false;
            if (!filterValue?.length) return true;

            return (
              user.name
                .toLowerCase()
                .trim()
                .includes(filterValue.toLowerCase().trim()) ||
              user.email
                .toLowerCase()
                .trim()
                .includes(filterValue.toLowerCase().trim())
            );
          },
        },
      }}
      toolbar={{
        show: true,
        activeToolbar: (selectedUsers): JSX.Element => (
          <ActiveTableToolbar
            selectedRows={selectedUsers}
            timelinesMap={timelinesMap}
          />
        ),
      }}
    />
  );
};

export default ManageUsersTable;
