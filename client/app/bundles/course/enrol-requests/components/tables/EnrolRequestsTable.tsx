import { FC, memo, ReactElement } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { Checkbox, MenuItem, TextField, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import {
  EnrolRequestMiniEntity,
  EnrolRequestRowData,
} from 'types/course/enrolRequests';

import DataTable from 'lib/components/core/layouts/DataTable';
import Note from 'lib/components/core/Note';
import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import {
  COURSE_USER_ROLES,
  TIMELINE_ALGORITHMS,
} from 'lib/constants/sharedConstants';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import { useAppSelector } from 'lib/hooks/store';
import { formatLongDateTime } from 'lib/moment';
import tableTranslations from 'lib/translations/table';

import {
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';

interface Props extends WrappedComponentProps {
  title: string;
  enrolRequests: EnrolRequestMiniEntity[];
  pendingEnrolRequests?: boolean;
  approvedEnrolRequests?: boolean;
  rejectedEnrolRequests?: boolean;
  renderRowActionComponent?: (
    enrolRequest: EnrolRequestRowData,
  ) => ReactElement;
}

const translations = defineMessages({
  noEnrolRequests: {
    id: 'course.enrolRequests.EnrolRequestsTable.noEnrolRequests',
    defaultMessage: 'There are no {enrolRequestsType}',
  },
  approved: {
    id: 'course.enrolRequests.EnrolRequestsTable.approved',
    defaultMessage: 'approved',
  },
  rejected: {
    id: 'course.enrolRequests.EnrolRequestsTable.rejected',
    defaultMessage: 'rejected',
  },
  pending: {
    id: 'course.enrolRequests.EnrolRequestsTable.pending',
    defaultMessage: 'pending',
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
    pendingEnrolRequests = false,
    approvedEnrolRequests = false,
    rejectedEnrolRequests = false,
    renderRowActionComponent = null,
    intl,
  } = props;
  const permissions = useAppSelector(getManageCourseUserPermissions);
  const sharedData = useAppSelector(getManageCourseUsersSharedData);
  const defaultTimelineAlgorithm = sharedData.defaultTimelineAlgorithm;
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
      return intl.formatMessage(translations.approved);
    } else if (rejectedEnrolRequests) {
      return intl.formatMessage(translations.rejected);
    } else if (pendingEnrolRequests) {
      return intl.formatMessage(translations.pending);
    }
    return '';
    /* eslint-enable no-else-return */
  })();

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`createdAt-${enrolRequest.id}`} variant="body2">
              {enrolRequest.createdAt}
            </Typography>
          );
        },
      },
    },
  ];

  const pendingEnrolRequestsColumns: TableColumns[] = [
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
              alwaysEditable
              className="enrol_request_name"
              updateValue={updateValue}
              value={value}
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
              onChange={(e): void => updateValue(e.target.value)}
              select
              value={value || 'student'}
              variant="standard"
            >
              {Object.keys(COURSE_USER_ROLES).map((option) => (
                <MenuItem
                  key={`role-${enrolRequest.id}-${option}`}
                  value={option}
                >
                  {COURSE_USER_ROLES[option]}
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
              key={`checkbox_${enrolRequest.id}`}
              checked={value || false}
              id={`checkbox_${enrolRequest.id}`}
              onChange={(e): void => updateValue(e.target.checked)}
              style={styles.checkbox}
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
                    onChange={(e): void => updateValue(e.target.value)}
                    select
                    value={value || defaultTimelineAlgorithm}
                    variant="standard"
                  >
                    {TIMELINE_ALGORITHMS.map((option) => (
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
                const request = rebuildObjectFromRow(columns, rowData);
                return renderRowActionComponent(request as EnrolRequestRowData);
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`role-${enrolRequest.id}`} variant="body2">
              {enrolRequest.role ? COURSE_USER_ROLES[enrolRequest.role] : '-'}
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`approvedAt-${enrolRequest.id}`} variant="body2">
              {formatLongDateTime(enrolRequest.confirmedAt)}
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const enrolRequest = enrolRequests[dataIndex];
          return (
            <Typography key={`rejectedAt-${enrolRequest.id}`} variant="body2">
              {formatLongDateTime(enrolRequest.confirmedAt)}
            </Typography>
          );
        },
      },
    },
  ];

  if (pendingEnrolRequests) {
    columns = pendingEnrolRequestsColumns;
  } else if (approvedEnrolRequests) {
    columns = approvedEnrolRequestsColumns;
  } else if (rejectedEnrolRequests) {
    columns = rejectedEnrolRequestsColumns;
  }

  return (
    <DataTable
      columns={columns}
      data={enrolRequests}
      includeRowNumber
      options={options}
      title={title}
      withMargin
    />
  );
};

export default memo(injectIntl(EnrolRequestsTable), (prevProps, nextProps) => {
  return equal(prevProps.enrolRequests, nextProps.enrolRequests);
});
