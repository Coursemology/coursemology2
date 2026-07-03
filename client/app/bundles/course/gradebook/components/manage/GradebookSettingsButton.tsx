import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Settings } from '@mui/icons-material';
import { Button } from '@mui/material';
import type {
  AssessmentData,
  CategoryData,
  LevelContributionData,
  StudentData,
  TabData,
} from 'types/course/gradebook';

import useTranslation from 'lib/hooks/useTranslation';

import GradebookSettingsDialog from './GradebookSettingsDialog';

const translations = defineMessages({
  label: {
    id: 'course.gradebook.GradebookSettingsButton.label',
    defaultMessage: 'Gradebook settings',
  },
});

interface Props {
  /** Match the host toolbar's button size. Defaults to MUI's `medium`. */
  size?: 'small' | 'medium';
  weightedViewEnabled: boolean;
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  gamificationEnabled: boolean;
  courseMaxLevel: number;
  levelContribution: LevelContributionData;
  capTotal: boolean;
  students: StudentData[];
}

const GradebookSettingsButton: FC<Props> = ({ size, ...rest }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size={size}
        startIcon={<Settings />}
        variant="outlined"
      >
        {t(translations.label)}
      </Button>
      <GradebookSettingsDialog
        {...rest}
        onClose={() => setOpen(false)}
        open={open}
      />
    </>
  );
};

export default GradebookSettingsButton;
