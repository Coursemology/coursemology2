import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { AssessmentData } from 'types/course/gradebook';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { isDuplicateNameError } from '../../duplicateNameError';
import { editExternalAssessment } from '../../operations';
import { getWeightedViewEnabled } from '../../selectors';

const translations = defineMessages({
  title: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.title',
    defaultMessage: 'Edit external assessment',
  },
  nameLabel: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.nameLabel',
    defaultMessage: 'Name',
  },
  maxLabel: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.maxLabel',
    defaultMessage: 'Max marks',
  },
  advancedLabel: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.advancedLabel',
    defaultMessage: 'Advanced settings',
  },
  floorLabel: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.floorLabel',
    defaultMessage: 'Floor grades at 0',
  },
  capLabel: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.capLabel',
    defaultMessage: 'Cap grades at max',
  },
  floorHint: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.floorHint',
    defaultMessage:
      'Marks negative grades with a warning in the gradebook. The actual grade is unchanged.',
  },
  floorHintWeighted: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.floorHintWeighted',
    defaultMessage:
      'Counts negative grades as 0 when computing the weighted total, and marks them with a warning in the gradebook. The actual grade is unchanged.',
  },
  capHint: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.capHint',
    defaultMessage:
      'Marks grades above the maximum with a warning in the gradebook. The actual grade is unchanged.',
  },
  capHintWeighted: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.capHintWeighted',
    defaultMessage:
      'Counts grades above the maximum as the maximum when computing the weighted total, and marks them with a warning in the gradebook. The actual grade is unchanged.',
  },
  cancel: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.save',
    defaultMessage: 'Save',
  },
  error: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.error',
    defaultMessage: 'Could not save the external assessment.',
  },
  duplicateNameError: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.duplicateNameError',
    defaultMessage: 'Another external assessment already has this name.',
  },
});

interface Props {
  open: boolean;
  assessment: AssessmentData;
  onClose: () => void;
}

const EditExternalAssessmentPrompt: FC<Props> = ({
  open,
  assessment,
  onClose,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const weightedViewEnabled = useAppSelector(getWeightedViewEnabled);
  const [name, setName] = useState(assessment.title);
  const [max, setMax] = useState(String(assessment.maxGrade));
  const [floorAtZero, setFloorAtZero] = useState(
    assessment.floorAtZero ?? true,
  );
  const [capAtMaximum, setCapAtMaximum] = useState(
    assessment.capAtMaximum ?? true,
  );
  const [saving, setSaving] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setName(assessment.title);
      setMax(String(assessment.maxGrade));
      setFloorAtZero(assessment.floorAtZero ?? true);
      setCapAtMaximum(assessment.capAtMaximum ?? true);
    }
  }, [open, assessment]);

  const canSave =
    name.trim() !== '' && max.trim() !== '' && Number(max) >= 0 && !saving;

  // The weighted-total wording only makes sense when the weighted view is on;
  // otherwise the toggles just govern gradebook warnings.
  const floorHint = weightedViewEnabled
    ? translations.floorHintWeighted
    : translations.floorHint;
  const capHint = weightedViewEnabled
    ? translations.capHintWeighted
    : translations.capHint;

  const submit = async (): Promise<void> => {
    setSaving(true);
    try {
      await dispatch(
        editExternalAssessment(assessment.id, {
          title: name.trim(),
          maximumGrade: Number(max),
          floorAtZero,
          capAtMaximum,
        }),
      );
      onClose();
    } catch (error) {
      toast.error(
        t(
          isDuplicateNameError(error)
            ? translations.duplicateNameError
            : translations.error,
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog fullWidth maxWidth="xs" onClose={onClose} open={open}>
      <DialogTitle>{t(translations.title)}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label={t(translations.nameLabel)}
          margin="dense"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <TextField
          fullWidth
          label={t(translations.maxLabel)}
          margin="dense"
          onChange={(e) => setMax(e.target.value)}
          type="number"
          value={max}
        />
        <Accordion
          disableGutters
          elevation={0}
          expanded={advancedOpen}
          onChange={(_, expanded) => setAdvancedOpen(expanded)}
          square
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary
            sx={{
              minHeight: 'auto',
              px: 0,
              '& .MuiAccordionSummary-content': {
                my: 1,
                alignItems: 'center',
                gap: 0.5,
              },
            }}
          >
            <KeyboardArrowRight
              fontSize="small"
              sx={{
                // The glyph sits optically inset within its icon box; a small
                // negative margin pulls the visible arrowhead flush with the
                // left edge of the text fields above it.
                ml: '-12px',
                transform: advancedOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
              }}
            />
            <Typography variant="body1">
              {t(translations.advancedLabel)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            className="flex flex-col space-y-2"
            sx={{ px: 0, pl: 3.5 }}
          >
            <div className="flex items-center">
              <FormControlLabel
                control={
                  <Switch
                    checked={floorAtZero}
                    onChange={(e) => setFloorAtZero(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">
                    {t(translations.floorLabel)}
                  </Typography>
                }
              />
              <Tooltip title={t(floorHint)}>
                <InfoOutlined
                  aria-label={t(floorHint)}
                  color="action"
                  fontSize="small"
                />
              </Tooltip>
            </div>
            <div className="flex items-center">
              <FormControlLabel
                control={
                  <Switch
                    checked={capAtMaximum}
                    onChange={(e) => setCapAtMaximum(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">
                    {t(translations.capLabel)}
                  </Typography>
                }
              />
              <Tooltip title={t(capHint)}>
                <InfoOutlined
                  aria-label={t(capHint)}
                  color="action"
                  fontSize="small"
                />
              </Tooltip>
            </div>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions>
        <Button disabled={saving} onClick={onClose} variant="outlined">
          {t(translations.cancel)}
        </Button>
        <Button disabled={!canSave} onClick={submit} variant="contained">
          {t(translations.save)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditExternalAssessmentPrompt;
