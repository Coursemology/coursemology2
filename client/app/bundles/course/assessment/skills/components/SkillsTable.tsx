import DataTable from "lib/components/DataTable";
import { FC } from "react";
import { defineMessages, WrappedComponentProps } from "react-intl";
import { TableColumns } from "types/components/DataTable";
import { SkillData } from "types/course/assessment/skills/skills";
import SkillManagementButtons from "./SkillManagementButtons";

interface Props extends WrappedComponentProps {
  data: SkillData[];
}

const translations = defineMessages({
  actions: {
    id: 'course.assessment.skills.component.SkillsTable.actions',
    defaultMessage: "Actions",
  },
});

const SkillsTable: FC<Props> = (props: Props) => {
  const { data, intl } = props;

  const columns: TableColumns[] = [
    {
      name: '',
      label: '',
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({ style: { minWidth: '160px', maxWidth: '160px' }}),
        customHeadRender: ()=>null,
      }
    },
    {
      name: 'title',
      label: '',
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({ style: { minWidth: '120px', maxWidth: '120px' }}),
        customHeadRender: ()=>null,
        customBodyRenderLite: (_dataIndex: number) => data[_dataIndex].title,
      }
    },
    {
      name: 'description',
      label: '',
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({ style: { minWidth: '600px', maxWidth: '600px' }}),
        customHeadRender: ()=>null,
        customBodyRenderLite: (_dataIndex: number) => <div dangerouslySetInnerHTML={{ __html: data[_dataIndex].description ?? ""}} /> ?? "",
      }
    },
    {
      name: 'actions',
      label: intl.formatMessage(translations.actions),
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({ style: { minWidth: '110px', maxWidth: '110px' }}),
        customHeadRender: ()=>null,
        customBodyRenderLite: (_dataIndex: number) => {
          const skill = data[_dataIndex];
          return (<SkillManagementButtons
            id={skill.id}
            isBranch={false}
            canDestroy={skill.canDestroy}
            canUpdate={skill.canUpdate}
          />);
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
    viewColumns: false,
    selectableRows: 'none',
  };

  return (
    <DataTable data={data} options={options} columns={columns}/>
  )
};

export default SkillsTable;