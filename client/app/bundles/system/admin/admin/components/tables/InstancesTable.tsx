import { FC, ReactElement } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { Typography } from '@mui/material';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { InstanceMiniEntity } from 'types/system/instances';

import DataTable from 'lib/components/core/layouts/DataTable';
import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import tableTranslations from 'lib/translations/table';

import { updateInstance } from '../../operations';
import { getAdminCounts } from '../../selectors';

interface Props extends WrappedComponentProps {
  instances: InstanceMiniEntity[];
  title: string;
  renderRowActionComponent: (instance: InstanceMiniEntity) => ReactElement;
}

const translations = defineMessages({
  searchText: {
    id: 'system.admin.admin.InstancesTable.searchText',
    defaultMessage: 'Search instance name or host name',
  },
  renameSuccess: {
    id: 'system.admin.admin.InstancesTable.renameSuccess',
    defaultMessage: 'Renamed instance to {name}',
  },
  changeHostSuccess: {
    id: 'system.admin.admin.InstancesTable.changeHostSuccess',
    defaultMessage: 'Host changed from {oldHost} to {newHost}',
  },
  updateNameFailure: {
    id: 'system.admin.admin.InstancesTable.updateNameFailure',
    defaultMessage: 'Failed to rename instance to {oldName}',
  },
  updateHostFailure: {
    id: 'system.admin.admin.InstancesTable.updateRoleFailure',
    defaultMessage: 'Failed to change host from {oldHost} to {newHost}',
  },
  fetchFilteredInstancesFailure: {
    id: 'system.admin.admin.InstancesTable.fetchFilteredInstancesFailure',
    defaultMessage: 'Failed to get instances',
  },
});

const InstancesTable: FC<Props> = (props) => {
  const { renderRowActionComponent, title, instances, intl } = props;
  const dispatch = useAppDispatch();
  const counts = useAppSelector(getAdminCounts);

  const handleNameUpdate = (rowData, newName: string): Promise<void> => {
    const instance = rebuildObjectFromRow(
      columns, // eslint-disable-line @typescript-eslint/no-use-before-define
      rowData,
    ) as InstanceMiniEntity;
    const newInstance = {
      ...instance,
      name: newName,
    };
    return dispatch(updateInstance(instance.id, newInstance))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.renameSuccess, {
            name: newName,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          intl.formatMessage(translations.updateNameFailure, {
            oldName: instance.name,
          }),
        );
        throw error;
      });
  };

  const handleHostUpdate = (rowData, newHost: string): Promise<void> => {
    const instance = rebuildObjectFromRow(
      columns, // eslint-disable-line @typescript-eslint/no-use-before-define
      rowData,
    ) as InstanceMiniEntity;
    const newInstance = {
      ...instance,
      host: newHost,
    };
    return dispatch(updateInstance(instance.id, newInstance))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.changeHostSuccess, {
            oldHost: instance.host,
            newHost,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          intl.formatMessage(translations.updateHostFailure, {
            oldHost: instance.host,
            newHost,
          }),
        );
        throw error;
      });
  };

  const options: TableOptions = {
    count: counts.instancesCount,
    download: false,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: DEFAULT_TABLE_ROWS_PER_PAGE,
    rowsPerPageOptions: [DEFAULT_TABLE_ROWS_PER_PAGE],
    search: false,
    selectableRows: 'none',
    serverSide: true,
    setTableProps: (): Record<string, unknown> => {
      return { size: 'small' };
    },
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        key: `instance_${instances[dataIndex].id}`,
        instanceid: `instance_${instances[dataIndex].id}`,
        className: `instance instance_${instances[dataIndex].id}`,
      };
    },
    viewColumns: false,
  };

  const columns: TableColumns[] = [
    {
      name: 'id',
      label: '',
      options: {
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'permissions',
      label: '',
      options: {
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'name',
      label: intl.formatMessage(tableTranslations.name),
      options: {
        alignCenter: false,
        search: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const rowData = tableMeta.rowData;
          return (
            <InlineEditTextField
              key={`name-${rowData[1]}`}
              className={`instance_name instance_name_${rowData[1]}`}
              disabled={!rowData[2].canEdit} // rowData[2] contains InstanceMiniEntityPermissions
              link={`//${rowData[4]}/admin/instances`}
              onUpdate={(newValue): Promise<void> =>
                handleNameUpdate(rowData, newValue)
              }
              updateValue={updateValue}
              value={value}
              variant="standard"
            />
          );
        },
      },
    },
    {
      name: 'host',
      label: intl.formatMessage(tableTranslations.host),
      options: {
        alignCenter: false,
        search: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const rowData = tableMeta.rowData;
          return (
            <InlineEditTextField
              key={`host-${rowData[1]}`}
              className={`instance_host instance_host_${rowData[1]}`}
              disabled={!rowData[2].canEdit} // rowData[2] contains InstanceMiniEntityPermissions
              onUpdate={(newValue): Promise<void> =>
                handleHostUpdate(rowData, newValue)
              }
              updateValue={updateValue}
              value={value}
              variant="standard"
            />
          );
        },
      },
    },
    {
      name: 'activeUsers',
      label: intl.formatMessage(tableTranslations.activeUsers),
      options: {
        alignCenter: false,
        sort: false,
        search: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const instance = instances[dataIndex];
          return (
            <Typography
              key={`instance-${instance.id}`}
              className="instance_activeUsers"
              variant="body2"
            >
              <a href={`//${instance.host}/admin/users?active=true`}>
                {instance.activeUserCount}
              </a>
            </Typography>
          );
        },
      },
    },
    {
      name: 'totalUsers',
      label: intl.formatMessage(tableTranslations.totalUsers),
      options: {
        alignCenter: false,
        sort: false,
        search: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const instance = instances[dataIndex];
          return (
            <Typography
              key={`instance-${instance.id}`}
              className="instance_totalUsers"
              variant="body2"
            >
              <a href={`//${instance.host}/admin/users`}>
                {instance.userCount}
              </a>
            </Typography>
          );
        },
      },
    },
    {
      name: 'activeCourses',
      label: intl.formatMessage(tableTranslations.activeCourses),
      options: {
        alignCenter: false,
        sort: false,
        search: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const instance = instances[dataIndex];
          return (
            <Typography
              key={`instance-${instance.id}`}
              className="instance_activeCourses"
              variant="body2"
            >
              <a href={`//${instance.host}/admin/courses?active=true`}>
                {instance.activeCourseCount}
              </a>
            </Typography>
          );
        },
      },
    },
    {
      name: 'totalCourses',
      label: intl.formatMessage(tableTranslations.totalCourses),
      options: {
        alignCenter: false,
        sort: false,
        search: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const instance = instances[dataIndex];
          return (
            <Typography
              key={`instance-${instance.id}`}
              className="instance_totalCourses"
              variant="body2"
            >
              <a href={`//${instance.host}/admin/courses`}>
                {instance.activeCourseCount}
              </a>
            </Typography>
          );
        },
      },
    },
    {
      name: 'actions',
      label: intl.formatMessage(tableTranslations.actions),
      options: {
        empty: true,
        sort: false,
        alignCenter: true,
        customBodyRender: (_value, tableMeta): JSX.Element => {
          const rowData = tableMeta.rowData;
          const instance = rebuildObjectFromRow(columns, rowData);
          return renderRowActionComponent(instance as InstanceMiniEntity);
        },
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={instances}
      includeRowNumber
      options={options}
      title={<Typography variant="h6">{title}</Typography>}
      withMargin
    />
  );
};

export default injectIntl(InstancesTable);
