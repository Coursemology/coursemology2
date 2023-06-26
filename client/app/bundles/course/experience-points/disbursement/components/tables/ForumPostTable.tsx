import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { CardContent, TableCell, TableRow, Typography } from '@mui/material';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { ForumDisbursementPostEntity } from 'types/course/disbursement';

import DataTable from 'lib/components/core/layouts/DataTable';
import Link from 'lib/components/core/Link';
import { getForumTopicURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { formatLongDateTime } from 'lib/moment';

interface Props extends WrappedComponentProps {
  posts: ForumDisbursementPostEntity[];
}

const translations = defineMessages({
  topicTitle: {
    id: 'course.experiencePoints.disbursement.ForumPostTable.topicTitle',
    defaultMessage: 'Topic Title',
  },
  voteTally: {
    id: 'course.experiencePoints.disbursement.ForumPostTable.voteTally',
    defaultMessage: 'Vote Tally',
  },
  datePosted: {
    id: 'course.experiencePoints.disbursement.ForumPostTable.datePosted',
    defaultMessage: 'Date Posted',
  },
});

const ForumPostTable: FC<Props> = (props: Props) => {
  const { intl, posts: data } = props;

  const columns: TableColumns[] = [
    {
      name: 'S/N',
      label: 'S/N',
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: { padding: '10px', textAlign: 'center' },
        }),
        setCellProps: () => ({
          style: {
            overflowWrap: 'anywhere',
            maxWidth: '3vw',
            minWidth: '3vw',
            padding: '5px 10px',
            textAlign: 'center',
          },
        }),
        customBodyRenderLite: (dataIndex): number => dataIndex + 1,
      },
    },
    {
      name: intl.formatMessage(translations.topicTitle),
      label: intl.formatMessage(translations.topicTitle),
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: { padding: '10px', textAlign: 'left' },
        }),
        setCellProps: () => ({
          style: {
            overflowWrap: 'anywhere',
            padding: '5px 10px',
            textAlign: 'left',
            width: '100%',
          },
        }),
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const post = data[dataIndex];
          return (
            <Link
              opensInNewTab
              to={getForumTopicURL(
                getCourseId(),
                post.forumSlug,
                post.topicSlug,
              )}
            >
              {post.title}
            </Link>
          );
        },
      },
    },
    {
      name: intl.formatMessage(translations.voteTally),
      label: intl.formatMessage(translations.voteTally),
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: {
            padding: '10px',
            textAlign: 'center',
          },
        }),
        setCellProps: () => ({
          style: {
            overflowWrap: 'anywhere',
            padding: '5px 10px',
            textAlign: 'center',
          },
        }),
        customBodyRenderLite: (dataIndex): JSX.Element => (
          <div style={{ width: 'max-content', minWidth: '70px' }}>
            {data[dataIndex].voteTally}
          </div>
        ),
      },
    },
    {
      name: intl.formatMessage(translations.datePosted),
      label: intl.formatMessage(translations.datePosted),
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: { padding: '10px', textAlign: 'center' },
        }),
        setCellProps: () => ({
          style: {
            overflowWrap: 'anywhere',
            padding: '5px 20px',
            textAlign: 'center',
            minWidth: 'max-content',
          },
        }),
        customBodyRenderLite: (_dataIndex): JSX.Element => (
          <div style={{ width: 'max-content' }}>
            {formatLongDateTime(data[_dataIndex].createdAt)}
          </div>
        ),
      },
    },
  ];

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
    search: false,
    selectableRows: 'none',
    selectToolbarPlacement: 'none',
    viewColumns: false,
    expandableRows: true,
    expandableRowsHeader: true,
    expandableRowsOnClick: true,
    renderExpandableRow: (_rowData, rowMeta) => (
      <TableRow>
        <TableCell colSpan={12}>
          <CardContent
            style={{
              minHeight: '10vh',
              width: '100%',
              overflow: 'auto',
              margin: 5,
              borderStyle: 'solid',
              borderWidth: 0.2,
              borderColor: '#eeeeee',
              borderRadius: 5,
              padding: '4px 4px',
            }}
          >
            <Typography
              dangerouslySetInnerHTML={{
                __html: data[rowMeta.rowIndex].content,
              }}
              style={{
                wordBreak: 'break-word',
              }}
              variant="body2"
            />
          </CardContent>
        </TableCell>
      </TableRow>
    ),
  };

  return (
    <DataTable columns={columns} data={data} options={options} withMargin />
  );
};

export default injectIntl(ForumPostTable);
