import DataTable from 'lib/components/DataTable';
import { FC } from 'react';
import { defineMessages, WrappedComponentProps } from 'react-intl';
import { TableColumns } from 'types/components/DataTable';
import { SkillData } from 'types/course/assessment/skills/skills';
import SkillManagementButtons from './SkillManagementButtons';

interface Props extends WrappedComponentProps {
  data: SkillData[];
  editSkillClick: (data: SkillData) => void;
}

const translations = defineMessages({
  actions: {
    id: 'course.assessment.skills.components.SkillsTable.actions',
    defaultMessage: 'Actions',
  },
  noSkill: {
    id: 'course.assessment.skills.index.SkillsTable.noSkill',
    defaultMessage: 'Sorry, no skill found under this skill branch.',
  },
});

const SkillsTable: FC<Props> = (props: Props) => {
  const { data, intl, editSkillClick } = props;

  const columns: TableColumns[] = [
    {
      name: 'title',
      label: '',
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({
          style: { minWidth: '120px', maxWidth: '120px' },
        }),
        customHeadRender: () => null,
        customBodyRenderLite: (_dataIndex: number) => data[_dataIndex].title,
      },
    },
    {
      name: 'description',
      label: '',
      options: {
        filter: false,
        sort: false,
        customHeadRender: () => null,
        customBodyRenderLite: (_dataIndex: number) =>
          (
            <div
              dangerouslySetInnerHTML={{
                __html: data[_dataIndex].description ?? '',
              }}
            />
          ) ?? '',
      },
    },
    {
      name: 'actions',
      label: intl.formatMessage(translations.actions),
      options: {
        filter: false,
        sort: false,
        customHeadRender: () => null,
        customBodyRenderLite: (_dataIndex: number): JSX.Element => {
          const skill = data[_dataIndex];
          return (
            <SkillManagementButtons
              id={skill.id}
              key={skill.id}
              isBranch={false}
              canDestroy={skill.canDestroy}
              canUpdate={skill.canUpdate}
              editSkillClick={editSkillClick}
              data={skill}
            />
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
    viewColumns: false,
    selectableRows: 'none',
    textLabels: {
      body: {
        noMatch: intl.formatMessage(translations.noSkill),
      },
    },
  };

  return <DataTable data={data} options={options} columns={columns} />;
};

export default SkillsTable;
