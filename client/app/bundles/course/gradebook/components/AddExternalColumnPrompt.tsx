import { FC, useState } from 'react';
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

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { isDuplicateNameError } from '../duplicateNameError';
import { createExternalAssessment } from '../operations';
import { getWeightedViewEnabled } from '../selectors';

const translations = defineMessages({
  title: {
    id: 'course.gradebook.AddExternalColumnPrompt.title',
    defaultMessage: 'Add external assessment',
  },
  nameLabel: {
    id: 'course.gradebook.AddExternalColumnPrompt.nameLabel',
    defaultMessage: 'Name',
  },
  maxLabel: {
    id: 'course.gradebook.AddExternalColumnPrompt.maxLabel',
    defaultMessage: 'Max marks',
  },
  advancedLabel: {
    id: 'course.gradebook.AddExternalColumnPrompt.advancedLabel',
    defaultMessage: 'Advanced settings',
  },
  floorLabel: {
    id: 'course.gradebook.AddExternalColumnPrompt.floorLabel',
    defaultMessage: 'Floor grades at 0',
  },
  capLabel: {
    id: 'course.gradebook.AddExternalColumnPrompt.capLabel',
    defaultMessage: 'Cap grades at max',
  },
  floorHint: {
    id: 'course.gradebook.AddExternalColumnPrompt.floorHint',
    defaultMessage:
      'Marks negative grades with a warning in the gradebook. The actual grade is unchanged.',
  },
  floorHintWeighted: {
    id: 'course.gradebook.AddExternalColumnPrompt.floorHintWeighted',
    defaultMessage:
      'Counts negative grades as 0 when computing the weighted total, and marks them with a warning in the gradebook. The actual grade is unchanged.',
  },
  capHint: {
    id: 'course.gradebook.AddExternalColumnPrompt.capHint',
    defaultMessage:
      'Marks grades above the maximum with a warning in the gradebook. The actual grade is unchanged.',
  },
  capHintWeighted: {
    id: 'course.gradebook.AddExternalColumnPrompt.capHintWeighted',
    defaultMessage:
      'Counts grades above the maximum as the maximum when computing the weighted total, and marks them with a warning in the gradebook. The actual grade is unchanged.',
  },
  cancel: {
    id: 'course.gradebook.AddExternalColumnPrompt.cancel',
    defaultMessage: 'Cancel',
  },
  create: {
    id: 'course.gradebook.AddExternalColumnPrompt.create',
    defaultMessage: 'Create',
  },
  error: {
    id: 'course.gradebook.AddExternalColumnPrompt.error',
    defaultMessage: 'Could not create the external assessment.',
  },
  duplicateNameError: {
    id: 'course.gradebook.AddExternalColumnPrompt.duplicateNameError',
    defaultMessage: 'Another external assessment already has this name.',
  },
  success: {
    id: 'course.gradebook.AddExternalColumnPrompt.success',
    defaultMessage: 'External assessment created.',
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
}

const AddExternalColumnPrompt: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const weightedViewEnabled = useAppSelector(getWeightedViewEnabled);
  const [name, setName] = useState('');
  const [max, setMax] = useState('');
  const [floorAtZero, setFloorAtZero] = useState(true);
  const [capAtMaximum, setCapAtMaximum] = useState(true);
  const [saving, setSaving] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const reset = (): void => {
    setName('');
    setMax('');
    setFloorAtZero(true);
    setCapAtMaximum(true);
  };

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
        createExternalAssessment(
          name.trim(),
          Number(max),
          floorAtZero,
          capAtMaximum,
        ),
      );
      toast.success(t(translations.success));
      reset();
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
          {t(translations.create)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddExternalColumnPrompt;
