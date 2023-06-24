import { FC, memo, useEffect, useRef, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { Add, ChevronRight } from '@mui/icons-material';
import {
  Box,
  Button,
  CardContent,
  Slide,
  TableCell,
  TableFooter,
  TableRow,
  Typography,
} from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import {
  SkillBranchMiniEntity,
  SkillMiniEntity,
} from 'types/course/assessment/skills/skills';

import DataTable from 'lib/components/core/layouts/DataTable';
import Note from 'lib/components/core/Note';

import { TableEnum } from '../../types';
import SkillManagementButtons from '../buttons/SkillManagementButtons';

interface Props extends WrappedComponentProps {
  data: SkillBranchMiniEntity[];
  tableType: TableEnum;
  skillBranchIndex: number;
  skillIndex: number;
  changeSkillBranch: (index: number) => void;
  editClick: (data: SkillBranchMiniEntity | SkillMiniEntity) => void;
  addClick: () => void;
  addDisabled: boolean;
}

const translations = defineMessages({
  uncategorised: {
    id: 'course.assessment.skills.SkillsTable.uncategorised',
    defaultMessage: 'Uncategorised Skills',
  },
  branch: {
    id: 'course.assessment.skills.SkillsTable.branch',
    defaultMessage: 'Skill Branches',
  },
  skills: {
    id: 'course.assessment.skills.SkillsTable.skills',
    defaultMessage: 'Skills',
  },
  noSkill: {
    id: 'course.assessment.skills.SkillsTable.noSkill',
    defaultMessage: 'Sorry, no skill found under this skill branch.',
  },
  noBranchSelected: {
    id: 'course.assessment.skills.SkillsTable.noBranchSelected',
    defaultMessage: 'No Skill Branch has been selected.',
  },
  noBranch: {
    id: 'course.assessment.skills.SkillsTable.noBranch',
    defaultMessage: 'There are no skill branches.',
  },
  addSkill: {
    id: 'course.assessment.skills.SkillsTable.addSkill',
    defaultMessage: 'Skill',
  },
  addSkillBranch: {
    id: 'course.assessment.skills.SkillsTable.addSkillBranch',
    defaultMessage: 'Skill Branch',
  },
});

const SkillsTable: FC<Props> = (props: Props) => {
  const {
    data,
    intl,
    tableType,
    editClick,
    changeSkillBranch,
    skillBranchIndex,
    skillIndex,
    addClick,
    addDisabled,
  } = props;
  const [indexSelected, setIndexSelected] = useState(-1);
  const containerRef = useRef(null); // used for Slide MUI element

  useEffect(() => {
    if (tableType === TableEnum.Skills) {
      setIndexSelected(skillIndex);
    }
    if (tableType === TableEnum.SkillBranches) {
      setIndexSelected(skillBranchIndex);
    }
  }, [skillBranchIndex, skillIndex]);

  let tableData = [] as SkillBranchMiniEntity[] | SkillMiniEntity[];
  if (tableType === TableEnum.Skills) {
    tableData =
      skillBranchIndex !== -1 && data[skillBranchIndex]
        ? data[skillBranchIndex].skills ?? []
        : [];
  } else {
    tableData = data;
  }

  const name =
    skillBranchIndex !== -1 &&
    data[skillBranchIndex] &&
    data[skillBranchIndex].title
      ? `${data[skillBranchIndex].title} - `
      : '';

  const columns: TableColumns[] = [
    {
      name: 'name',
      label:
        tableType === TableEnum.SkillBranches
          ? intl.formatMessage(translations.branch)
          : name + intl.formatMessage(translations.skills),
      options: {
        filter: false,
        sort: false,
        alignCenter: false,
        setCellProps: () => ({
          style: { overflowWrap: 'anywhere' },
        }),
        customBodyRenderLite: (dataIndex): JSX.Element => {
          let title = '';
          if (tableType === TableEnum.Skills) {
            return (
              <div className="skill" id={`skill_${tableData[dataIndex].id}`}>
                {tableData[dataIndex].title}
              </div>
            );
          }
          if (tableData.length === 0) {
            return <Note message={intl.formatMessage(translations.noBranch)} />;
          }
          title =
            tableData[dataIndex].title ??
            intl.formatMessage(translations.uncategorised);
          return (
            <div
              className="skill_branch"
              id={`skill_branch_${tableData[dataIndex].id}`}
            >
              {title}
            </div>
          );
        },
      },
    },
    {
      name: 'icon',
      label: '',
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: { textAlign: 'right' },
        }),
        customHeadLabelRender: () => (
          <Button
            className={
              tableType === TableEnum.Skills
                ? 'new-skill-button'
                : 'new-skill-branch-button'
            }
            color="primary"
            disabled={addDisabled}
            onClick={addClick}
            style={{
              background: 'white',
              fontSize: 14,
              marginLeft: 12,
              whiteSpace: 'nowrap',
            }}
            variant="outlined"
          >
            <Add />
            {tableType === TableEnum.Skills ? (
              <FormattedMessage {...translations.addSkill} />
            ) : (
              <FormattedMessage {...translations.addSkillBranch} />
            )}
          </Button>
        ),
        setCellProps: () => ({
          style: { textAlign: 'right' },
        }),
        customBodyRenderLite: (dataIndex): JSX.Element | string => {
          if (tableType === TableEnum.SkillBranches) {
            return (
              <ChevronRight
                className="p-0"
                id={`skill_branch_${
                  tableData[dataIndex] ? tableData[dataIndex].id : ''
                }`}
              />
            );
          }
          return ' ';
        },
      },
    },
  ];

  const isOpen =
    indexSelected !== -1 &&
    tableData[indexSelected] &&
    tableData[indexSelected].id !== -1;

  const branchHasSkills =
    tableType === TableEnum.SkillBranches &&
    isOpen &&
    data[indexSelected].skills &&
    (data[indexSelected].skills ?? []).length > 0;

  const options: TableOptions = {
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
        noMatch: (
          <Typography fontSize="1.4rem" lineHeight="1.43">
            {skillBranchIndex === -1
              ? intl.formatMessage(translations.noBranchSelected)
              : intl.formatMessage(translations.noSkill)}
          </Typography>
        ),
      },
    },
    setRowProps: (_, dataIndex) => {
      if (dataIndex === indexSelected) {
        return { style: { backgroundColor: '#eeeeee', cursor: 'pointer' } };
      }
      return { style: { cursor: 'pointer' } };
    },
    onRowClick: (_, rowMeta: { dataIndex; rowIndex }) => {
      const index = rowMeta.dataIndex;
      if (tableType === TableEnum.SkillBranches) {
        changeSkillBranch(tableData[index].id);
      }
      setIndexSelected(index);
    },
    customFooter: () => {
      return (
        <TableFooter>
          <TableRow>
            <TableCell
              ref={containerRef}
              style={{
                overflow: 'hidden',
                height: '20vh',
                display: isOpen ? 'block' : 'none',
                padding: '0px 0px',
              }}
            >
              <Slide
                appear
                className="border-only-t-neutral-200"
                container={containerRef.current}
                direction="up"
                in={isOpen}
                style={{
                  padding: '8px 14px',
                  overflow: 'auto',
                  maxHeight: '20vh',
                  minHeight: '20vh',
                }}
              >
                <Box>
                  {isOpen ? (
                    <>
                      <Box display="flex">
                        <Typography
                          style={{
                            alignSelf: 'center',
                            marginRight: 'auto',
                            wordBreak: 'break-word',
                            paddingLeft: '8px',
                          }}
                          variant="subtitle1"
                        >
                          {tableData[indexSelected].title}
                        </Typography>
                        <SkillManagementButtons
                          key={tableData[indexSelected].id}
                          branchHasSkills={branchHasSkills ?? false}
                          canDestroy={
                            tableData[indexSelected].permissions.canDestroy
                          }
                          canUpdate={
                            tableData[indexSelected].permissions.canUpdate
                          }
                          data={tableData[indexSelected]}
                          editClick={editClick}
                          id={tableData[indexSelected].id}
                          isSkillBranch={tableType === TableEnum.SkillBranches}
                        />
                      </Box>
                      <CardContent
                        style={{
                          height: '10vh',
                          overflow: 'auto',
                          margin: 5,
                          borderStyle: 'solid',
                          borderWidth: 0.2,
                          borderColor: '#eeeeee',
                          borderRadius: 5,
                          padding: '4px 4px',
                        }}
                      >
                        <Typography
                          dangerouslySetInnerHTML={{
                            __html: tableData[indexSelected].description ?? '',
                          }}
                          style={{
                            wordBreak: 'break-word',
                          }}
                          variant="body2"
                        />
                      </CardContent>
                    </>
                  ) : null}
                </Box>
              </Slide>
            </TableCell>
          </TableRow>
        </TableFooter>
      );
    },
  };

  return (
    <DataTable
      columns={columns}
      data={tableData}
      height="30px"
      options={options}
    />
  );
};

export default memo(injectIntl(SkillsTable), (prevProps, nextProps) => {
  return (
    equal(prevProps.data, nextProps.data) &&
    prevProps.skillBranchIndex === nextProps.skillBranchIndex &&
    prevProps.skillIndex === nextProps.skillIndex
  );
});
