import { FC, ReactElement } from 'react';
import {
  defineMessages,
  injectIntl,
  FormattedMessage,
  WrappedComponentProps,
} from 'react-intl';
import { Box, Checkbox, MenuItem, TextField, Typography } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import Note from 'lib/components/Note';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import { EnrolRequestEntity } from 'types/course/enrolRequests';
import sharedConstants from 'lib/constants/sharedConstants';
import tableTranslations from 'lib/components/tables/translations';
import { TimelineAlgorithm } from 'types/course/personalTimes';
import { ManageCourseUsersPermissions } from 'types/course/courseUsers';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';

interface Props extends WrappedComponentProps {
  title: string;
  enrolRequests: EnrolRequestEntity[];
  permissions: ManageCourseUsersPermissions;
  defaultTimelineAlgorithm?: TimelineAlgorithm;
  pendingEnrolRequests?: boolean;
  approvedEnrolRequests?: boolean;
  rejectedEnrolRequests?: boolean;
  renderRowActionComponent?: (enrolRequest: EnrolRequestEntity) => ReactElement;
}

const translations = defineMessages({
  noEnrolRequests: {
    id: 'course.enrolRequests.components.tables.EnrolRequestsTable.noEnrolRequests',
    defaultMessage: 'There are no {enrolRequestsType}',
  },
});

const styles = {
  checkbox: {
    margin: '0px 12px 0px 0px',
    padding: 0,
  },
};

