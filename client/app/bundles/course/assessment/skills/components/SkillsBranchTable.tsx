import DataTable from 'lib/components/DataTable';
import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { TableColumns, TableRowMeta } from 'types/components/DataTable';
import {
  SkillBranchData,
  SkillData,
  SkillSettings,
} from 'types/course/assessment/skills/skills';
import { CSSProperties } from '@mui/styles';
import SkillsTable from './SkillsTable';
import SkillManagementButtons from './SkillManagementButtons';

interface Props extends WrappedComponentProps {
  data: SkillBranchData[];
  settings: SkillSettings;
  editSkillClick: (data: SkillData) => void;
  editSkillBranchClick: (data: SkillBranchData) => void;
}

const translations = defineMessages({
  actions: {
    id: 'course.assessment.skills.components.SkillsBranchTable.actions',
    defaultMessage: 'Actions',
  },
  uncategorised: {
    id: 'course.assessment.skills.components.SkillsBranchTable.uncategorised',
    defaultMessage: 'Uncategorised Skills',
  },
});

const SkillsBranchTable: FC<Props> = (props: Props) => {
  const { data, settings, intl, editSkillClick, editSkillBranchClick } = props;

  const columns: TableColumns[] = [
    {
      name: 'id',
      label: 'S/N',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        justifyCenter: true,
        setCellProps: () => ({ style: { width: '5%' } }),
        customBodyRenderLite: (_dataIndex: number) => _dataIndex + 1,
      },
    },
    {
      name: 'title',
      label: settings.headerTitle,
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({ style: { width: '10%' } }),
        customBodyRenderLite: (_dataIndex: number) =>
          data[_dataIndex].title ?? '',
      },
    },
    {
      name: 'description',
      label: settings.headerDescription,
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({ style: { width: '60%' } }),
        customBodyRenderLite: (_dataIndex: number) => (
          <div
            dangerouslySetInnerHTML={{
              __html:
                data[_dataIndex].description ??
                intl.formatMessage(translations.uncategorised),
            }}
          />
        ),
      },
    },
    {
      name: 'actions',
      label: intl.formatMessage(translations.actions),
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        setCellProps: (): CSSProperties => ({ style: { width: '35%' } }),
        customBodyRenderLite: (_dataIndex: number): JSX.Element => {
          const branch = data[_dataIndex];
          // Only display if branch is not uncategorised
          return branch.id !== -1 ? (
            <SkillManagementButtons
              id={branch.id}
              key={branch.id}
              isBranch
              canDestroy={branch.canDestroy}
              canUpdate={branch.canUpdate}
              editSkillClick={editSkillClick}
              editSkillBranchClick={editSkillBranchClick}
              data={branch}
            />
          ) : (
            <></>
          );
        },
      },
    },
  ];

  const options = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
    search: false,
    expandableRows: true,
    expandableRowsHeader: false,
    selectableRows: 'none',
    selectToolbarPlacement: 'none',
    viewColumns: false,
    rowsExpanded: data.map((branch: SkillBranchData, index) =>
      branch.skills && branch.skills.length !== 0 ? index : null,
    ),
    renderExpandableRow: (_, rowMeta: TableRowMeta): JSX.Element => {
      return (
        <tr>
          <td colSpan={5}>
            <SkillsTable
              intl={intl}
              data={data[rowMeta.rowIndex].skills ?? []}
              editSkillClick={editSkillClick}
            />
          </td>
        </tr>
      );
    },
  };

  return (
    <DataTable
      data={data}
      options={options}
      columns={columns}
    />
  );
};

export default injectIntl(SkillsBranchTable);
