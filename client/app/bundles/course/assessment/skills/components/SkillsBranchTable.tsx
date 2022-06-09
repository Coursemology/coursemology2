import DataTable from "lib/components/DataTable";
import { FC } from "react";
import { defineMessages, injectIntl, WrappedComponentProps } from "react-intl";
import { TableColumns, TableRowMeta } from "types/components/DataTable";
import { SkillBranchData, SkillSettings } from "types/course/assessment/skills/skills";
import SkillsTable from "./SkillsTable";
import SkillManagementButtons from "./SkillManagementButtons";

interface Props extends WrappedComponentProps {
  data: SkillBranchData[];
  settings: SkillSettings;
}

const translations = defineMessages({
  actions: {
    id: 'course.assessment.skills.component.SkillsTable.actions',
    defaultMessage: "Actions",
  },
  uncategorised: {
    id: 'course.assessment.skills.index.uncategorised',
    defaultMessage: 'Uncategorised Skills',
  },
});

const SkillsBranchTable: FC<Props> = (props: Props) => {
  const { data, settings, intl } = props;

  const columns: TableColumns[] = [
    {
      name: 'id',
      label: 'S/N',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        justifyCenter: true,
        setCellProps: () => ({ style: { width: '5%' }}),
        customBodyRenderLite: (_dataIndex: number) => _dataIndex + 1,
      }
    },
    {
      name: 'title',
      label: settings.headerTitle,
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({ style: { width: '10%' }}),
        customBodyRenderLite: (_dataIndex: number) => data[_dataIndex].title ?? intl.formatMessage(translations.uncategorised),
      }
    },
    {
      name: 'description',
      label: settings.headerDescription,
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({ style: { width: '60%' }}),
        customBodyRenderLite: (_dataIndex: number) => <div dangerouslySetInnerHTML={{ __html: data[_dataIndex].description ?? ""}} />,
      }
    },
    {
      name: 'actions',
      label: intl.formatMessage(translations.actions),
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        setCellProps: () => ({ style: { width: '35%' }}),
        customBodyRenderLite: (_dataIndex: number) => {
          const branch = data[_dataIndex];
          // Only display if branch is not uncategorised
          return ( branch.id != -1 ? 
            <SkillManagementButtons
              id={branch.id}
              isBranch={true}
              canDestroy={branch.canDestroy}
              canUpdate={branch.canUpdate}
            />
          : <></>
          )
        },
      }
    },
  ];

  const options = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
    search: false,
    expandableRows: true,
    viewColumns:false,
    rowsExpanded: data.map((_, i) => i),
    renderExpandableRow: (_, rowMeta: TableRowMeta) => {
      console.log(rowMeta);
      return (
        <tr>
          <td colSpan={5}>
            <SkillsTable intl={intl} data={data[rowMeta.rowIndex].skills ?? []} />
          </td>
        </tr>
      );
    },
  };

  return (
    <DataTable data={data} options={options} columns={columns}/>
  )
};

export default injectIntl(SkillsBranchTable);