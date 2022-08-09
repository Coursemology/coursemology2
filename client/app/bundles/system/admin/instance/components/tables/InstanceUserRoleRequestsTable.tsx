import { FC, ReactElement, memo } from 'react';
import {
  defineMessages,
  injectIntl,
  FormattedMessage,
  WrappedComponentProps,
} from 'react-intl';
import { Box, MenuItem, TextField, Typography } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import Note from 'lib/components/Note';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import sharedConstants from 'lib/constants/sharedConstants';
import tableTranslations from 'lib/translations/table';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import equal from 'fast-deep-equal';
import {
  RoleRequestMiniEntity,
  RoleRequestRowData,
} from 'types/system/instance/roleRequests';

interface Props extends WrappedComponentProps {
  title: string;
  roleRequests: RoleRequestMiniEntity[];
  pendingRoleRequests?: boolean;
  approvedRoleRequests?: boolean;
  rejectedRoleRequests?: boolean;
  renderRowActionComponent?: (roleRequest: RoleRequestRowData) => ReactElement;
}

const translations = defineMessages({
  noEnrolRequests: {
    id: 'course.enrolRequests.components.tables.EnrolRequestsTable.noEnrolRequests',
    defaultMessage: 'There are no {enrolRequestsType}',
  },
  approved: {
    id: 'course.enrolRequests.components.tables.EnrolRequestsTable.requestType.approved',
    defaultMessage: 'approved',
  },
  rejected: {
    id: 'course.enrolRequests.components.tables.EnrolRequestsTable.requestType.rejected',
    defaultMessage: 'rejected',
  },
  pending: {
    id: 'course.enrolRequests.components.tables.EnrolRequestsTable.requestType.pending',
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
    intl,
  } = props;
  let columns: TableColumns[] = [];

  if (roleRequests && roleRequests.length === 0) {
    return (
      <Note
        message={
          <FormattedMessage
            {...translations.noEnrolRequests}
            values={{ enrolRequestsType: title.toLowerCase() }}
          />
        }
      />
    );
  }

  const requestTypePrefix: string = ((): string => {
    /* eslint-disable no-else-return */
    if (approvedRoleRequests) {
      return intl.formatMessage(translations.approved);
    } else if (rejectedRoleRequests) {
      return intl.formatMessage(translations.rejected);
    } else if (pendingRoleRequests) {
      return intl.formatMessage(translations.pending);
    }
    return '';
    /* eslint-enable no-else-return */
  })();

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

  const basicColumns: TableColumns[] = [
    {
      name: 'id',
      label: intl.formatMessage(tableTranslations.id),
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
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography key={`name-${roleRequest.id}`} variant="body2">
              {roleRequest.name}
            </Typography>
          );
        },
      },
    },
    {
      name: 'email',
      label: intl.formatMessage(tableTranslations.email),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography key={`email-${roleRequest.id}`} variant="body2">
              {roleRequest.email}
            </Typography>
          );
        },
      },
    },
    {
      name: 'organization',
      label: intl.formatMessage(tableTranslations.organization),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography key={`organization-${roleRequest.id}`} variant="body2">
              {roleRequest.organization}
            </Typography>
          );
        },
      },
    },
    {
      name: 'designation',
      label: intl.formatMessage(tableTranslations.designation),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography key={`designation-${roleRequest.id}`} variant="body2">
              {roleRequest.designation}
            </Typography>
          );
        },
      },
    },
    {
      name: 'reason',
      label: intl.formatMessage(tableTranslations.reason),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
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

  const pendingRoleRequestsColumns: TableColumns[] = [
    ...basicColumns,
    {
      name: 'role',
      label: intl.formatMessage(tableTranslations.role),
      options: {
        alignCenter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const roleRequest = roleRequests[tableMeta.rowIndex];
          return (
            <TextField
              id={`role-${roleRequest.id}`}
              select
              value={value || 'normal'}
              onChange={(e): React.ChangeEvent => updateValue(e.target.value)}
              variant="standard"
            >
              {Object.keys(sharedConstants.ROLE_REQUEST_ROLES).map((option) => (
                <MenuItem
                  key={`role-${roleRequest.id}-${option}`}
                  value={option}
                >
                  {sharedConstants.ROLE_REQUEST_ROLES[option]}
                </MenuItem>
              ))}
            </TextField>
          );
        },
      },
    },
    ...(renderRowActionComponent
      ? [
          {
            name: 'actions',
            label: intl.formatMessage(tableTranslations.actions),
            options: {
              empty: true,
              sort: false,
              alignCenter: true,
              customBodyRender: (_value, tableMeta): JSX.Element => {
                const rowData = tableMeta.rowData as RoleRequestRowData;
                const enrolRequest = rebuildObjectFromRow(columns, rowData);
                const actionComponent = renderRowActionComponent(enrolRequest);
                return actionComponent;
              },
            },
          },
        ]
      : []),
  ];

  const approvedRoleRequestsColumns: TableColumns[] = [
    ...basicColumns,
    {
      name: 'role',
      label: intl.formatMessage(tableTranslations.role),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography key={`role-${roleRequest.id}`} variant="body2">
              {roleRequest.role
                ? sharedConstants.ROLE_REQUEST_ROLES[roleRequest.role]
                : '-'}
            </Typography>
          );
        },
      },
    },
    {
      name: 'approver',
      label: intl.formatMessage(tableTranslations.approver),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography key={`rejector-${roleRequest.id}`} variant="body2">
              {roleRequest.confirmedBy}
            </Typography>
          );
        },
      },
    },
    {
      name: 'approvedAt',
      label: intl.formatMessage(tableTranslations.approvedAt),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography key={`approvedAt-${roleRequest.id}`} variant="body2">
              {roleRequest.confirmedAt}
            </Typography>
          );
        },
      },
    },
  ];

  const rejectedRoleRequestsColumns: TableColumns[] = [
    ...basicColumns,
    {
      name: 'rejector',
      label: intl.formatMessage(tableTranslations.rejector),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography key={`rejector-${roleRequest.id}`} variant="body2">
              {roleRequest.confirmedBy}
            </Typography>
          );
        },
      },
    },
    {
      name: 'rejectedAt',
      label: intl.formatMessage(tableTranslations.rejectedAt),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography key={`rejectedAt-${roleRequest.id}`} variant="body2">
              {roleRequest.confirmedAt}
            </Typography>
          );
        },
      },
    },
    {
      name: 'rejectionMessage',
      label: intl.formatMessage(tableTranslations.rejectionMessage),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography
              key={`rejectionMessage-${roleRequest.id}`}
              variant="body2"
            >
              {roleRequest.rejectionMessage}
            </Typography>
          );
        },
      },
    },
  ];

  if (pendingRoleRequests) {
    columns = pendingRoleRequestsColumns;
  } else if (approvedRoleRequests) {
    columns = approvedRoleRequestsColumns;
  } else if (rejectedRoleRequests) {
    columns = rejectedRoleRequestsColumns;
  }

  return (
    <Box sx={{ margin: '12px 0px' }}>
      <DataTable
        title={title}
        data={roleRequests}
        columns={columns}
        options={options}
        includeRowNumber
      />
    </Box>
  );
};

export default memo(
  injectIntl(InstanceUserRoleRequestsTable),
  (prevProps, nextProps) => {
    return equal(prevProps.roleRequests, nextProps.roleRequests);
  },
);
