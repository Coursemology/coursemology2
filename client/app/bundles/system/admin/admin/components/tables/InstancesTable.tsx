import { Box, CircularProgress, Typography } from '@mui/material';
import { FC, ReactElement, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  TableColumns,
  TableOptions,
  TableState,
} from 'types/components/DataTable';
import tableTranslations from 'lib/translations/table';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import DataTable from 'lib/components/DataTable';
import { InstanceMiniEntity } from 'types/system/instances';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import { toast } from 'react-toastify';
import LoadingOverlay from 'lib/components/LoadingOverlay';
import { getAdminCounts, getAllInstanceMiniEntities } from '../../selectors';
import { indexInstances, updateInstance } from '../../operations';

interface Props extends WrappedComponentProps {
  title: string;
  renderRowActionComponent: (instance: InstanceMiniEntity) => ReactElement;
}

const translations = defineMessages({
  searchText: {
    id: 'system.admin.components.tables.InstancesTable.searchPlaceholder',
    defaultMessage: 'Search instance name or host name',
  },
  renameSuccess: {
    id: 'system.admin.components.tables.InstancesTable.rename.success',
    defaultMessage: 'Renamed instance to {name}',
  },
  changeHostSuccess: {
    id: 'system.admin.components.tables.InstancesTable.changeHost.success',
    defaultMessage: 'Host changed from {oldHost} to {newHost}',
  },
  updateNameFailure: {
    id: 'system.admin.components.tables.InstancesTable.updateNameFailure',
    defaultMessage: 'Failed to rename instance to {oldName}',
  },
  updateHostFailure: {
    id: 'system.admin.components.tables.InstancesTable.updateRoleFailure',
    defaultMessage: 'Failed to change host from {oldHost} to {newHost}',
  },
  fetchFilteredInstancesFailure: {
    id: 'system.admin.admin.fetchFilteredInstances.failure',
    defaultMessage: 'Failed to get instances',
  },
});

const InstancesTable: FC<Props> = (props) => {
  const { renderRowActionComponent, title, intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const instances = useSelector((state: AppState) =>
    getAllInstanceMiniEntities(state),
  );
  const counts = useSelector((state: AppState) => getAdminCounts(state));

  const [tableState, setTableState] = useState<TableState>({
    page: 1,
  });

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

  const changePage = (page): void => {
    setIsLoading(true);
    setTableState({
      ...tableState,
      page,
    });
    dispatch(
      indexInstances({ 'filter[page_num]': page, 'filter[length]': 100 }),
    )
      .catch(() =>
        toast.error(
          intl.formatMessage(translations.fetchFilteredInstancesFailure),
        ),
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  const options: TableOptions = {
    count: counts.instancesCount,
    download: false,
    filter: false,
    onTableChange: (action, newTableState) => {
      switch (action) {
        case 'changePage':
          changePage(newTableState.page! + 1);
          break;
        default:
          break;
      }
    },
    pagination: true,
    print: false,
    rowsPerPage: 50,
    rowsPerPageOptions: [50],
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
              value={value}
              className={`instance_name instance_name_${rowData[1]}`}
              updateValue={updateValue}
              variant="standard"
              link={`//${rowData[4]}/admin/instances`}
              onUpdate={(newValue): Promise<void> =>
                handleNameUpdate(rowData, newValue)
              }
              disabled={!rowData[2].canEdit} // rowData[2] contains InstanceMiniEntityPermissions
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
              value={value}
              className={`instance_host instance_host_${rowData[1]}`}
              updateValue={updateValue}
              variant="standard"
              onUpdate={(newValue): Promise<void> =>
                handleHostUpdate(rowData, newValue)
              }
              disabled={!rowData[2].canEdit} // rowData[2] contains InstanceMiniEntityPermissions
            />
          );
        },
      },
    },
    {
      name: 'activeTotalUsers',
      label: intl.formatMessage(tableTranslations.activeTotalUsers),
      options: {
        alignCenter: false,
        sort: false,
        search: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const instance = instances[dataIndex];
          return (
            <Typography
              key={`instance-${instance.id}`}
              className="instance_activeTotalUsers"
              variant="body2"
            >
              <a href={`//${instance.host}/admin/users/?active=true`}>
                {instance.activeUserCount}
              </a>
              {' / '}
              <a href={`//${instance.host}/admin/users`}>
                {instance.userCount}
              </a>
            </Typography>
          );
        },
      },
    },
    {
      name: 'activeTotalCourses',
      label: intl.formatMessage(tableTranslations.activeTotalCourses),
      options: {
        alignCenter: false,
        sort: false,
        search: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const instance = instances[dataIndex];
          return (
            <Typography
              key={`instance-${instance.id}`}
              className="instance_activeTotalCourses"
              variant="body2"
            >
              <a href={`//${instance.host}/admin/courses/?active=true`}>
                {instance.activeCourseCount}
              </a>
              {' / '}
              <a href={`//${instance.host}/admin/courses`}>
                {instance.courseCount}
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
          const rowData = tableMeta.rowData as InstanceMiniEntity;
          const instance = rebuildObjectFromRow(columns, rowData);
          const actionComponent = renderRowActionComponent(instance);
          return actionComponent;
        },
      },
    },
  ];

  return (
    <Box sx={{ margin: '12px 0px', position: 'relative' }}>
      {isLoading && <LoadingOverlay />}
      <DataTable
        title={
          <Typography variant="h6">
            {title}
            {isLoading && (
              <CircularProgress
                size={24}
                style={{ marginLeft: 15, position: 'relative', top: 4 }}
              />
            )}
          </Typography>
        }
        data={instances}
        columns={columns}
        options={options}
        includeRowNumber
      />
    </Box>
  );
};

export default injectIntl(InstancesTable);
