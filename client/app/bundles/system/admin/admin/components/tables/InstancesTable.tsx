import { ReactElement, useState } from 'react';
import { Typography } from '@mui/material';
import { InstanceMiniEntity } from 'types/system/instances';

import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import InstanceNameOrHostField from './ManageInstanceTable/InstanceNameOrHostField';

interface InstanceTableProps {
  instances: InstanceMiniEntity[];
  renderRowActionComponent: (instance: InstanceMiniEntity) => ReactElement;
  className?: string;
}

const InstancesTable = (props: InstanceTableProps): JSX.Element => {
  const { renderRowActionComponent, instances } = props;
  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);

  const columns: ColumnTemplate<InstanceMiniEntity>[] = [
    {
      of: 'name',
      title: t(tableTranslations.name),
      sortable: true,
      cell: (instance) => (
        <InstanceNameOrHostField
          for={instance}
          nameChanged
          setSubmitting={setSubmitting}
          submitting={submitting}
        />
      ),
    },
    {
      of: 'host',
      title: t(tableTranslations.host),
      sortable: true,
      cell: (instance) => (
        <InstanceNameOrHostField
          for={instance}
          setSubmitting={setSubmitting}
          submitting={submitting}
        />
      ),
    },
    {
      of: 'activeUserCount',
      title: t(tableTranslations.activeUsers),
      sortable: true,
      cell: (instance) => (
        <Typography
          key={`instance-${instance.id}`}
          className="instance_activeUsers"
          variant="body2"
        >
          <a href={`//${instance.host}/admin/users?active=true`}>
            {instance.activeUserCount}
          </a>
        </Typography>
      ),
    },
    {
      of: 'userCount',
      title: t(tableTranslations.totalUsers),
      sortable: true,
      cell: (instance) => (
        <Typography
          key={`instance-${instance.id}`}
          className="instance_totalUsers"
          variant="body2"
        >
          <a href={`//${instance.host}/admin/users`}>{instance.userCount}</a>
        </Typography>
      ),
    },

    {
      of: 'activeCourseCount',
      title: t(tableTranslations.activeCourses),
      sortable: true,
      cell: (instance) => (
        <Typography
          key={`instance-${instance.id}`}
          className="instance_activeCourses"
          variant="body2"
        >
          <a href={`//${instance.host}/admin/courses?active=true`}>
            {instance.activeCourseCount}
          </a>
        </Typography>
      ),
    },
    {
      of: 'courseCount',
      title: t(tableTranslations.totalCourses),
      sortable: true,
      cell: (instance) => (
        <Typography
          key={`instance-${instance.id}`}
          className="instance_totalCourses"
          variant="body2"
        >
          <a href={`//${instance.host}/admin/courses`}>{instance.userCount}</a>
        </Typography>
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
      getRowId={(instance): string => instance.id.toString()}
      pagination={{
        initialPagination: DEFAULT_TABLE_ROWS_PER_PAGE,
        rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
        showAllRows: true,
      }}
    />
  );
};

export default InstancesTable;
