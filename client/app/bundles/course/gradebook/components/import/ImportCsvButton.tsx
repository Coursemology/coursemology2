import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Upload } from '@mui/icons-material';
import { Button } from '@mui/material';
import type { ExistingExternalAssessment } from 'types/course/gradebook';

import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getExternalAssessments, getTabs } from '../../selectors';

import ImportExternalAssessmentsWizard from './ImportExternalAssessmentsWizard';

const translations = defineMessages({
  import: {
    id: 'course.gradebook.ImportCsvButton.label',
    defaultMessage: 'Import CSV',
  },
});

interface Props {
  /** Match the host toolbar's button size. Defaults to MUI's `medium`. */
  size?: 'small' | 'medium';
  weightedViewEnabled: boolean;
}

// Top-level CSV import trigger; opens the stepped header-mapping wizard.
const ImportCsvButton: FC<Props> = ({ size, weightedViewEnabled }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const externals = useAppSelector(getExternalAssessments);
  const tabs = useAppSelector(getTabs);

  const tabWeights = Object.fromEntries(
    tabs.map((tab) => [tab.id, tab.gradebookWeight ?? 0]),
  );
  const existingAssessments: ExistingExternalAssessment[] = externals.map(
    (a) => ({
      name: a.title,
      maximumGrade: a.maxGrade,
      weight: tabWeights[a.tabId] ?? 0,
    }),
  );

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size={size}
        startIcon={<Upload />}
        variant="outlined"
      >
        {t(translations.import)}
      </Button>
      <ImportExternalAssessmentsWizard
        existingAssessments={existingAssessments}
        onClose={() => setOpen(false)}
        open={open}
        weightedViewEnabled={weightedViewEnabled}
      />
    </>
  );
};

export default ImportCsvButton;
