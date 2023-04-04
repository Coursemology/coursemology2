import { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import { red } from '@mui/material/colors';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { LogsData } from 'types/course/assessment/submission/logs';

import DataTable from 'lib/components/core/layouts/DataTable';
import Note from 'lib/components/core/Note';

import translations from './translations';

interface Props {
  with: LogsData[];
}

const LogsContent: FC<Props> = (props) => {
  const { with: data } = props;

  if (data && data.length === 0) {
    return <Note message={<FormattedMessage {...translations.noLogs} />} />;
  }

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
    search: false,
    selectableRows: 'none',
    setRowProps: (_row, dataIndex, _rowIndex) => {
      const validAttempt = data[dataIndex].validAttempt;
      let backgroundColor: unknown = null;

      if (validAttempt) {
        backgroundColor = '#ffffff';
      } else {
        backgroundColor = red[100];
      }
      return { style: { background: backgroundColor } };
    },
    viewColumns: false,
  };

  const columns: TableColumns[] = [
    {
      name: 'timestamp',
      label: 'Timestamp',
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: 'ipAddress',
      label: 'IP Address',
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: 'userAgent',
      label: 'User Agent',
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: 'userSessionId',
      label: 'User Session ID',
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: 'submissionSessionId',
      label: 'Submission Session ID',
      options: {
        filter: false,
        sort: false,
      },
    },
  ];

  return (
    <DataTable columns={columns} data={data} options={options} withMargin />
  );
};

export default LogsContent;
