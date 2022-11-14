import { FC, memo } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { DisbursementCourseUserMiniEntity } from 'types/course/disbursement';

import DataTable from 'lib/components/core/layouts/DataTable';
import { TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
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
    id: 'course.experience-points.disbursement.DisbursementTable.name',
    defaultMessage: 'Name',
  },
  pointsAwarded: {
    id: 'course.experience-points.disbursement.DisbursementTable.pointsAwarded',
    defaultMessage: 'Experience Points Awarded',
  },
  copy: {
    id: 'course.experience-points.disbursement.DisbursementTable.copy',
    defaultMessage: 'Copy value for all students',
  },
  remove: {
    id: 'course.experience-points.disbursement.DisbursementTable.remove',
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
        setCellProps: () => ({
          style: {
            overflowWrap: 'anywhere',
            maxWidth: '3vw',
            minWidth: '3vw',
            padding: '5px 14px',
          },
        }),
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
          style: { padding: '14px' },
        }),
        setCellProps: () => ({
          style: {
            overflowWrap: 'anywhere',
            padding: '5px 14px',
            width: '50vw',
          },
        }),
        customBodyRenderLite: (dataIndex): JSX.Element => (
          <a
            href={getCourseUserURL(getCourseId(), filteredUsers[dataIndex].id)}
            rel="noreferrer"
            target="_blank"
          >
            {filteredUsers[dataIndex].name}
          </a>
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
          style: { padding: '14px' },
        }),
        setCellProps: () => ({
          style: {
            overflowWrap: 'anywhere',
            width: '300px',
            padding: '5px 14px',
          },
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
          style: { padding: '14px' },
        }),
        setCellProps: () => ({
          style: { width: '30vw', padding: '0px' },
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
    rowsPerPage: TABLE_ROWS_PER_PAGE,
    rowsPerPageOptions: [TABLE_ROWS_PER_PAGE],
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
