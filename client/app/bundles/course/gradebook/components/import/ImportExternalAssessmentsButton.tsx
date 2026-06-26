import { FC, useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button } from '@mui/material';

import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getAssessments, getWeightedViewEnabled } from '../../selectors';

import ImportExternalAssessmentsWizard from './ImportExternalAssessmentsWizard';

const translations = defineMessages({
  importButton: {
    id: 'course.gradebook.ImportExternalAssessmentsButton.label',
    defaultMessage: 'Import external assessments',
  },
});

const ImportExternalAssessmentsButton: FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const weightedViewEnabled = useAppSelector(getWeightedViewEnabled);
  const assessments = useAppSelector(getAssessments);
  const existingExternalTitles = useMemo(
    () => assessments.filter((a) => a.external).map((a) => a.title),
    [assessments],
  );

  return (
    <>
      <Button onClick={() => setOpen(true)} size="small" variant="outlined">
        {t(translations.importButton)}
      </Button>
      <ImportExternalAssessmentsWizard
        existingExternalTitles={existingExternalTitles}
        onClose={() => setOpen(false)}
        open={open}
        weightedViewEnabled={weightedViewEnabled}
      />
    </>
  );
};

export default ImportExternalAssessmentsButton;
