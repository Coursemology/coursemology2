import { Button, Grid } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  BranchOptions,
  SkillBranchData,
  SkillData,
} from 'types/course/assessment/skills/skills';
import { AppDispatch, AppState } from 'types/store';
import SkillDialog from '../../components/SkillDialog';
import SkillsTable from '../../components/SkillsTable';
import fetchSkills from '../../operations';
import {
  getSkillBranches,
  getSkills,
  getSkillPermissions,
} from '../../selectors';
import { DialogTypes, TableTypes } from '../../types';

type Props = WrappedComponentProps;

const styles = {
  newButton: {
    background: 'white',
    fontSize: 14,
    marginLeft: 12,
  },
};

const translations = defineMessages({
  fetchSkillsFailure: {
    id: 'course.assessment.skills.index.fetch.failure',
    defaultMessage: 'Failed to retrieve Skills.',
  },
  skills: {
    id: 'course.assessment.skills.index.skills',
    defaultMessage: 'Skills',
  },
  addSkill: {
    id: 'course.assessment.skills.index.addSkill',
    defaultMessage: 'Add Skill',
  },
  addSkillBranch: {
    id: 'course.assessment.skills.index.addSkillBranch',
    defaultMessage: 'Add Skill Branch',
  },
});

const SkillsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogType, setDialogType] = useState(DialogTypes.NewSkill);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({} as SkillData);
  const [branchSelected, setBranchSelected] = useState(-1);

  const permissions = useSelector((state: AppState) =>
    getSkillPermissions(state),
  );
  const skillBranchesEntity = useSelector((state: AppState) =>
    getSkillBranches(state),
  );
  const skillsEntity = useSelector((state: AppState) => getSkills(state));
  const data: SkillBranchData[] = skillBranchesEntity
    .map((branch) => {
      return {
        ...branch,
        skills: skillsEntity.filter((skill) =>
          branch.id !== -1 ? skill.branchId === branch.id : !skill.branchId,
        ),
      };
    })
    .sort((a, b) => {
      if (!a.title || !b.title) {
        return !a.title ? 1 : -1;
      }
      return a.title.charCodeAt(0) - b.title.charCodeAt(0);
    });

  const branchOptions: BranchOptions[] = skillBranchesEntity
    .map((branch) => ({
      value: branch.id,
      label: branch.title,
    }))
    .filter((branch) => branch.value !== -1);

  useEffect(() => {
    dispatch(fetchSkills())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchSkillsFailure)),
      );
  }, [dispatch]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const headerToolbars: ReactElement[] = [];

  if (permissions.canCreateSkill) {
    headerToolbars.push(
      <Button
        key={DialogTypes.NewSkill}
        variant="outlined"
        color="primary"
        onClick={(): void => {
          setIsDialogOpen(true);
          setDialogType(DialogTypes.NewSkill);
        }}
        style={styles.newButton}
      >
        {intl.formatMessage(translations.addSkill)}
      </Button>,
    );
  }

  if (permissions.canCreateSkillBranch) {
    headerToolbars.push(
      <Button
        key={DialogTypes.NewSkillBranch}
        variant="outlined"
        color="primary"
        onClick={(): void => {
          setIsDialogOpen(true);
          setDialogType(DialogTypes.NewSkillBranch);
        }}
        style={styles.newButton}
      >
        {intl.formatMessage(translations.addSkillBranch)}
      </Button>,
    );
  }

  const editSkillClick = (skillData: SkillData): void => {
    setIsDialogOpen(true);
    setDialogType(DialogTypes.EditSkill);
    setDialogData(skillData);
  };

  const editSkillBranchClick = (skillBranchData: SkillBranchData): void => {
    setIsDialogOpen(true);
    setDialogType(DialogTypes.EditSkillBranch);
    setDialogData(skillBranchData);
  };

  const changeBranch = (branchIndex: number): void => {
    setBranchSelected(branchIndex);
  };

  return (
    <>
      <PageHeader
        title={intl.formatMessage({ ...translations.skills })}
        toolbars={headerToolbars}
      />
      <Grid container direction="row" columnGap={0.2} maxHeight="70vh">
        <Grid item xs={5.9} id="skill-branches">
          <SkillsTable
            data={data}
            editClick={editSkillBranchClick}
            tableType={TableTypes.SkillBranches}
            branchIndex={branchSelected}
            changeBranch={changeBranch}
          />
        </Grid>
        <Grid item xs={5.9} id="skills">
          <SkillsTable
            data={data}
            editClick={editSkillClick}
            tableType={TableTypes.Skills}
            branchIndex={branchSelected}
            changeBranch={changeBranch}
          />
        </Grid>
      </Grid>
      <SkillDialog
        dialogType={dialogType}
        open={isDialogOpen}
        handleClose={(): void => setIsDialogOpen(false)}
        branchOptions={branchOptions}
        data={dialogData ?? null}
      />
    </>
  );
};

export default injectIntl(SkillsIndex);
