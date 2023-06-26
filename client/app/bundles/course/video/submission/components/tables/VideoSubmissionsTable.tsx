import { FC } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { VideoSubmissionListData } from 'types/course/video/submissions';

import DataTable from 'lib/components/core/layouts/DataTable';
import LinearProgressWithLabel from 'lib/components/core/LinearProgressWithLabel';
import Link from 'lib/components/core/Link';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import { getVideoSubmissionURL } from 'lib/helpers/url-builders';
import { getCourseId, getVideoId } from 'lib/helpers/url-helpers';
import { formatShortDateTime } from 'lib/moment';
import tableTranslations from 'lib/translations/table';

interface Props extends WrappedComponentProps {
  title: string;
  videoSubmissions: VideoSubmissionListData[];
}

const VideoSubmissionsTable: FC<Props> = (props) => {
  const { title, videoSubmissions, intl } = props;

  const options: TableOptions = {
    download: false,
    filter: false,
    jumpToPage: true,
    pagination: true,
    print: false,
    rowsPerPage: DEFAULT_TABLE_ROWS_PER_PAGE,
    rowsPerPageOptions: [DEFAULT_TABLE_ROWS_PER_PAGE],
    search: true,
    searchPlaceholder: 'Search by Name',
    selectableRows: 'none',
    setTableProps: (): object => {
      return { size: 'small' };
    },
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        className: `course_user_${videoSubmissions[dataIndex].courseUserId}`,
      };
    },
    viewColumns: false,
  };

  const columns: TableColumns[] = [
    {
      name: 'courseUserName',
      label: intl.formatMessage(tableTranslations.name),
      options: {
        alignCenter: false,
        sort: false,
      },
    },
    {
      name: 'id',
      label: intl.formatMessage(tableTranslations.status),
      options: {
        filter: false,
        sort: false,
        search: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const submissionId = videoSubmissions[dataIndex].id;
          return submissionId ? (
            <Link
              to={getVideoSubmissionURL(
                getCourseId(),
                getVideoId(),
                submissionId,
              )}
            >
              Watched
            </Link>
          ) : (
            <span className="text-red-500">Has Not Started</span>
          );
        },
      },
    },
    {
      name: 'createdAt',
      label: intl.formatMessage(tableTranslations.watchedAt),
      options: {
        alignCenter: true,
        sort: false,
        search: false,
        customBodyRenderLite: (dataIndex): string => {
          const submission = videoSubmissions[dataIndex];
          const createdAt = submission.createdAt!;
          return createdAt ? formatShortDateTime(createdAt) : '-';
        },
      },
    },
    {
      name: 'percentWatched',
      label: intl.formatMessage(tableTranslations.percentWatched),
      options: {
        alignCenter: false,
        sort: false,
        search: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const submission = videoSubmissions[dataIndex];
          const percentWatched = submission.percentWatched!;
          return <LinearProgressWithLabel value={percentWatched} />;
        },
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={videoSubmissions}
      includeRowNumber
      options={options}
      title={title}
      withMargin
    />
  );
};

export default injectIntl(VideoSubmissionsTable);
