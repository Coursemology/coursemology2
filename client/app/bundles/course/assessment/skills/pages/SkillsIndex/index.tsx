import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { Grid } from '@mui/material';
import {
  SkillBranchMiniEntity,
  SkillBranchOptions,
  SkillMiniEntity,
} from 'types/course/assessment/skills/skills';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import SkillDialog from '../../components/dialogs/SkillDialog';
import SkillsTable from '../../components/tables/SkillsTable';
import { fetchSkillBranches } from '../../operations';
import {
  getAllSkillBranchMiniEntities,
  getAllSkillMiniEntities,
  getSkillPermissions,
} from '../../selectors';
import { DialogTypes, TableEnum } from '../../types';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchSkillsFailure: {
    id: 'course.assessment.skills.SkillsIndex.fetchSkillsFailure',
    defaultMessage: 'Failed to retrieve Skills.',
  },
  skills: {
    id: 'course.assessment.skills.SkillsIndex.skills',
    defaultMessage: 'Skills',
  },
});

const SkillsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogType, setDialogType] = useState(DialogTypes.NewSkill);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(
    {} as SkillMiniEntity | SkillBranchMiniEntity,
  );
  const [skillBranchId, setSkillBranchId] = useState(null as number | null);
  const [skillId, setSkillId] = useState(null as number | null);

  const skillPermissions = useAppSelector(getSkillPermissions);
  const skillBranchEntities = useAppSelector(getAllSkillBranchMiniEntities);
  const skillEntities = useAppSelector(getAllSkillMiniEntities);
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
    <Page title={intl.formatMessage(translations.skills)} unpadded>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <Grid
            className="border-only-b-neutral-200"
            columnGap={0.2}
            container
            direction="row"
          >
            <Grid
              className="border-only-r-neutral-200"
              id="skill-branches"
              item
              xs
            >
              <SkillsTable
                addClick={newSkillBranchClick}
                addDisabled={!skillPermissions.canCreateSkill}
                changeSkillBranch={changeSkillBranch}
                data={data}
                editClick={editSkillBranchClick}
                skillBranchIndex={branchSelected}
                skillIndex={skillSelected}
                tableType={TableEnum.SkillBranches}
              />
            </Grid>
            <Grid id="skills" item xs>
              <SkillsTable
                addClick={newSkillClick}
                addDisabled={!skillPermissions.canCreateSkill}
                changeSkillBranch={changeSkillBranch}
                data={data}
                editClick={editSkillClick}
                skillBranchIndex={branchSelected}
                skillIndex={skillSelected}
                tableType={TableEnum.Skills}
              />
            </Grid>
          </Grid>
          <SkillDialog
            data={dialogData ?? null}
            dialogType={dialogType}
            onClose={(): void => setIsDialogOpen(false)}
            open={isDialogOpen}
            setNewSelected={setNewSelected}
            skillBranchId={
              (dialogType === DialogTypes.NewSkill &&
                branchSelected !== -1 &&
                data[branchSelected].id) ||
              -1
            }
            skillBranchOptions={skillBranchOptions}
          />
        </>
      )}
    </Page>
  );
};

const handle = translations.skills;

export default Object.assign(injectIntl(SkillsIndex), { handle });
