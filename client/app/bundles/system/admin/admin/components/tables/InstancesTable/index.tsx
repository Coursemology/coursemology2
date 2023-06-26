import { Fragment, ReactElement, ReactNode } from 'react';
import { defineMessages } from 'react-intl';
import { InstanceMiniEntity } from 'types/system/instances';

import Link from 'lib/components/core/Link';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import InstanceField from './InstanceField';

interface InstanceTableProps {
  instances: InstanceMiniEntity[];
  renderRowActionComponent: (instance: InstanceMiniEntity) => ReactElement;
  className?: string;
  newInstanceButton?: ReactNode;
}

const translations = defineMessages({
  searchText: {
    id: 'system.admin.admin.InstancesTable.searchText',
    defaultMessage: 'Search instance by name or host',
  },
});

const InstancesTable = (props: InstanceTableProps): JSX.Element => {
  const { renderRowActionComponent, instances } = props;
  const { t } = useTranslation();

  const columns: ColumnTemplate<InstanceMiniEntity>[] = [
    {
      of: 'name',
      title: t(tableTranslations.name),
      searchable: true,
      sortable: true,
      cell: (instance) => <InstanceField field="name" for={instance} />,
    },
    {
      of: 'host',
      title: t(tableTranslations.host),
      searchable: true,
      sortable: true,
      cell: (instance) => (
        <InstanceField
          field="host"
          for={instance}
          link={`//${instance.host}/admin/instances`}
        />
      ),
    },
    {
      of: 'activeUserCount',
      title: t(tableTranslations.activeUsers),
      sortable: true,
      cell: (instance) => (
        <Link
          href={`//${instance.host}/admin/users?active=true`}
          underline="hover"
        >
          {instance.activeUserCount}
        </Link>
      ),
    },
    {
      of: 'userCount',
      title: t(tableTranslations.totalUsers),
      sortable: true,
      cell: (instance) => (
        <Link href={`//${instance.host}/admin/users`} underline="hover">
          {instance.userCount}
        </Link>
      ),
    },

    {
      of: 'activeCourseCount',
      title: t(tableTranslations.activeCourses),
      sortable: true,
      cell: (instance) => (
        <Link
          href={`//${instance.host}/admin/courses?active=true`}
          underline="hover"
        >
          {instance.activeCourseCount}
        </Link>
      ),
    },
    {
      of: 'courseCount',
      title: t(tableTranslations.totalCourses),
      sortable: true,
      cell: (instance) => (
        <Link href={`//${instance.host}/admin/courses`} underline="hover">
          {instance.courseCount}
        </Link>
      ),
    },
    {
      id: 'actions',
      title: t(tableTranslations.actions),
      cell: (instance) => renderRowActionComponent?.(instance),
      unless: !renderRowActionComponent,
    },
  ];

  return (
    <Table
      className={props.className}
      columns={columns}
      data={instances}
      getRowClassName={(instance): string => `instance_${instance.id}`}
      getRowEqualityData={(instance): InstanceMiniEntity => instance}
      getRowId={(instance): string => instance.id.toString()}
      indexing={{ indices: true }}
      pagination={{
        rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
        showAllRows: true,
      }}
      search={{ searchPlaceholder: t(translations.searchText) }}
      toolbar={{
        show: true,
        buttons: [
          <Fragment key="newInstanceButton">
            {props.newInstanceButton}
          </Fragment>,
        ],
      }}
    />
  );
};

export default InstancesTable;
