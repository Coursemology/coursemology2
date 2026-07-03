import { FC, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
} from '@mui/material';
import type {
  AssessmentData,
  CategoryData,
  LevelContributionData,
  StudentData,
  TabData,
} from 'types/course/gradebook';

import useTranslation from 'lib/hooks/useTranslation';

import ConfigureWeightsContent from '../ConfigureWeightsContent';

import ManageExternalAssessmentsContent from './ManageExternalAssessmentsContent';

const translations = defineMessages({
  title: {
    id: 'course.gradebook.GradebookSettingsDialog.title',
    defaultMessage: 'Gradebook settings',
  },
  weightsTab: {
    id: 'course.gradebook.GradebookSettingsDialog.weightsTab',
    defaultMessage: 'Weights',
  },
  externalTab: {
    id: 'course.gradebook.GradebookSettingsDialog.externalTab',
    defaultMessage: 'External assessments',
  },
  save: {
    id: 'course.gradebook.GradebookSettingsDialog.save',
    defaultMessage: 'Save',
  },
  close: {
    id: 'course.gradebook.GradebookSettingsDialog.close',
    defaultMessage: 'Close',
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
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

const GradebookSettingsDialog: FC<Props> = ({
  open,
  onClose,
  weightedViewEnabled,
  ...weights
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'weights' | 'external'>('weights');
  // The weights body's save handler lives in a ref (read on click); its validity
  // is held in state so the footer's disabled affordance stays in sync.
  const saveFnRef = useRef<() => Promise<void>>(async () => {});
  const [canSave, setCanSave] = useState(false);

  return (
    // One stable width for both tabs: a settings dialog that resized when you
    // switched tabs would read as broken. 660px is trimmed from the default md
    // so the Weights controls sit nearer their labels and the narrow External
    // list roughly fills the dialog instead of stranding half of it empty.
    <Dialog
      fullWidth
      maxWidth={false}
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { maxWidth: 660 } }}
    >
      <DialogTitle>{t(translations.title)}</DialogTitle>
      {weightedViewEnabled && (
        <Tabs onChange={(_, v) => setTab(v)} value={tab}>
          <Tab label={t(translations.weightsTab)} value="weights" />
          <Tab label={t(translations.externalTab)} value="external" />
        </Tabs>
      )}
      <DialogContent>
        {weightedViewEnabled ? (
          <>
            <div hidden={tab !== 'weights'}>
              <ConfigureWeightsContent
                {...weights}
                onSaved={onClose}
                registerSave={(fn, nextCanSave) => {
                  saveFnRef.current = fn;
                  setCanSave(nextCanSave);
                }}
              />
            </div>
            <div hidden={tab !== 'external'}>
              <ManageExternalAssessmentsContent />
            </div>
          </>
        ) : (
          <ManageExternalAssessmentsContent />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          {t(translations.close)}
        </Button>
        {weightedViewEnabled && tab === 'weights' && (
          <Button
            disabled={!canSave}
            onClick={() => saveFnRef.current()}
            variant="contained"
          >
            {t(translations.save)}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GradebookSettingsDialog;
