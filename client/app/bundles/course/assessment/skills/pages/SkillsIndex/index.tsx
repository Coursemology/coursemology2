import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Grid } from '@mui/material';
import {
  SkillBranchOptions,
  SkillBranchMiniEntity,
  SkillMiniEntity,
} from 'types/course/assessment/skills/skills';
import { AppDispatch, AppState } from 'types/store';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { fetchSkillBranches } from '../../operations';
import {
  getAllSkillBranchMiniEntities,
  getAllSkillMiniEntities,
  getSkillPermissions,
} from '../../selectors';
import { DialogTypes, TableEnum } from '../../types';
import SkillDialog from '../../components/dialogs/SkillDialog';
import SkillsTable from '../../components/tables/SkillsTable';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchSkillsFailure: {
    id: 'course.assessment.skills.index.fetch.failure',
    defaultMessage: 'Failed to retrieve Skills.',
  },
  skills: {
    id: 'course.assessment.skills.index.skills',
    defaultMessage: 'Skills',
  },
});

const SkillsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogType, setDialogType] = useState(DialogTypes.NewSkill);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(
    {} as SkillMiniEntity | SkillBranchMiniEntity,
  );
  const [skillBranchId, setSkillBranchId] = useState(null as number | null);
  const [skillId, setSkillId] = useState(null as number | null);

  const skillPermissions = useSelector((state: AppState) =>
    getSkillPermissions(state),
  );
  const skillBranchEntities = useSelector((state: AppState) =>
    getAllSkillBranchMiniEntities(state),
  );
  const skillEntities = useSelector((state: AppState) =>
    getAllSkillMiniEntities(state),
  );
  const data: SkillBranchMiniEntity[] = skillBranchEntities
    .map((branch) => {
      return {
        ...branch,
        skills: skillEntities.filter((skill) =>
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
  let branchSelected = -1;
  let skillSelected = -1;
  if (skillId !== null || skillBranchId !== null) {
    data.forEach((branch: SkillBranchMiniEntity, index: number) => {
      if (branch.id === skillBranchId) {
        branchSelected = index;
        if (branch.skills && skillId !== -1) {
          skillSelected = branch.skills.findIndex(
            (skill: SkillMiniEntity) => skill.id === skillId,
          );
        }
      }
    });
  }

  const skillBranchOptions: SkillBranchOptions[] = skillBranchEntities
    .map((branch) => ({
      value: branch.id,
      label: branch.title,
    }))
    .filter((branch) => branch.value !== -1);

  useEffect(() => {
    dispatch(fetchSkillBranches())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchSkillsFailure)),
      );
  }, [dispatch]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const newSkillClick = (): void => {
    setIsDialogOpen(true);
    setDialogType(DialogTypes.NewSkill);
  };

  const newSkillBranchClick = (): void => {
    setIsDialogOpen(true);
    setDialogType(DialogTypes.NewSkillBranch);
  };

  const editSkillClick = (
    skillMiniEntity: SkillMiniEntity | SkillBranchMiniEntity,
  ): void => {
    const skillData = skillMiniEntity as SkillMiniEntity;
    setIsDialogOpen(true);
    setDialogType(DialogTypes.EditSkill);
    setDialogData(skillData);
  };

  const editSkillBranchClick = (
    skillListBranchData: SkillMiniEntity | SkillBranchMiniEntity,
  ): void => {
    const skillBranchData = skillListBranchData as SkillBranchMiniEntity;
    setIsDialogOpen(true);
    setDialogType(DialogTypes.EditSkillBranch);
    setDialogData(skillBranchData);
  };

  const changeSkillBranch = (id: number): void => {
    setSkillBranchId(id);
  };

  // After creation of new skill or skill branch, set selection of skill or skill branch
  const setNewSelected = (
    newBranchId: number,
    newSkillId: number = -1,
  ): void => {
    setSkillBranchId(newBranchId);
    setSkillId(newSkillId);
  };

  return (
    <>
      <PageHeader title={intl.formatMessage({ ...translations.skills })} />
      <Grid container direction="row" columnGap={0.2}>
        <Grid item xs id="skill-branches">
          <SkillsTable
            data={data}
            editClick={editSkillBranchClick}
            addClick={newSkillBranchClick}
            addDisabled={!skillPermissions.canCreateSkill}
            tableType={TableEnum.SkillBranches}
            skillBranchIndex={branchSelected}
            skillIndex={skillSelected}
            changeSkillBranch={changeSkillBranch}
          />
        </Grid>
        <Grid item xs id="skills">
          <SkillsTable
            data={data}
            editClick={editSkillClick}
            addClick={newSkillClick}
            addDisabled={!skillPermissions.canCreateSkill}
            tableType={TableEnum.Skills}
            skillBranchIndex={branchSelected}
            skillIndex={skillSelected}
            changeSkillBranch={changeSkillBranch}
          />
        </Grid>
      </Grid>
      <SkillDialog
        dialogType={dialogType}
        open={isDialogOpen}
        handleClose={(): void => setIsDialogOpen(false)}
        skillBranchOptions={skillBranchOptions}
        data={dialogData ?? null}
        skillBranchId={
          (dialogType === DialogTypes.NewSkill &&
            branchSelected !== -1 &&
            data[branchSelected].id) ||
          -1
        }
        setNewSelected={setNewSelected}
      />
    </>
  );
};

export default injectIntl(SkillsIndex);
