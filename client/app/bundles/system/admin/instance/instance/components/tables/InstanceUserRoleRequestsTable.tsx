import { FC, memo, ReactElement, useMemo } from 'react';
import { defineMessages } from 'react-intl';
import { MenuItem, TextField, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import {
  RoleRequestMiniEntity,
  RoleRequestRowData,
} from 'types/system/instance/roleRequests';
import { INSTANCE_STAFF_ROLES } from 'types/system/instance/users';

import DataTable from 'lib/components/core/layouts/DataTable';
import Link from 'lib/components/core/Link';
import Note from 'lib/components/core/Note';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';
import instanceRoleTranslations from 'lib/translations/instance/users/roles';
import tableTranslations from 'lib/translations/table';

interface Props {
  title: string;
  roleRequests: RoleRequestMiniEntity[];
  pendingRoleRequests?: boolean;
  approvedRoleRequests?: boolean;
  rejectedRoleRequests?: boolean;
  renderRowActionComponent?: (roleRequest: RoleRequestRowData) => ReactElement;
}

const translations = defineMessages({
  noEnrolRequests: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestsTable.noEnrolRequests',
    defaultMessage: 'There is no {enrolRequestsType}',
  },
  approved: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestsTable.approved',
    defaultMessage: 'approved',
  },
  rejected: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestsTable.rejected',
    defaultMessage: 'rejected',
  },
  pending: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestsTable.pending',
    defaultMessage: 'pending',
  },
});

