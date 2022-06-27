import { FC, memo, useEffect, useRef, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import {
  SkillBranchMiniEntity,
  SkillMiniEntity,
} from 'types/course/assessment/skills/skills';
import {
  Slide,
  Typography,
  Box,
  CardContent,
  TableFooter,
  TableCell,
  TableRow,
  Button,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from 'lib/components/DataTable';
import SkillManagementButtons from '../buttons/SkillManagementButtons';
import { TableEnum } from '../../types';
import './SkillsTable.scss';

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
    id: 'course.assessment.skills.components.SkillsTable.uncategorised',
    defaultMessage: 'Uncategorised Skills',
  },
  branch: {
    id: 'course.assessment.skills.components.SkillsTable.branch',
    defaultMessage: 'Skill Branches',
  },
  skills: {
    id: 'course.assessment.skills.components.SkillsTable.skills',
    defaultMessage: 'Skills',
  },
  noSkill: {
    id: 'course.assessment.skills.components.SkillsTable.noSkill',
    defaultMessage: 'Sorry, no skill found under this skill branch.',
  },
  noBranchSelected: {
    id: 'course.assessment.skills.components.SkillsTable.noBranchSelected',
    defaultMessage: 'No Skill Branch has been selected.',
  },
  noBranch: {
    id: 'course.assessment.skills.components.SkillsTable.noBranch',
    defaultMessage: 'There are no skill branches.',
  },
  addSkill: {
    id: 'course.assessment.skills.components.SkillsTable.addSkill',
    defaultMessage: 'Add Skill',
  },
  addSkillBranch: {
    id: 'course.assessment.skills.components.SkillsTable.addSkillBranch',
    defaultMessage: 'Add Skill Branch',
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
            return <div>{intl.formatMessage(translations.noBranch)}</div>;
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
            variant="outlined"
            color="primary"
            onClick={addClick}
            style={{
              background: 'white',
              fontSize: 14,
              marginLeft: 12,
            }}
            disabled={addDisabled}
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
              <span
                className="fa fa-chevron-right"
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
              style={{
                overflow: 'hidden',
                height: '20vh',
                display: isOpen ? 'block' : 'none',
                padding: '0px 0px',
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
                  borderRadius: '5px',
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
                            paddingLeft: '8px',
                          }}
                        >
                          {tableData[indexSelected].title}
                        </Typography>
                        <SkillManagementButtons
                          id={tableData[indexSelected].id}
                          key={tableData[indexSelected].id}
                          isSkillBranch={tableType === TableEnum.SkillBranches}
                          canDestroy={
                            tableData[indexSelected].permissions.canDestroy
                          }
                          canUpdate={
                            tableData[indexSelected].permissions.canUpdate
                          }
                          editClick={editClick}
                          data={tableData[indexSelected]}
                          branchHasSkills={branchHasSkills ?? false}
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
                          variant="body2"
                          style={{
                            wordBreak: 'break-word',
                          }}
                          dangerouslySetInnerHTML={{
                            __html: tableData[indexSelected].description ?? '',
                          }}
                        />
                      </CardContent>
                    </>
                  ) : (
                    <></>
                  )}
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
      data={tableData}
      options={options}
      columns={columns}
      height="30px"
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
