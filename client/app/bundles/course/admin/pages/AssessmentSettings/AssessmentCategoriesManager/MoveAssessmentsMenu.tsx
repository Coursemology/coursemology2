import { Button, Menu, MenuItem } from '@mui/material';
import useTranslation from 'lib/hooks/useTranslation';
import { useState } from 'react';
import { AssessmentTab } from 'types/course/admin/assessments';
import translations from '../translations';

interface MoveAssessmentsMenuProps {
  tabs?: AssessmentTab[];
  onSelectTab: (tab: AssessmentTab) => void;
  disabled?: boolean;
}

const MoveAssessmentsMenu = (
  props: MoveAssessmentsMenuProps,
): JSX.Element | null => {
  const { t } = useTranslation();
  const { tabs, onSelectTab } = props;
  const [button, setButton] = useState<HTMLButtonElement>();

  if (!tabs || tabs.length <= 0) return null;

  if (tabs.length === 1)
    return (
      <Button
        onClick={(): void => onSelectTab(tabs[0])}
        disabled={props.disabled}
      >
        {t(translations.moveAssessmentsToTabThenDelete, { tab: tabs[0].title })}
      </Button>
    );

  return (
    <>
      <Button
        onClick={(e): void => setButton(e.currentTarget)}
        disabled={props.disabled}
      >
        {t(translations.moveAssessmentsThenDelete)}
      </Button>

      <Menu
        open={Boolean(button)}
        anchorEl={button}
        onClose={(): void => setButton(undefined)}
      >
        {tabs.map((tab) => (
          <MenuItem
            key={tab.id}
            onClick={(): void => {
              setButton(undefined);
              onSelectTab(tab);
            }}
          >
            {t(translations.toTab, { tab: tab.fullTabTitle ?? '' })}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default MoveAssessmentsMenu;
