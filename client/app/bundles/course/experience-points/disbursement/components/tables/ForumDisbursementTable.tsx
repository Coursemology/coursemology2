import { Link } from '@mui/material';
import equal from 'fast-deep-equal';
import DataTable from 'lib/components/DataTable';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { FC, memo } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import ReactTooltip from 'react-tooltip';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { ForumDisbursementUserEntity } from 'types/course/disbursement';

interface Props extends WrappedComponentProps {
  forumUsers: ForumDisbursementUserEntity[];
  pointTextFieldArray: JSX.Element[];
  onPostClick: (user: ForumDisbursementUserEntity) => void;
}

const translations = defineMessages({
  name: {
    id: 'course.experience-points.disbursement.ForumDisbursementTable.name',
    defaultMessage: 'Name',
  },
  level: {
    id: 'course.experience-points.disbursement.ForumDisbursementTable.level',
    defaultMessage: 'Level',
  },
  exp: {
    id: 'course.experience-points.disbursement.ForumDisbursementTable.exp',
    defaultMessage: 'Experience Points',
  },
  postCount: {
    id: 'course.experience-points.disbursement.ForumDisbursementTable.postCount',
    defaultMessage: 'Post Count',
  },
  voteTally: {
    id: 'course.experience-points.disbursement.ForumDisbursementTable.voteTally',
    defaultMessage: 'Vote Tally',
  },
  pointsAwarded: {
    id: 'course.experience-points.disbursement.ForumDisbursementTable.pointsAwarded',
    defaultMessage: 'Experience Points Awarded',
  },
  viewPosts: {
    id: 'course.experience-points.disbursement.ForumDisbursementForm.viewPosts',
    defaultMessage: 'View Forum Posts',
  },
});

const ForumDisbursementTable: FC<Props> = (props: Props) => {
  const { intl, forumUsers, pointTextFieldArray, onPostClick } = props;
  const renderFilteredPointTextFields = pointTextFieldArray;

  const columns: TableColumns[] = [
    {
      name: 'S/N',
      label: 'S/N',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        setCellProps: () => ({
          style: {
            overflowWrap: 'anywhere',
            maxWidth: '3vw',
            minWidth: '3vw',
            padding: '5px 14px',
          },
        }),
        customBodyRenderLite: (dataIndex: number): number => dataIndex + 1,
      },
    },
    {
      name: intl.formatMessage(translations.name),
      label: intl.formatMessage(translations.name),
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: { padding: '14px' },
        }),
        setCellProps: () => ({
          style: { overflowWrap: 'anywhere', padding: '5px 14px' },
        }),
        customBodyRenderLite: (dataIndex: number): JSX.Element => (
          <a href={getCourseUserURL(getCourseId(), forumUsers[dataIndex].id)}>
            {forumUsers[dataIndex].name}
          </a>
        ),
      },
    },
    {
      name: intl.formatMessage(translations.level),
      label: intl.formatMessage(translations.level),
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: { padding: '14px', textAlign: 'end' },
        }),
        setCellProps: () => ({
          style: {
            overflowWrap: 'anywhere',
            padding: '5px 14px',
            textAlign: 'end',
          },
        }),
        customBodyRenderLite: (dataIndex: number): string =>
          forumUsers[dataIndex].level.toString(),
      },
    },
    {
      name: intl.formatMessage(translations.exp),
      label: intl.formatMessage(translations.exp),
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: { padding: '14px', textAlign: 'end' },
        }),
        setCellProps: () => ({
          style: {
            overflowWrap: 'anywhere',
            padding: '5px 14px',
            textAlign: 'end',
          },
        }),
        customBodyRenderLite: (dataIndex: number): string =>
          forumUsers[dataIndex].exp.toString(),
      },
    },
    {
      name: intl.formatMessage(translations.postCount),
      label: intl.formatMessage(translations.postCount),
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: { padding: '14px', textAlign: 'end' },
        }),
        setCellProps: () => ({
          style: {
            overflowWrap: 'anywhere',
            padding: '5px 14px',
            textAlign: 'end',
          },
        }),
        customBodyRenderLite: (dataIndex: number): JSX.Element => (
          <>
            {dataIndex === 0 && (
              <ReactTooltip id="view-posts">
                <FormattedMessage {...translations.viewPosts} />
              </ReactTooltip>
            )}
            <Link
              component="button"
              className={`view-posts-${forumUsers[dataIndex].id}`}
              form=""
              onClick={(): void => {
                onPostClick(forumUsers[dataIndex]);
              }}
              data-tip
              data-for="view-posts"
            >
              {forumUsers[dataIndex].postCount}
            </Link>
          </>
        ),
      },
    },
    {
      name: intl.formatMessage(translations.voteTally),
      label: intl.formatMessage(translations.voteTally),
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: { padding: '14px', textAlign: 'end' },
        }),
        setCellProps: () => ({
          style: {
            overflowWrap: 'anywhere',
            padding: '5px 14px',
            textAlign: 'end',
          },
        }),
        customBodyRenderLite: (dataIndex: number): string =>
          forumUsers[dataIndex].voteTally.toString(),
      },
    },
    {
      name: intl.formatMessage(translations.pointsAwarded),
      label: intl.formatMessage(translations.pointsAwarded),
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: { padding: '14px' },
        }),
        setCellProps: (_, rowIndex: number) => ({
          className: 'course_user',
          id: `course_user_${forumUsers[rowIndex].id}`,
          style: { overflowWrap: 'anywhere', padding: '5px 14px' },
        }),
        customBodyRenderLite: (dataIndex: number): JSX.Element =>
          renderFilteredPointTextFields[dataIndex],
      },
    },
  ];

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: true,
    rowsPerPage: 100,
    rowsPerPageOptions: [100],
    print: false,
    search: false,
    selectableRows: 'none',
    selectToolbarPlacement: 'none',
    viewColumns: false,
  };

  return (
    <DataTable
      data={forumUsers}
      options={options}
      columns={columns}
      height="10px"
    />
  );
};

export default memo(
  injectIntl(ForumDisbursementTable),
  (prevProps, nextProps) => equal(prevProps.forumUsers, nextProps.forumUsers),
);
