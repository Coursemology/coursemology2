import { FC, memo } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { Tooltip } from 'react-tooltip';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { ForumDisbursementUserEntity } from 'types/course/disbursement';

import DataTable from 'lib/components/core/layouts/DataTable';
import Link from 'lib/components/core/Link';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

import PointField from '../fields/PointField';

interface Props extends WrappedComponentProps {
  forumUsers: ForumDisbursementUserEntity[];
  onPostClick: (user: ForumDisbursementUserEntity) => void;
}

const translations = defineMessages({
  name: {
    id: 'course.experiencePoints.disbursement.ForumDisbursementTable.name',
    defaultMessage: 'Name',
  },
  level: {
    id: 'course.experiencePoints.disbursement.ForumDisbursementTable.level',
    defaultMessage: 'Level',
  },
  exp: {
    id: 'course.experiencePoints.disbursement.ForumDisbursementTable.exp',
    defaultMessage: 'Experience Points',
  },
  postCount: {
    id: 'course.experiencePoints.disbursement.ForumDisbursementTable.postCount',
    defaultMessage: 'Post Count',
  },
  voteTally: {
    id: 'course.experiencePoints.disbursement.ForumDisbursementTable.voteTally',
    defaultMessage: 'Vote Tally',
  },
  pointsAwarded: {
    id: 'course.experiencePoints.disbursement.ForumDisbursementTable.pointsAwarded',
    defaultMessage: 'EXP Awarded',
  },
  viewPosts: {
    id: 'course.experiencePoints.disbursement.ForumDisbursementForm.viewPosts',
    defaultMessage: 'View Forum Posts',
  },
});

const ForumDisbursementTable: FC<Props> = (props: Props) => {
  const { intl, forumUsers, onPostClick } = props;

  const columns: TableColumns[] = [
    {
      name: 'S/N',
      label: 'S/N',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        customBodyRenderLite: (dataIndex): number => dataIndex + 1,
      },
    },
    {
      name: intl.formatMessage(translations.name),
      label: intl.formatMessage(translations.name),
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          className: 'p-2.5',
        }),
        setCellProps: () => ({
          className: 'overflow-wrap-anywhere p-1.5 w-[20vw]',
        }),
        customBodyRenderLite: (dataIndex): JSX.Element => (
          <Link
            opensInNewTab
            to={getCourseUserURL(getCourseId(), forumUsers[dataIndex].id)}
          >
            {forumUsers[dataIndex].name}
          </Link>
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
          className: 'p-3 text-end',
        }),
        setCellProps: () => ({
          className: 'overflow-wrap-anywhere p-1.5 text-end',
        }),
        customBodyRenderLite: (dataIndex): string =>
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
          className: 'p-3 text-end',
        }),
        setCellProps: () => ({
          className: 'overflow-wrap-anywhere p-1.5 text-end',
        }),
        customBodyRenderLite: (dataIndex): string =>
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
          className: 'p-3 text-end',
        }),
        setCellProps: () => ({
          className: 'overflow-wrap-anywhere p-1.5 text-end',
        }),
        customBodyRenderLite: (dataIndex): JSX.Element => (
          <>
            {dataIndex === 0 && (
              <Tooltip id="view-posts">
                <FormattedMessage {...translations.viewPosts} />
              </Tooltip>
            )}

            <Link
              className={`view-posts-${forumUsers[dataIndex].id}`}
              data-tooltip-id="view-posts"
              onClick={(): void => onPostClick(forumUsers[dataIndex])}
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
          className: 'p-3 text-end',
        }),
        setCellProps: () => ({
          className: 'overflow-wrap-anywhere w-[8vw] p-1.5 p-1.5 text-end',
        }),
        customBodyRenderLite: (dataIndex): string =>
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
          className: 'ml-9',
        }),
        setCellProps: (_, rowIndex: number) => ({
          className: 'course_user overflow-wrap-anywhere ml-5 p-1 p-0',
          id: `course_user_${forumUsers[rowIndex].id}`,
        }),
        customBodyRenderLite: (dataIndex): JSX.Element => (
          <PointField
            key={forumUsers[dataIndex].id}
            courseUserId={forumUsers[dataIndex].id}
          />
        ),
      },
    },
  ];

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: true,
    rowsPerPage: DEFAULT_TABLE_ROWS_PER_PAGE,
    rowsPerPageOptions: [DEFAULT_TABLE_ROWS_PER_PAGE],
    print: false,
    search: false,
    selectableRows: 'none',
    selectToolbarPlacement: 'none',
    viewColumns: false,
  };

  return (
    <DataTable
      columns={columns}
      data={forumUsers}
      options={options}
      withMargin
    />
  );
};

export default memo(
  injectIntl(ForumDisbursementTable),
  (prevProps, nextProps) => equal(prevProps.forumUsers, nextProps.forumUsers),
);
