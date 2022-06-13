import { Button } from "@mui/material";
import LoadingIndicator from "lib/components/LoadingIndicator";
import PageHeader from "lib/components/pages/PageHeader";
import { FC, ReactElement, useEffect, useState } from "react";
import { defineMessages, injectIntl, WrappedComponentProps } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { BranchOptions, SkillBranchData, SkillData } from "types/course/assessment/skills/skills";
import { AppDispatch, AppState } from "types/store";
import SkillDialog from "../../components/SkillDialog";
import SkillsBranchTable from "../../components/SkillsBranchTable";
import fetchSkills from "../../operations";
import { getSkillBranches, getSkills, getSkillSettings } from "../../selectors";
import { DialogTypes } from "../../types";

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
    defaultMessage: 'Add Skill'
  },
  addSkillBranch: {
    id: 'course.assessment.skills.index.addSkillBranch',
    defaultMessage: 'Add Skill Branch'
  },
});

const SkillsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogType, setDialogType] = useState(DialogTypes.NewSkill);
  const [isOpen, setIsOpen] = useState(false);
  const [dialogData, setDialogData] = useState({} as SkillData);
  const settings = useSelector((state: AppState) => 
    getSkillSettings(state),
  );
  const skillBranches = useSelector((state: AppState) => 
    getSkillBranches(state),
  );
  const skills = useSelector((state: AppState) => 
    getSkills(state),
  );
  const data: SkillBranchData[] = skillBranches.map(branch => {
    return {...branch, skills: skills.filter(skill => branch.id !== -1 ? skill.branchId === branch.id : !skill.branchId)}
  });

  const branchOptions: BranchOptions[] = skillBranches.map(branch => ({
    value: branch.id,
    label: branch.title
  })).filter(branch => branch.value !== -1)

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

  const headerToolbars: ReactElement[] = []; // To Add: Reorder Button

  if (settings.canCreateSkill) {
    headerToolbars.push(
      <Button
        variant="outlined"
        color="primary"
        onClick={(): void => {
          setIsOpen(true);
          setDialogType(DialogTypes.NewSkill)
        }}
        style={styles.newButton}
      >
        {intl.formatMessage(translations.addSkill)}
      </Button>,
    );
  }

  if (settings.canCreateSkillBranch) {
    headerToolbars.push(
      <Button
        variant="outlined"
        color="primary"
        onClick={(): void => {
          setIsOpen(true);
          setDialogType(DialogTypes.NewSkillBranch)
        }}
        style={styles.newButton}
      >
        {intl.formatMessage(translations.addSkillBranch)}
      </Button>,
    );
  }

  const editSkillClick = (data: SkillData): void => {
    setIsOpen(true);
    setDialogType(DialogTypes.EditSkill);
    setDialogData(data);
  }

  const editSkillBranchClick = (data: SkillBranchData): void => {
    setIsOpen(true);
    setDialogType(DialogTypes.EditSkillBranch);
    setDialogData(data);
  }

  return (
    <>
      <PageHeader
        title={
          intl.formatMessage({...translations.skills})
        }
        toolbars={headerToolbars}
      />
      <SkillsBranchTable data={data} settings={settings} editSkillClick={editSkillClick} editSkillBranchClick={editSkillBranchClick}/>
      <SkillDialog
        dialogType={dialogType}
        open={isOpen}
        handleClose={(): void => setIsOpen(false)}
        settings={settings}
        branchOptions={branchOptions}
        data={dialogData ?? null}
      />
    </>
  );
};

export default injectIntl(SkillsIndex);