import { CardContent, TableCell, TableRow, Typography } from '@mui/material';
import DataTable from 'lib/components/core/layouts/DataTable';
import { getForumTopicURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { formatLongDateTime } from 'lib/moment';
import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { ForumPostEntity } from 'types/course/disbursement';

interface Props extends WrappedComponentProps {
  posts: ForumPostEntity[];
}

const translations = defineMessages({
  topicTitle: {
    id: 'course.experience-points.disbursement.ForumPostTable.topicTitle',
    defaultMessage: 'Topic Title',
  },
  voteTally: {
    id: 'course.experience-points.disbursement.ForumPostTable.voteTally',
    defaultMessage: 'Vote Tally',
  },
  datePosted: {
    id: 'course.experience-points.disbursement.ForumPostTable.datePosted',
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
        customBodyRenderLite: (dataIndex: number): number => dataIndex + 1,
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
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const post = data[dataIndex];
          return (
            <a
              href={getForumTopicURL(
                getCourseId(),
                post.forumSlug,
                post.topicSlug,
              )}
            >
              {post.title}
            </a>
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
        customBodyRenderLite: (dataIndex: number): JSX.Element => (
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
        customBodyRenderLite: (_dataIndex: number): JSX.Element => (
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
              variant="body2"
              style={{
                wordBreak: 'break-word',
              }}
              dangerouslySetInnerHTML={{
                __html: data[rowMeta.rowIndex].content,
              }}
            />
          </CardContent>
        </TableCell>
      </TableRow>
    ),
  };

  return (
    <DataTable data={data} options={options} columns={columns} withMargin />
  );
};

export default injectIntl(ForumPostTable);
