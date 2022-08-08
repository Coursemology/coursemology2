import DataTable from 'lib/components/DataTable';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { CourseUserBasicMiniEntity } from 'types/course/courseUsers';
import DuplicateButton from '../buttons/DuplicateButton';
import RemoveAllButton from '../buttons/RemoveAllButton';

interface Props extends WrappedComponentProps {
  filteredUsers: CourseUserBasicMiniEntity[];
  pointTextFieldArray: JSX.Element[];
  onClickRemove: () => void;
  onClickCopy: () => void;
  indexList: number[];
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
  const {
    filteredUsers: data,
    pointTextFieldArray,
    indexList,
    onClickCopy,
    onClickRemove,
    intl,
  } = props;
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
          style: {
            overflowWrap: 'anywhere',
            padding: '5px 14px',
            width: '50vw',
          },
        }),
        customBodyRenderLite: (dataIndex: number): JSX.Element => (
          <a href={getCourseUserURL(getCourseId(), data[dataIndex].id)}>
            {data[dataIndex].name}
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
        customBodyRenderLite: (dataIndex: number): JSX.Element =>
          renderFilteredPointTextFields[indexList[dataIndex]],
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
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          if (dataIndex === 0) {
            return (
              <>
                <DuplicateButton
                  disabled={false}
                  onClick={onClickCopy}
                  title={intl.formatMessage(translations.copy)}
                  className="experience-points-disbursement-copy-button"
                />
                <RemoveAllButton
                  disabled={false}
                  onClick={onClickRemove}
                  title={intl.formatMessage(translations.remove)}
                  className="experience-points-disbursement-remove-button"
                />
              </>
            );
          }
          return <></>;
        },
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
    setRowProps: (_row, dataIndex, _rowIndex) => ({
      className: `course_user_${data[dataIndex].id}`,
    }),
  };

  return (
    <DataTable data={data} options={options} columns={columns} height="10px" />
  );
};

export default injectIntl(DisbursementTable);
