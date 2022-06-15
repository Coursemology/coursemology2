import DataTable from 'lib/components/DataTable';
import { FC, useEffect, useRef, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { TableColumns } from 'types/components/DataTable';
import {
  SkillBranchData,
  SkillData,
} from 'types/course/assessment/skills/skills';
import { Slide, Typography, Box } from '@mui/material';
import { CSSProperties } from '@mui/styles';
import SkillManagementButtons from './SkillManagementButtons';
import { TableTypes } from '../types';

interface Props extends WrappedComponentProps {
  data: SkillBranchData[];
  tableType: TableTypes;
  branchIndex: number;
  changeBranch: (index: number) => void;
  editClick: (data: SkillBranchData | SkillData) => void;
}

const translations = defineMessages({
  uncategorised: {
    id: 'course.assessment.skills.components.SkillsBranchTable.uncategorised',
    defaultMessage: 'Uncategorised Skills',
  },
  branch: {
    id: 'course.assessment.skills.components.SkillsBranchTable.branch',
    defaultMessage: 'Skill Branches',
  },
  skills: {
    id: 'course.assessment.skills.components.SkillsBranchTable.skills',
    defaultMessage: 'Skills',
  },
  noSkill: {
    id: 'course.assessment.skills.components.SkillsBranchTable.noSkill',
    defaultMessage: 'Sorry, no skill found under this skill branch.',
  },
  noBranchSelected: {
    id: 'course.assessment.skills.components.SkillsBranchTable.noBranchSelected',
    defaultMessage: 'No Skill Branch has been selected.',
  },
  noBranch: {
    id: 'course.assessment.skills.components.SkillsBranchTable.noBranch',
    defaultMessage: 'There are no skill branches.',
  },
});

const SkillsBranchTable: FC<Props> = (props: Props) => {
  const { data, intl, tableType, editClick, changeBranch, branchIndex } = props;
  const [indexSelected, setIndexSelected] = useState(-1);
  const containerRef = useRef(null); // used for Slide MUI element

  useEffect(() => {
    if (tableType === TableTypes.Skills && branchIndex !== -1) {
      setIndexSelected(-1);
    }
  }, [branchIndex]);

  let tableData = data;
  if (tableType === TableTypes.Skills) {
    tableData =
      branchIndex !== -1 && data[branchIndex]
        ? data[branchIndex].skills ?? []
        : [];
  }

  const name =
    branchIndex !== -1 && data[branchIndex] && data[branchIndex].title
      ? `${data[branchIndex].title} - `
      : '';

  const columns: TableColumns[] = [
    {
      name: 'name',
      label:
        tableType === TableTypes.SkillBranches
          ? intl.formatMessage(translations.branch)
          : name + intl.formatMessage(translations.skills),
      options: {
        filter: false,
        sort: false,
        alignCenter: false,
        setCellProps: () => ({
          style: { overflowWrap: 'anywhere' },
        }),
        customBodyRenderLite: (_dataIndex: number): string => {
          if (tableType === TableTypes.Skills) {
            return tableData[_dataIndex].title;
          }
          if (tableData.length === 0) {
            return intl.formatMessage(translations.noBranch);
          }
          return (
            tableData[_dataIndex].title ??
            intl.formatMessage(translations.uncategorised)
          );
        },
      },
    },
  ];

  if (tableType === TableTypes.SkillBranches) {
    columns.push({
      name: '',
      label: '',
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({
          style: { textAlign: 'right', padding: '8px 14px' },
        }),
        customBodyRenderLite: (_dataIndex: number) => (
          <span className="fa fa-chevron-right" />
        ),
      },
    });
  }

  const isOpen =
    indexSelected !== -1 &&
    tableData[indexSelected] &&
    tableData[indexSelected].id !== -1;

  const options = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
    search: false,
    selectableRows: 'none',
    selectToolbarPlacement: 'none',
    viewColumns: false,
    tableBodyHeight: !isOpen ? '70vh' : '50vh',
    textLabels: {
      body: {
        noMatch:
          branchIndex === -1
            ? intl.formatMessage(translations.noBranchSelected)
            : intl.formatMessage(translations.noSkill),
      },
    },
    setRowProps: (_, dataIndex: number): CSSProperties => {
      if (dataIndex === indexSelected) {
        return { style: { backgroundColor: '#eeeeee', cursor: 'pointer' } };
      }
      return { style: { cursor: 'pointer' } };
    },
    onRowClick: (_, rowMeta: { dataIndex: number; rowIndex: number }): void => {
      const index = rowMeta.dataIndex;
      if (tableType === TableTypes.SkillBranches) {
        changeBranch(index);
      }
      setIndexSelected(index);
    },
    customFooter: (): JSX.Element => {
      return (
        <Box
          style={{
            overflow: 'hidden',
            height: '20vh',
            display: isOpen ? 'block' : 'none',
          }}
          ref={containerRef}
        >
          <Slide
            appear
            container={containerRef.current}
            direction="up"
            in={isOpen}
            style={{
              padding: '8px 14px',
              overflow: 'auto',
              maxHeight: '20vh',
              minHeight: '20vh',
              borderRadius: '16px',
              borderTop: '1px solid #aaaaaa',
            }}
          >
            <Box>
              {isOpen ? (
                <>
                  <Box display="flex">
                    <Typography
                      variant="subtitle1"
                      style={{
                        alignSelf: 'center',
                        marginRight: 'auto',
                        wordBreak: 'break-word',
                      }}
                    >
                      {tableData[indexSelected].title}
                    </Typography>
                    <SkillManagementButtons
                      id={tableData[indexSelected].id}
                      key={tableData[indexSelected].id}
                      isBranch={tableType === TableTypes.SkillBranches}
                      canDestroy={tableData[indexSelected].canDestroy}
                      canUpdate={tableData[indexSelected].canUpdate}
                      editClick={editClick}
                      data={tableData[indexSelected]}
                    />
                  </Box>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: tableData[indexSelected].description ?? '',
                    }}
                    style={{
                      borderTop: '1px solid #e0e0e0',
                      wordBreak: 'break-word',
                    }}
                  />
                </>
              ) : (
                <></>
              )}
            </Box>
          </Slide>
        </Box>
      );
    },
  };

  return (
    <DataTable
      data={tableData}
      options={options}
      columns={columns}
      height="30px"
    />
  );
};

export default injectIntl(SkillsBranchTable);