const InstanceUserRoleRequestsTable: FC<Props> = (props) => {
  const {
    title,
    roleRequests,
    pendingRoleRequests = false,
    approvedRoleRequests = false,
    rejectedRoleRequests = false,
    renderRowActionComponent = null,
  } = props;
  const { t } = useTranslation();

  const requestTypePrefix: string = useMemo((): string => {
    if (approvedRoleRequests) {
      return t(translations.approved);
    }
    if (rejectedRoleRequests) {
      return t(translations.rejected);
    }
    if (pendingRoleRequests) {
      return t(translations.pending);
    }
    return '';
  }, [approvedRoleRequests, rejectedRoleRequests, pendingRoleRequests]);

  if (roleRequests && roleRequests.length === 0) {
    return (
      <Note
        message={t(translations.noEnrolRequests, {
          enrolRequestsType: title.toLowerCase(),
        })}
      />
    );
  }

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: 30,
    rowsPerPageOptions: [15, 30, 50, 100],
    search: true,
    selectableRows: 'none',
    setTableProps: (): object => {
      return { size: 'small' };
    },
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        key: `role-request_${roleRequests[dataIndex].id}`,
        rolerequestid: `role-request_${roleRequests[dataIndex].id}`,
        className: `role_request ${requestTypePrefix}_role_request_${roleRequests[dataIndex].id}`,
      };
    },
    sortOrder: {
      name: 'createdAt',
      direction: 'desc',
    },
    viewColumns: false,
  };

  const columns: TableColumns[] = [
    {
      name: 'id',
      label: t(tableTranslations.id),
      options: {
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'name',
      label: t(tableTranslations.name),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return roleRequest.userId ? (
            <Link to={`/users/${roleRequest.userId}`}>
              <Typography variant="body2">{roleRequest.name}</Typography>
            </Link>
          ) : (
            <Typography variant="body2">{roleRequest.name}</Typography>
          );
        },
      },
    },
    {
      name: 'email',
      label: t(tableTranslations.email),
      options: {
        alignCenter: false,
      },
    },
    {
      name: 'organization',
      label: t(tableTranslations.organization),
      options: {
        alignCenter: false,
      },
    },
    {
      name: 'designation',
      label: t(tableTranslations.designation),
      options: {
        alignCenter: false,
      },
    },
    {
      name: 'reason',
      label: t(tableTranslations.reason),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography key={`reason-${roleRequest.id}`} variant="body2">
              {roleRequest.reason}
            </Typography>
          );
        },
      },
    },
  ];

  if (approvedRoleRequests) {
    columns.push(
      ...[
        {
          name: 'role',
          label: t(tableTranslations.role),
          options: {
            alignCenter: false,
            customBodyRenderLite: (dataIndex): JSX.Element => {
              const roleRequest = roleRequests[dataIndex];
              return (
                <Typography key={`role-${roleRequest.id}`} variant="body2">
                  {t(instanceRoleTranslations[roleRequest.role])}
                </Typography>
              );
            },
          },
        },
        {
          name: 'createdAt',
          label: t(tableTranslations.requestedAt),
          options: {
            alignCenter: false,
            customBodyRenderLite: (dataIndex): JSX.Element => {
              const roleRequest = roleRequests[dataIndex];
              return (
                <Typography key={`createdAt-${roleRequest.id}`} variant="body2">
                  {formatLongDateTime(roleRequest.createdAt)}
                </Typography>
              );
            },
          },
        },
        {
          name: 'confirmedBy',
          label: t(tableTranslations.approver),
          options: {
            alignCenter: false,
          },
        },
        {
          name: 'confirmedAt',
          label: t(tableTranslations.approvedAt),
          options: {
            alignCenter: false,
            customBodyRenderLite: (dataIndex): JSX.Element => {
              const roleRequest = roleRequests[dataIndex];
              return (
                <Typography
                  key={`confirmedAt-${roleRequest.id}`}
                  variant="body2"
                >
                  {formatLongDateTime(roleRequest.confirmedAt)}
                </Typography>
              );
            },
          },
        },
      ],
    );
  } else if (pendingRoleRequests) {
    columns.push(
      ...[
        {
          name: 'role',
          label: t(tableTranslations.role),
          options: {
            alignCenter: false,
            customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
              const roleRequest = roleRequests[tableMeta.rowIndex];
              return (
                <TextField
                  id={`role-${roleRequest.id}`}
                  onChange={(e): void => updateValue(e.target.value)}
                  select
                  value={value || 'normal'}
                  variant="standard"
                >
                  {INSTANCE_STAFF_ROLES.map((option) => (
                    <MenuItem
                      key={`role-${roleRequest.id}-${option}`}
                      value={option}
                    >
                      {t(instanceRoleTranslations[option])}
                    </MenuItem>
                  ))}
                </TextField>
              );
            },
          },
        },
        {
          name: 'createdAt',
          label: t(tableTranslations.requestedAt),
          options: {
            alignCenter: false,
            customBodyRenderLite: (dataIndex): JSX.Element => {
              const roleRequest = roleRequests[dataIndex];
              return (
                <Typography key={`createdAt-${roleRequest.id}`} variant="body2">
                  {formatLongDateTime(roleRequest.createdAt)}
                </Typography>
              );
            },
          },
        },
        ...(renderRowActionComponent
          ? [
              {
                name: 'actions',
                label: t(tableTranslations.actions),
                options: {
                  empty: true,
                  sort: false,
                  alignCenter: true,
                  customBodyRender: (_value, tableMeta): JSX.Element => {
                    const rowData = tableMeta.rowData;
                    const enrolRequest = rebuildObjectFromRow(columns, rowData);
                    return renderRowActionComponent(
                      enrolRequest as RoleRequestRowData,
                    );
                  },
                },
              },
            ]
          : []),
      ],
    );
  } else if (rejectedRoleRequests) {
    columns.push(
      ...[
        {
          name: 'createdAt',
          label: t(tableTranslations.requestedAt),
          options: {
            alignCenter: false,
            customBodyRenderLite: (dataIndex): JSX.Element => {
              const roleRequest = roleRequests[dataIndex];
              return (
                <Typography key={`createdAt-${roleRequest.id}`} variant="body2">
                  {formatLongDateTime(roleRequest.createdAt)}
                </Typography>
              );
            },
          },
        },
        {
          name: 'confirmedBy',
          label: t(tableTranslations.rejector),
          options: {
            alignCenter: false,
          },
        },
        {
          name: 'confirmedAt',
          label: t(tableTranslations.rejectedAt),
          options: {
            alignCenter: false,
            customBodyRenderLite: (dataIndex): JSX.Element => {
              const roleRequest = roleRequests[dataIndex];
              return (
                <Typography
                  key={`confirmedAt-${roleRequest.id}`}
                  variant="body2"
                >
                  {formatLongDateTime(roleRequest.confirmedAt)}
                </Typography>
              );
            },
          },
        },
        {
          name: 'rejectionMessage',
          label: t(tableTranslations.rejectionMessage),
          options: {
            alignCenter: false,
          },
        },
      ],
    );
  }

  return (
    <DataTable
      columns={columns}
      data={roleRequests}
      includeRowNumber
      options={options}
      title={title}
      withMargin
    />
  );
};

export default memo(InstanceUserRoleRequestsTable, (prevProps, nextProps) => {
  return equal(prevProps.roleRequests, nextProps.roleRequests);
});
