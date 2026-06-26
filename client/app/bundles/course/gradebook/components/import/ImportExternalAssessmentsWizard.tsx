import { FC, useEffect, useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Add, Delete } from '@mui/icons-material';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link as MuiLink,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import type {
  IdentifierMode,
  ImportComponent,
  ImportPreviewResult,
} from 'types/course/gradebook';

import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { commitImport, previewImport } from '../../operations';

import { downloadTemplate, readFileText } from './buildTemplate';
import ExternalGradeConflictPrompt from './ExternalGradeConflictPrompt';

const translations = defineMessages({
  title: {
    id: 'course.gradebook.ImportWizard.title',
    defaultMessage: 'Import external assessments',
  },
  stepDefine: {
    id: 'course.gradebook.ImportWizard.stepDefine',
    defaultMessage: 'Define components',
  },
  stepUpload: {
    id: 'course.gradebook.ImportWizard.stepUpload',
    defaultMessage: 'Template & upload',
  },
  stepVerify: {
    id: 'course.gradebook.ImportWizard.stepVerify',
    defaultMessage: 'Verify',
  },
  componentName: {
    id: 'course.gradebook.ImportWizard.componentName',
    defaultMessage: 'Component name',
  },
  weightage: {
    id: 'course.gradebook.ImportWizard.weightage',
    defaultMessage: 'Weightage',
  },
  maxMarks: {
    id: 'course.gradebook.ImportWizard.maxMarks',
    defaultMessage: 'Max marks',
  },
  addComponent: {
    id: 'course.gradebook.ImportWizard.addComponent',
    defaultMessage: 'Add component',
  },
  updatesExisting: {
    id: 'course.gradebook.ImportWizard.updatesExisting',
    defaultMessage: 'Updates existing — managed in the gradebook',
  },
  identifierMode: {
    id: 'course.gradebook.ImportWizard.identifierMode',
    defaultMessage: 'Match students by',
  },
  studentId: {
    id: 'course.gradebook.ImportWizard.studentId',
    defaultMessage: 'Student ID',
  },
  email: { id: 'course.gradebook.ImportWizard.email', defaultMessage: 'Email' },
  studentIdHint: {
    id: 'course.gradebook.ImportWizard.studentIdHint',
    defaultMessage:
      "Matching uses each student's current Student ID. Keep Student IDs up to date in Manage Users.",
  },
  downloadTemplate: {
    id: 'course.gradebook.ImportWizard.downloadTemplate',
    defaultMessage: 'Download template',
  },
  upload: {
    id: 'course.gradebook.ImportWizard.upload',
    defaultMessage: 'Upload filled CSV',
  },
  back: { id: 'course.gradebook.ImportWizard.back', defaultMessage: 'Back' },
  next: { id: 'course.gradebook.ImportWizard.next', defaultMessage: 'Next' },
  verify: {
    id: 'course.gradebook.ImportWizard.verify',
    defaultMessage: 'Verify',
  },
  cancel: {
    id: 'course.gradebook.ImportWizard.cancel',
    defaultMessage: 'Cancel',
  },
  continue: {
    id: 'course.gradebook.ImportWizard.continue',
    defaultMessage: 'Confirm import',
  },
  unresolved: {
    id: 'course.gradebook.ImportWizard.unresolved',
    defaultMessage: 'These identifiers were not found in the course: {ids}',
  },
  malformed: {
    id: 'course.gradebook.ImportWizard.malformed',
    defaultMessage: 'These cells are not valid numbers: {cells}',
  },
  committed: {
    id: 'course.gradebook.ImportWizard.committed',
    defaultMessage: 'Import complete.',
  },
  commitError: {
    id: 'course.gradebook.ImportWizard.commitError',
    defaultMessage: 'Import failed. Nothing was saved.',
  },
  previewError: {
    id: 'course.gradebook.ImportWizard.previewError',
    defaultMessage: 'Could not verify the file. Please try again.',
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
  weightedViewEnabled: boolean;
  existingExternalTitles: string[];
}

let rowId = 0;
const blankComponent = (): ImportComponent & { id: number } => {
  rowId += 1;
  return { id: rowId, name: '', weightage: 0, maximumGrade: 0 };
};

const ImportExternalAssessmentsWizard: FC<Props> = ({
  open,
  onClose,
  weightedViewEnabled,
  existingExternalTitles,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { courseId } = useParams();
  const [step, setStep] = useState(0);
  const [components, setComponents] = useState<
    (ImportComponent & { id: number })[]
  >([blankComponent()]);
  const [mode, setMode] = useState<IdentifierMode>('student_id');
  const [csvData, setCsvData] = useState('');
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setComponents([blankComponent()]);
      setCsvData('');
      setPreview(null);
      setConflictOpen(false);
      setBusy(false);
    }
  }, [open]);

  const existingSet = useMemo(
    () => new Set(existingExternalTitles),
    [existingExternalTitles],
  );
  const isExisting = (name: string): boolean => existingSet.has(name.trim());

  const updateComponent = (
    i: number,
    patch: Partial<ImportComponent & { id: number }>,
  ): void =>
    setComponents((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const defineValid =
    components.length > 0 &&
    components.every((c) => c.name.trim() !== '') &&
    new Set(components.map((c) => c.name.trim())).size === components.length;

  const runPreview = async (): Promise<void> => {
    setBusy(true);
    try {
      const result = await dispatch(
        previewImport({
          components: components.map(({ id: _, ...rest }) => rest),
          identifierMode: mode,
          csvData,
        }),
      );
      setPreview(result);
      setStep(2);
    } catch {
      toast.error(t(translations.previewError));
    } finally {
      setBusy(false);
    }
  };

  const doCommit = async (onConflict: 'keep' | 'replace'): Promise<void> => {
    setBusy(true);
    try {
      await dispatch(
        commitImport({
          components: components.map(({ id: _, ...rest }) => rest),
          identifierMode: mode,
          csvData,
          onConflict,
        }),
      );
      toast.success(t(translations.committed));
      setConflictOpen(false);
      onClose();
    } catch {
      toast.error(t(translations.commitError));
    } finally {
      setBusy(false);
    }
  };

  const onConfirm = (): void => {
    if (preview && preview.conflicts.length > 0) setConflictOpen(true);
    else doCommit('replace');
  };

  return (
    <Dialog fullWidth maxWidth="md" onClose={onClose} open={open}>
      <DialogTitle>{t(translations.title)}</DialogTitle>
      <DialogContent>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>{t(translations.stepDefine)}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t(translations.stepUpload)}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t(translations.stepVerify)}</StepLabel>
          </Step>
        </Stepper>

        {step === 0 && (
          <>
            {components.map((c, i) => {
              const locked = isExisting(c.name);
              return (
                <div key={c.id} className="mb-2 flex items-center gap-2">
                  <TextField
                    inputProps={{ 'aria-label': t(translations.componentName) }}
                    label={t(translations.componentName)}
                    onChange={(e) =>
                      updateComponent(i, { name: e.target.value })
                    }
                    size="small"
                    value={c.name}
                  />
                  {weightedViewEnabled && (
                    <TextField
                      disabled={locked}
                      inputProps={{ 'aria-label': t(translations.weightage) }}
                      label={t(translations.weightage)}
                      onChange={(e) =>
                        updateComponent(i, {
                          weightage: Number(e.target.value),
                        })
                      }
                      size="small"
                      type="number"
                      value={c.weightage}
                    />
                  )}
                  <TextField
                    disabled={locked}
                    inputProps={{ 'aria-label': t(translations.maxMarks) }}
                    label={t(translations.maxMarks)}
                    onChange={(e) =>
                      updateComponent(i, {
                        maximumGrade: Number(e.target.value),
                      })
                    }
                    size="small"
                    type="number"
                    value={c.maximumGrade}
                  />
                  {locked && (
                    <span className="text-sm text-neutral-500">
                      {t(translations.updatesExisting)}
                    </span>
                  )}
                  <IconButton
                    aria-label="remove component"
                    onClick={() =>
                      setComponents((cs) => cs.filter((_, j) => j !== i))
                    }
                    size="small"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </div>
              );
            })}
            <Button
              onClick={() => setComponents((cs) => [...cs, blankComponent()])}
              size="small"
              startIcon={<Add />}
            >
              {t(translations.addComponent)}
            </Button>

            <div className="mt-4">
              <span className="mr-2">{t(translations.identifierMode)}</span>
              <ToggleButtonGroup
                exclusive
                onChange={(_, v: IdentifierMode | null) => v && setMode(v)}
                size="small"
                value={mode}
              >
                <ToggleButton value="student_id">
                  {t(translations.studentId)}
                </ToggleButton>
                <ToggleButton value="email">
                  {t(translations.email)}
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
            {mode === 'student_id' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {t(translations.studentIdHint)}{' '}
                <MuiLink href={`/courses/${courseId}/users`}>
                  Manage Users
                </MuiLink>
              </Alert>
            )}
          </>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => downloadTemplate(components)}
              variant="outlined"
            >
              {t(translations.downloadTemplate)}
            </Button>
            <TextField
              inputProps={{ 'aria-label': t(translations.upload) }}
              onChange={async (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) setCsvData(await readFileText(f));
              }}
              type="file"
            />
          </div>
        )}

        {step === 2 && preview && (
          <>
            {!preview.ok && preview.unresolved.length > 0 && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {t(translations.unresolved, {
                  ids: preview.unresolved.join(', '),
                })}
              </Alert>
            )}
            {!preview.ok && preview.malformed.length > 0 && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {t(translations.malformed, {
                  cells: preview.malformed.join('; '),
                })}
              </Alert>
            )}
            {preview.ok && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t(translations.componentName)}</TableCell>
                    {components.map((c) => (
                      <TableCell key={c.name}>{c.name}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.sample.map((row) => (
                    <TableRow key={row.studentName}>
                      <TableCell>{row.studentName}</TableCell>
                      {components.map((c) => (
                        <TableCell key={c.name}>
                          {row.grades[c.name] ?? '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose} variant="outlined">
          {t(translations.cancel)}
        </Button>
        {step > 0 && (
          <Button disabled={busy} onClick={() => setStep((s) => s - 1)}>
            {t(translations.back)}
          </Button>
        )}
        {step === 0 && (
          <Button
            disabled={!defineValid}
            onClick={() => setStep(1)}
            variant="contained"
          >
            {t(translations.next)}
          </Button>
        )}
        {step === 1 && (
          <Button
            disabled={busy || csvData === ''}
            onClick={runPreview}
            variant="contained"
          >
            {t(translations.verify)}
          </Button>
        )}
        {step === 2 && preview?.ok && (
          <Button disabled={busy} onClick={onConfirm} variant="contained">
            {t(translations.continue)}
          </Button>
        )}
      </DialogActions>

      <ExternalGradeConflictPrompt
        conflicts={preview?.conflicts ?? []}
        disabled={busy}
        onCancel={() => setConflictOpen(false)}
        onKeepExisting={() => doCommit('keep')}
        onReplaceAll={() => doCommit('replace')}
        open={conflictOpen}
      />
    </Dialog>
  );
};

export default ImportExternalAssessmentsWizard;