const EnrolRequestsTable: FC<Props> = (props) => {
  const {
    title,
    enrolRequests,
    permissions,
    defaultTimelineAlgorithm = 'fixed',
    pendingEnrolRequests = false,
    approvedEnrolRequests = false,
    rejectedEnrolRequests = false,
    renderRowActionComponent = null,
    intl,
  } = props;
  let columns: TableColumns[] = [];

  if (enrolRequests && enrolRequests.length === 0) {
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
    if (approvedEnrolRequests) {
      return 'approved';
    } else if (rejectedEnrolRequests) {
      return 'rejected';
    } else if (pendingEnrolRequests) {
      return 'pending';
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
    rowsPerPageOptions: [15, 30, 50],
    search: true,
    selectableRows: 'none',
    setTableProps: (): object => {
      return { size: 'small' };
    },
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        key: `enrol-request_${enrolRequests[dataIndex].id}`,
        enrolrequestid: `enrol-request_${enrolRequests[dataIndex].id}`,
        className: `enrol_request ${requestTypePrefix}_enrol_request_${enrolRequests[dataIndex].id}`,
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
      name: 'email',
      label: intl.formatMessage(tableTranslations.email),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`email-${enrolRequest.id}`} variant="body2">
              {enrolRequest.email}
            </Typography>
          );
        },
      },
    },
    {
      name: 'createdAt',
      label: intl.formatMessage(tableTranslations.createdAt),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`phantom-${enrolRequest.id}`} variant="body2">
              {enrolRequest.createdAt}
            </Typography>
          );
        },
      },
    },
  ];

  const pendingEnrolmentRequestsColumns: TableColumns[] = [
    {
      name: 'name',
      label: intl.formatMessage(tableTranslations.name),
      options: {
        alignCenter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const enrolRequest = enrolRequests[tableMeta.rowIndex];
          return (
            <InlineEditTextField
              key={`name-${enrolRequest.id}`}
              value={value}
              className="enrol_request_name"
              updateValue={updateValue}
              variant="standard"
            />
          );
        },
      },
    },
    ...basicColumns,
    {
      name: 'role',
      label: intl.formatMessage(tableTranslations.role),
      options: {
        alignCenter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const enrolRequest = enrolRequests[tableMeta.rowIndex];
          return (
            <TextField
              id={`role-${enrolRequest.id}`}
              select
              value={value || 'student'}
              onChange={(e): React.ChangeEvent => updateValue(e.target.value)}
              variant="standard"
            >
              {sharedConstants.USER_ROLES.map((option) => (
                <MenuItem
                  key={`role-${enrolRequest.id}-${option.value}`}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          );
        },
      },
    },
    {
      name: 'phantom',
      label: intl.formatMessage(tableTranslations.phantom),
      options: {
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const enrolRequest = enrolRequests[tableMeta.rowIndex];
          return (
            <Checkbox
              id={`checkbox_${enrolRequest.id}`}
              key={`checkbox_${enrolRequest.id}`}
              checked={value || false}
              style={styles.checkbox}
              onChange={(e): React.ChangeEvent => updateValue(e.target.checked)}
            />
          );
        },
      },
    },
    ...(permissions.canManagePersonalTimes
      ? [
          {
            name: 'timelineAlgorithm',
            label: intl.formatMessage(tableTranslations.timelineAlgorithm),
            options: {
              alignCenter: false,
              customBodyRender: (
                value,
                tableMeta,
                updateValue,
              ): JSX.Element => {
                const enrolRequest = enrolRequests[tableMeta.rowIndex];
                return (
                  <TextField
                    id={`timeline-algorithm-${enrolRequest.id}`}
                    select
                    value={value || defaultTimelineAlgorithm}
                    onChange={(e): React.ChangeEvent =>
                      updateValue(e.target.value)
                    }
                    variant="standard"
                  >
                    {sharedConstants.TIMELINE_ALGORITHMS.map((option) => (
                      <MenuItem
                        key={`timeline-algorithm-option-${enrolRequest.id}-${option.value}`}
                        value={option.value}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              },
            },
          },
        ]
      : []),
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
                const rowData = tableMeta.rowData;
                const enrolRequest = rebuildObjectFromRow(columns, rowData); // maybe can optimize if we push this function to within the buttons?
                const actionComponent = renderRowActionComponent(enrolRequest);
                return actionComponent;
              },
            },
          },
        ]
      : []),
  ];

  const approvedEnrolRequestsColumns: TableColumns[] = [
    {
      name: 'name',
      label: intl.formatMessage(tableTranslations.name),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`name-${enrolRequest.id}`} variant="body2">
              {enrolRequest.name}
            </Typography>
          );
        },
      },
    },
    ...basicColumns,
    {
      name: 'role',
      label: intl.formatMessage(tableTranslations.role),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`role-${enrolRequest.id}`} variant="body2">
              {sharedConstants.USER_ROLES.find(
                (role) => role.value === enrolRequest.role,
              )?.label ?? '-'}
            </Typography>
          );
        },
      },
    },
    {
      name: 'phantom',
      label: intl.formatMessage(tableTranslations.phantom),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const enrolRequest = enrolRequests[dataIndex];
          let phantomStatus: string;
          if (enrolRequest.phantom === null) {
            phantomStatus = '-';
          } else {
            phantomStatus = enrolRequest.phantom ? 'Yes' : 'No';
          }
          return (
            <Typography key={`phantom-${enrolRequest.id}`} variant="body2">
              {phantomStatus}
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
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`rejector-${enrolRequest.id}`} variant="body2">
              {enrolRequest.confirmedBy}
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
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`approvedAt-${enrolRequest.id}`} variant="body2">
              {enrolRequest.confirmedAt}
            </Typography>
          );
        },
      },
    },
  ];

  const rejectedEnrolRequestsColumns: TableColumns[] = [
    {
      name: 'name',
      label: intl.formatMessage(tableTranslations.name),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`name-${enrolRequest.id}`} variant="body2">
              {enrolRequest.name}
            </Typography>
          );
        },
      },
    },
    ...basicColumns,
    {
      name: 'rejector',
      label: intl.formatMessage(tableTranslations.rejector),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`rejector-${enrolRequest.id}`} variant="body2">
              {enrolRequest.confirmedBy}
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
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`rejectedAt-${enrolRequest.id}`} variant="body2">
              {enrolRequest.confirmedAt}
            </Typography>
          );
        },
      },
    },
  ];

  if (pendingEnrolRequests) {
    columns = pendingEnrolmentRequestsColumns;
  } else if (approvedEnrolRequests) {
    columns = approvedEnrolRequestsColumns;
  } else if (rejectedEnrolRequests) {
    columns = rejectedEnrolRequestsColumns;
  }

  return (
    <Box sx={{ margin: '12px 0px' }}>
      <DataTable
        title={title}
        data={enrolRequests}
        columns={columns}
        options={options}
        includeRowNumber
      />
    </Box>
  );
};

export default injectIntl(EnrolRequestsTable);
