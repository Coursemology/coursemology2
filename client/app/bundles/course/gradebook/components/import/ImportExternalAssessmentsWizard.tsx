import { FC, useEffect, useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import { Add, Delete } from '@mui/icons-material';
import {
  Alert,
  Button,
  Chip,
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
  Typography,
} from '@mui/material';
import { FilePreview } from 'lib/components/form/fields/SingleFileInput';
import SegmentedSwitch from 'lib/components/core/buttons/SegmentedSwitch';
import type {
  ExistingExternalAssessment,
  IdentifierMode,
  ImportComponent,
  ImportPreviewResult,
} from 'types/course/gradebook';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { getStudents } from '../../selectors';

import { commitImport, previewImport } from '../../operations';

import {
  downloadTemplate,
  identifierHeader,
  readFileText,
} from './buildTemplate';
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
  fromExisting: {
    id: 'course.gradebook.ImportWizard.fromExisting',
    defaultMessage: 'From existing',
  },
  identifierMode: {
    id: 'course.gradebook.ImportWizard.identifierMode',
    defaultMessage: 'Match students by',
  },
  externalId: {
    id: 'course.gradebook.ImportWizard.externalId',
    defaultMessage: 'External ID',
  },
  email: { id: 'course.gradebook.ImportWizard.email', defaultMessage: 'Email' },
  requiredHeaders: {
    id: 'course.gradebook.ImportWizard.requiredHeaders',
    defaultMessage: 'Your CSV needs these column headers: {headers}',
  },
  dropzone: {
    id: 'course.gradebook.ImportWizard.dropzone',
    defaultMessage: 'Drag a CSV here, or click to choose a file',
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
  outOfRange: {
    id: 'course.gradebook.ImportWizard.outOfRange',
    defaultMessage: 'Some grades are outside their valid range: {cells}',
  },
  outOfRangeWeighted: {
    id: 'course.gradebook.ImportWizard.outOfRangeWeighted',
    defaultMessage:
      'These will be capped or floored in the weighted total when imported.',
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
  externalIdHint: {
    id: 'course.gradebook.ImportWizard.externalIdHint',
    defaultMessage:
      "Matching uses each student's External ID. Keep External IDs up to date in <link>Manage Users</link>.",
  },
  externalIdBlocked: {
    id: 'course.gradebook.ImportWizard.externalIdBlocked',
    defaultMessage:
      '{count, plural, one {{name} has no External ID.} other {# students have no External ID, including {name}.}} Importing by External ID needs every student to have one, so this import is blocked until they are all filled in. In <link>Manage Users</link>, sort by the External ID column to group the blank ones together and fill them in, then come back here. Prefer to match by Email instead? Switch the toggle above.',
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
  weightedViewEnabled: boolean;
  existingAssessments: ExistingExternalAssessment[];
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
  existingAssessments,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { courseId: courseIdParam } = useParams();
  const courseId = courseIdParam ?? '';
  const [step, setStep] = useState(0);
  const [components, setComponents] = useState<
    (ImportComponent & { id: number })[]
  >([blankComponent()]);
  const [mode, setMode] = useState<IdentifierMode>('external_id');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState('');
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const students = useAppSelector(getStudents);
  const missingStudents = useMemo(
    () => students.filter((s) => s.externalId == null || s.externalId === ''),
    [students],
  );
  const identifierReady = mode === 'email' || missingStudents.length === 0;
  const identifierModeLabel = t(
    mode === 'email' ? translations.email : translations.externalId,
  );

  useEffect(() => {
    if (!open) {
      setStep(0);
      setComponents([blankComponent()]);
      setFile(null);
      setCsvData('');
      setPreview(null);
      setConflictOpen(false);
      setBusy(false);
    }
  }, [open]);

  const existingMap = useMemo(
    () => new Map(existingAssessments.map((a) => [a.name, a])),
    [existingAssessments],
  );
  const isExisting = (name: string): boolean => existingMap.has(name.trim());

  const addedNames = useMemo(
    () => new Set(components.map((c) => c.name.trim())),
    [components],
  );

  const availableChips = useMemo(
    () => existingAssessments.filter((a) => !addedNames.has(a.name)),
    [existingAssessments, addedNames],
  );

  const updateComponent = (
    i: number,
    patch: Partial<ImportComponent & { id: number }>,
  ): void =>
    setComponents((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const insertFromExisting = (a: ExistingExternalAssessment): void => {
    rowId += 1;
    setComponents((cs) => [
      ...cs,
      {
        id: rowId,
        name: a.name,
        weightage: a.weightage,
        maximumGrade: a.maximumGrade,
      },
    ]);
  };

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
            {availableChips.length > 0 && (
              <div className="mb-3">
                <Typography sx={{ mb: 1 }} variant="subtitle2">
                  {t(translations.fromExisting)}
                </Typography>
                <div className="flex flex-wrap gap-1">
                  {availableChips.map((a) => (
                    <Chip
                      key={a.name}
                      label={a.name}
                      onClick={() => insertFromExisting(a)}
                      variant="outlined"
                    />
                  ))}
                </div>
              </div>
            )}

            {components.map((c, i) => {
              const locked = isExisting(c.name);
              const existing = locked
                ? existingMap.get(c.name.trim())
                : undefined;
              return (
                <div key={c.id} className="mb-2 flex items-center gap-2">
                  <TextField
                    disabled={locked}
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
                      value={
                        locked && existing ? existing.weightage : c.weightage
                      }
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
                    value={
                      locked && existing
                        ? existing.maximumGrade
                        : c.maximumGrade
                    }
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

            <div className="mt-4 flex items-center gap-2">
              <Typography component="span" variant="subtitle2">
                {t(translations.identifierMode)}
              </Typography>
              <SegmentedSwitch
                ariaLabel={t(translations.identifierMode)}
                onChange={setMode}
                options={[
                  {
                    value: 'external_id' as IdentifierMode,
                    label: t(translations.externalId),
                  },
                  {
                    value: 'email' as IdentifierMode,
                    label: t(translations.email),
                  },
                ]}
                value={mode}
              />
            </div>

            {mode === 'external_id' && (
              <Alert
                severity={identifierReady ? 'info' : 'warning'}
                sx={{ mt: 2 }}
              >
                {identifierReady
                  ? t(translations.externalIdHint, {
                    link: (chunks) => (
                      <MuiLink href={`/courses/${courseId}/users`}>
                        {chunks}
                      </MuiLink>
                    ),
                  })
                  : t(translations.externalIdBlocked, {
                    name: missingStudents[0]?.name ?? '',
                    count: missingStudents.length,
                    link: (chunks) => (
                      <MuiLink href={`/courses/${courseId}/users`}>
                        {chunks}
                      </MuiLink>
                    ),
                  })}
              </Alert>
            )}
          </>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <Typography variant="body2">
              {t(translations.requiredHeaders, {
                headers: [
                  identifierHeader(mode),
                  ...components.map((c) => c.name),
                ].join(', '),
              })}
            </Typography>
            <Button
              onClick={() => downloadTemplate(components, mode)}
              variant="outlined"
            >
              {t(translations.downloadTemplate)}
            </Button>
            <Dropzone
              accept={{ 'text/csv': ['.csv'] }}
              multiple={false}
              onDrop={async (files) => {
                const f = files[0];
                if (f) {
                  setFile(f);
                  setCsvData(await readFileText(f));
                }
              }}
            >
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps({
                    className:
                      'dropzone-input select-none cursor-pointer flex p-10 items-center justify-center text-center shadow-md rounded-md',
                  })}
                >
                  <input
                    {...getInputProps({ 'aria-label': t(translations.upload) })}
                  />
                  {file ? (
                    <FilePreview file={file} />
                  ) : (
                    <div>{t(translations.dropzone)}</div>
                  )}
                </div>
              )}
            </Dropzone>
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
            {preview.outOfRange.length > 0 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                {t(translations.outOfRange, {
                  cells: preview.outOfRange.join('; '),
                })}
                {weightedViewEnabled &&
                  ` ${t(translations.outOfRangeWeighted)}`}
              </Alert>
            )}
            {preview.ok && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{identifierModeLabel}</TableCell>
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
            disabled={!defineValid || !identifierReady}
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
