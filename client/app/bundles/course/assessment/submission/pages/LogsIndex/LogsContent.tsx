import { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { LogsData } from 'types/course/assessment/submission/logs';

import DataTable from 'lib/components/core/layouts/DataTable';
import Note from 'lib/components/core/Note';
import useTranslation from 'lib/hooks/useTranslation';
import { formatMiniDateTime } from 'lib/moment';

import translations from './translations';

interface Props {
  with: LogsData[];
}

const LogsContent: FC<Props> = (props) => {
  const { with: data } = props;
  const { t } = useTranslation();

  if (data && data.length === 0) {
    return <Note message={<FormattedMessage {...translations.noLogs} />} />;
  }

  const formattedDateData = data.map((e) => {
    e.timestamp = formatMiniDateTime(e.timestamp);
    return e;
  });

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
    search: false,
    selectableRows: 'none',
    setRowProps: (_row, dataIndex, _rowIndex) => {
      const isValidAttempt = data[dataIndex].isValidAttempt;
      return { className: isValidAttempt ? '' : 'bg-red-100' };
    },
    viewColumns: false,
  };

  const columns: TableColumns[] = [
    {
      name: 'timestamp',
      label: t(translations.timestamp),
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: 'ipAddress',
      label: t(translations.ipAddress),
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: 'userAgent',
      label: t(translations.userAgent),
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: 'userSessionId',
      label: t(translations.userSessionId),
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: 'submissionSessionId',
      label: t(translations.submissionSessionId),
      options: {
        filter: false,
        sort: false,
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={formattedDateData}
      options={options}
      withMargin
    />
  );
};

export default LogsContent;
