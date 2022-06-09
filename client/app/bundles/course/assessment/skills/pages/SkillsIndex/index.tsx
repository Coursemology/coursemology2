import { Button } from "@mui/material";
import LoadingIndicator from "lib/components/LoadingIndicator";
import PageHeader from "lib/components/pages/PageHeader";
import { FC, ReactElement, useEffect, useState } from "react";
import { defineMessages, injectIntl, WrappedComponentProps } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, AppState } from "types/store";
import SkillsBranchTable from "../../components/SkillsBranchTable";
import fetchSkills from "../../operations";
import { getSkillBranches, getSkillSettings } from "../../selectors";

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
  const [_, setIsOpen] = useState(false);
  const settings = useSelector((state: AppState) => 
    getSkillSettings(state),
  );
  const skillBranches = useSelector((state: AppState) => 
    getSkillBranches(state),
  );

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
        onClick={(): void => setIsOpen(true)}
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
        onClick={(): void => setIsOpen(true)}
        style={styles.newButton}
      >
        {intl.formatMessage(translations.addSkillBranch)}
      </Button>,
    );
  }

  return (
    <>
      <PageHeader
        title={
          intl.formatMessage({...translations.skills})
        }
        toolbars={headerToolbars}
      />
      <SkillsBranchTable data={skillBranches} settings={settings}/>
    </>
  );
};

export default injectIntl(SkillsIndex);