import { FC, memo } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { DisbursementCourseUserMiniEntity } from 'types/course/disbursement';

import DataTable from 'lib/components/core/layouts/DataTable';
import Link from 'lib/components/core/Link';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

import DuplicateButton from '../buttons/DuplicateButton';
import RemoveAllButton from '../buttons/RemoveAllButton';
import PointField from '../fields/PointField';

interface Props extends WrappedComponentProps {
  filteredUsers: DisbursementCourseUserMiniEntity[];
  onClickRemove: () => void;
  onClickCopy: () => void;
}

const translations = defineMessages({
  name: {
    id: 'course.experiencePoints.disbursement.DisbursementTable.name',
    defaultMessage: 'Name',
  },
  pointsAwarded: {
    id: 'course.experiencePoints.disbursement.DisbursementTable.pointsAwarded',
    defaultMessage: 'EXP Awarded',
  },
  copy: {
    id: 'course.experiencePoints.disbursement.DisbursementTable.copy',
    defaultMessage: 'Copy value for all students',
  },
  remove: {
    id: 'course.experiencePoints.disbursement.DisbursementTable.remove',
    defaultMessage: 'Remove value for all students',
  },
});

const DisbursementTable: FC<Props> = (props: Props) => {
  const { filteredUsers, onClickCopy, onClickRemove, intl } = props;

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
          className: 'p-3',
        }),
        setCellProps: () => ({
          className: 'overflow-wrap-anywhere p-1.5 w-[43vw]',
        }),
        customBodyRenderLite: (dataIndex): JSX.Element => (
          <Link
            opensInNewTab
            to={getCourseUserURL(getCourseId(), filteredUsers[dataIndex].id)}
          >
            {filteredUsers[dataIndex].name}
          </Link>
        ),
      },
    },
    {
      name: intl.formatMessage(translations.pointsAwarded),
      label: intl.formatMessage(translations.pointsAwarded),
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          className: 'p-3',
        }),
        setCellProps: () => ({
          className: 'overflow-wrap-anywhere w-72 p-1.5',
        }),
        customBodyRenderLite: (dataIndex): JSX.Element => (
          <PointField
            key={filteredUsers[dataIndex].id}
            courseUserId={filteredUsers[dataIndex].id}
          />
        ),
      },
    },
    {
      name: '',
      label: '',
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          className: 'p-0',
        }),
        setCellProps: () => ({
          className: 'w-[45vw] p-0',
        }),
        customBodyRenderLite: (dataIndex): JSX.Element | null => {
          if (dataIndex === 0) {
            return (
              <>
                <DuplicateButton
                  className="experience-points-disbursement-copy-button"
                  disabled={false}
                  onClick={onClickCopy}
                  title={intl.formatMessage(translations.copy)}
                />
                <RemoveAllButton
                  className="experience-points-disbursement-remove-button"
                  disabled={false}
                  onClick={onClickRemove}
                  title={intl.formatMessage(translations.remove)}
                />
              </>
            );
          }
          return null;
        },
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
    setRowProps: (_row, dataIndex, _rowIndex) => ({
      className: `course_user_${filteredUsers[dataIndex].id}`,
    }),
  };

  return (
    <DataTable
      columns={columns}
      data={filteredUsers}
      options={options}
      withMargin
    />
  );
};

export default injectIntl(
  memo(DisbursementTable, (prevProps, nextProps) =>
    equal(prevProps.filteredUsers, nextProps.filteredUsers),
  ),
);
