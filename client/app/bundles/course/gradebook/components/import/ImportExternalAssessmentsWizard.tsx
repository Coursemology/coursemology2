import { FC, useEffect, useMemo, useState } from 'react';
import Dropzone from 'react-dropzone';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Add, Delete } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  AlertTitle,
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
import type {
  ExistingExternalAssessment,
  IdentifierMode,
  ImportComponent,
  ImportPreviewResult,
} from 'types/course/gradebook';

import SegmentedSwitch from 'lib/components/core/buttons/SegmentedSwitch';
import { FilePreview } from 'lib/components/form/fields/SingleFileInput';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { commitImport, previewImport } from '../../operations';
import { getStudents } from '../../selectors';

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
    defaultMessage:
      'Your CSV needs these column headers: {headers}. ‘{identifier}’ must be the first column.',
  },
  headerErrorsHeading: {
    id: 'course.gradebook.ImportWizard.headerErrorsHeading',
    defaultMessage: 'These headers need fixing:',
  },
  headerErrorsClosing: {
    id: 'course.gradebook.ImportWizard.headerErrorsClosing',
    defaultMessage: 'Correct these in your CSV, then re-upload.',
  },
  identifierNotFirst: {
    id: 'course.gradebook.ImportWizard.identifierNotFirst',
    defaultMessage: '‘{identifier}’ must be the first column.',
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
  unresolvedEmail: {
    id: 'course.gradebook.ImportWizard.unresolvedEmail',
    defaultMessage:
      '{count, plural, one {This email address was not found in the course: {ids}} other {These email addresses were not found in the course: {ids}}}',
  },
  unresolvedExternalId: {
    id: 'course.gradebook.ImportWizard.unresolvedExternalId',
    defaultMessage:
      '{count, plural, one {This external ID was not found in the course: {ids}} other {These external IDs were not found in the course: {ids}}}',
  },
  malformed: {
    id: 'course.gradebook.ImportWizard.malformed',
    defaultMessage: 'These cells do not contain valid numbers:',
  },
  malformedMore: {
    id: 'course.gradebook.ImportWizard.malformedMore',
    defaultMessage: 'and {count} more',
  },
  outOfRangeTitle: {
    id: 'course.gradebook.ImportWizard.outOfRangeTitle',
    defaultMessage: 'Some grades are outside their valid range.',
  },
  outOfRangeSubtitle: {
    id: 'course.gradebook.ImportWizard.outOfRangeSubtitle',
    defaultMessage:
      'Grades will be imported exactly as entered. This is only a warning; you can turn off this warning in Manage External Assessments. If these out-of-range grades are intentional, continue.',
  },
  outOfRangeWeightedSubtitle: {
    id: 'course.gradebook.ImportWizard.outOfRangeWeightedSubtitle',
    defaultMessage:
      'Grades will be imported exactly as entered. This is only a warning; you can turn off this warning in Manage External Assessments. Out-of-range grades are only floored or capped in the weighted total. If these out-of-range grades are intentional, continue.',
  },
  reassignmentTitle: {
    id: 'course.gradebook.ImportWizard.reassignmentTitle',
    defaultMessage: 'Some identifiers now match a different student',
  },
  reassignmentSubtitle: {
    id: 'course.gradebook.ImportWizard.reassignmentSubtitle',
    defaultMessage:
      'These identifiers were previously imported for another student. Grades are matched by the current student, not the identifier — confirm these are the people you intend before importing.',
  },
  committed: {
    id: 'course.gradebook.ImportWizard.committed',
    defaultMessage: 'Import complete.',
  },
  headerSuggestion: {
    id: 'course.gradebook.ImportWizard.headerSuggestion',
    defaultMessage:
      'No column named ‘{suggestion}’ — did you mean ‘{expected}’?',
  },
  duplicateHeaders: {
    id: 'course.gradebook.ImportWizard.duplicateHeaders',
    defaultMessage:
      '{count, plural, one {This column appears more than once: {dupes}.} other {These columns appear more than once: {dupes}.}}',
  },
  missingHeaders: {
    id: 'course.gradebook.ImportWizard.missingHeaders',
    defaultMessage:
      '{count, plural, one {Your CSV is missing this column: {missing}.} other {Your CSV is missing these columns: {missing}.}}',
  },
  unrecognizedHeaders: {
    id: 'course.gradebook.ImportWizard.unrecognizedHeaders',
    defaultMessage:
      '{count, plural, one {This column isn’t recognized: {unrecognized}.} other {These columns aren’t recognized: {unrecognized}.}}',
  },
  commitError: {
    id: 'course.gradebook.ImportWizard.commitError',
    defaultMessage: 'Import failed. Nothing was saved.',
  },
  previewError: {
    id: 'course.gradebook.ImportWizard.previewError',
    defaultMessage: 'Could not verify the file. Please try again.',
  },
  emptyCsv: {
    id: 'course.gradebook.ImportWizard.emptyCsv',
    defaultMessage:
      'The uploaded file has no data rows. Add at least one student row and try again.',
  },
  duplicateIdentifier: {
    id: 'course.gradebook.ImportWizard.duplicateIdentifier',
    defaultMessage:
      'The file lists {count, plural, one {an identifier} other {identifiers}} more than once: {ids}. Each student should appear on a single row.',
  },
  externalIdHint: {
    id: 'course.gradebook.ImportWizard.externalIdHint',
    defaultMessage:
      "Matching uses each student's External ID. Keep External IDs up to date in <link>Manage Users</link>.",
  },
  externalIdBlocked: {
    id: 'course.gradebook.ImportWizard.externalIdBlocked',
    defaultMessage:
      '{count, plural, =0 {{name} has no External ID} one {{name} and one other student have no External ID} other {{name} and # other students have no External ID}}. Add the missing IDs in <link>Manage Users</link> to import by External ID.',
  },
  previewRows: {
    id: 'course.gradebook.ImportWizard.previewRows',
    defaultMessage:
      'Previewing the first 5 of {totalRows} rows. Check that this preview matches your CSV before continuing.',
  },
  previewFewRows: {
    id: 'course.gradebook.ImportWizard.previewFewRows',
    defaultMessage:
      'Previewing all {totalRows} rows. Check that this preview matches your CSV before continuing.',
  },
  willChangeExisting: {
    id: 'course.gradebook.ImportWizard.willChangeExisting',
    defaultMessage:
      '{count, plural, one {# row contains} other {# rows contain}} changes to existing grades. After checking this preview, click Confirm import to review these conflicts before anything is imported.',
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

interface BadHeaderError {
  message: string;
  missing: string[];
  unrecognized: string[];
  suggestions: { expected: string; didYouMean: string }[];
  duplicates: { name: string; count: number }[];
  identifierNotFirst: boolean;
}

const badHeaderFromError = (error: unknown): BadHeaderError | null => {
  const body = (
    error as { response?: { data?: { errors?: Partial<BadHeaderError> } } }
  )?.response?.data?.errors;
  return body?.message === 'bad_header'
    ? {
        message: body.message,
        missing: body.missing ?? [],
        unrecognized: body.unrecognized ?? [],
        suggestions: body.suggestions ?? [],
        duplicates: body.duplicates ?? [],
        identifierNotFirst: body.identifierNotFirst ?? false,
      }
    : null;
};

const importErrorCode = (
  error: unknown,
): { message: string; identifiers?: string[] } | null => {
  const msg = (
    error as {
      response?: { data?: { errors?: { message?: string; identifiers?: string[] } } };
    }
  )?.response?.data?.errors?.message;
  if (!msg) return null;
  return (
    error as {
      response: { data: { errors: { message: string; identifiers?: string[] } } };
    }
  ).response.data.errors;
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
  const [headerError, setHeaderError] = useState<BadHeaderError | null>(null);
  const [pendingCommit, setPendingCommit] = useState<'keep' | 'replace' | null>(
    null,
  );

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
      setPendingCommit(null);
      setBusy(false);
      setHeaderError(null);
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
      if (result.ok) setStep(2);
    } catch (error) {
      const badHeader = badHeaderFromError(error);
      if (badHeader) {
        setHeaderError(badHeader);
      } else {
        const known = importErrorCode(error);
        if (known?.message === 'empty_csv') {
          toast.error(t(translations.emptyCsv));
        } else if (known?.message === 'duplicate_identifier') {
          const ids = known.identifiers ?? [];
          toast.error(
            t(translations.duplicateIdentifier, { count: ids.length, ids: ids.join(', ') }),
          );
        } else {
          toast.error(t(translations.previewError));
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const doCommit = async (onConflict: 'keep' | 'replace'): Promise<void> => {
    setBusy(true);
    setPendingCommit(onConflict);
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
      setPendingCommit(null);
    }
  };

  const onConfirm = (): void => {
    if (preview && preview.conflictRows.length > 0) setConflictOpen(true);
    else doCommit('replace');
  };

  const renderAlerts = (includeBlocking: boolean): JSX.Element | null => {
    if (!preview) return null;

    return (
      <>
        {includeBlocking && !preview.ok && preview.unresolved.length > 0 && (
          <Alert severity="error" sx={{ mb: 1 }}>
            <Typography variant="body2">
              {t(
                mode === 'email'
                  ? translations.unresolvedEmail
                  : translations.unresolvedExternalId,
                {
                  count: preview.unresolved.length,
                  ids: preview.unresolved.join(', '),
                },
              )}
            </Typography>
          </Alert>
        )}

        {includeBlocking && !preview.ok && preview.malformed.length > 0 && (
          <Alert severity="error" sx={{ mb: 1 }}>
            <Typography variant="body2">{t(translations.malformed)}</Typography>
            <ul className="m-0 pl-5">
              {preview.malformed.slice(0, 5).map((cell) => (
                <Typography key={cell} component="li" variant="body2">
                  {cell}
                </Typography>
              ))}
              {preview.malformed.length > 5 && (
                <Typography component="li" variant="body2">
                  {t(translations.malformedMore, {
                    count: preview.malformed.length - 5,
                  })}
                </Typography>
              )}
            </ul>
          </Alert>
        )}

        {preview.outOfRange.length > 0 && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            <AlertTitle>{t(translations.outOfRangeTitle)}</AlertTitle>

            <ul>
              {preview.outOfRange.slice(0, 10).map((cell) => (
                <Typography
                  key={`${cell.identifier}-${cell.component}`}
                  component="li"
                >
                  {cell.kind === 'above'
                    ? `${cell.identifier} - ${cell.component}: ${cell.grade} (max ${cell.max})`
                    : `${cell.identifier} - ${cell.component}: ${cell.grade} (min 0)`}
                </Typography>
              ))}

              {preview.outOfRange.length > 10 && (
                <Typography component="li">
                  +{preview.outOfRange.length - 10} more
                </Typography>
              )}
            </ul>

            {weightedViewEnabled && (
              <Typography>
                {t(translations.outOfRangeWeightedSubtitle)}
              </Typography>
            )}

            {!weightedViewEnabled && (
              <Typography>{t(translations.outOfRangeSubtitle)}</Typography>
            )}
          </Alert>
        )}

        {preview.reassignments.length > 0 && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            <AlertTitle>{t(translations.reassignmentTitle)}</AlertTitle>

            <ul>
              {preview.reassignments.slice(0, 5).map((entry) => (
                <Typography key={entry.identifier} component="li">
                  {`${entry.identifier}: now ${entry.currentStudent} (was ${entry.previousStudents.join(
                    ', ',
                  )})`}
                </Typography>
              ))}

              {preview.reassignments.length > 5 && (
                <Typography component="li">
                  +{preview.reassignments.length - 5} more
                </Typography>
              )}
            </ul>

            <Typography>{t(translations.reassignmentSubtitle)}</Typography>
          </Alert>
        )}
      </>
    );
  };

  return (
    <Dialog
      disableEscapeKeyDown
      fullWidth
      maxWidth="md"
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') return;
        onClose();
      }}
      open={open}
    >
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
                      count: missingStudents.length - 1,
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
                identifier: identifierHeader(mode),
              })}
            </Typography>
            {headerError && (
              <Alert severity="error">
                <Typography variant="body2">
                  {t(translations.headerErrorsHeading)}
                </Typography>
                <ul className="m-0 pl-5">
                  {headerError.identifierNotFirst && (
                    <Typography component="li" variant="body2">
                      {t(translations.identifierNotFirst, {
                        identifier: identifierHeader(mode),
                      })}
                    </Typography>
                  )}
                  {headerError.suggestions.map((s) => (
                    <Typography key={s.expected} component="li" variant="body2">
                      {t(translations.headerSuggestion, {
                        expected: s.expected,
                        suggestion: s.didYouMean,
                      })}
                    </Typography>
                  ))}
                  {headerError.missing.length > 0 && (
                    <Typography component="li" variant="body2">
                      {t(translations.missingHeaders, {
                        count: headerError.missing.length,
                        missing: headerError.missing.join(', '),
                      })}
                    </Typography>
                  )}
                  {headerError.unrecognized.length > 0 && (
                    <Typography component="li" variant="body2">
                      {t(translations.unrecognizedHeaders, {
                        count: headerError.unrecognized.length,
                        unrecognized: headerError.unrecognized.join(', '),
                      })}
                    </Typography>
                  )}
                  {headerError.duplicates.length > 0 && (
                    <Typography component="li" variant="body2">
                      {t(translations.duplicateHeaders, {
                        count: headerError.duplicates.length,
                        dupes: headerError.duplicates
                          .map((d) => `${d.name} (×${d.count})`)
                          .join(', '),
                      })}
                    </Typography>
                  )}
                </ul>
                <Typography sx={{ mt: 1 }} variant="body2">
                  {t(translations.headerErrorsClosing)}
                </Typography>
              </Alert>
            )}
            {preview && !preview.ok && renderAlerts(true)}
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
                  setHeaderError(null);
                  setPreview(null);
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

        {step === 2 && preview?.ok && (
          <>
            {renderAlerts(false)}
            {preview.conflictRows.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t(translations.willChangeExisting, {
                  count: preview.conflictRows.length,
                })}
              </Alert>
            )}
            <div className="overflow-x-auto max-w-full">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{identifierModeLabel}</TableCell>
                    {preview.columnOrder.map((name) => (
                      <TableCell key={name}>{name}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.sample.map((row) => (
                    <TableRow key={row.identifier}>
                      <TableCell>{row.identifier}</TableCell>
                      {preview.columnOrder.map((name) => (
                        <TableCell key={name}>
                          {row.grades[name] ?? '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {preview.totalRows > 5 ? (
              <Typography sx={{ mt: 1 }} variant="body2">
                {t(translations.previewRows, {
                  totalRows: preview.totalRows,
                })}
              </Typography>
            ) : (
              <Typography sx={{ mt: 1 }} variant="body2">
                {t(translations.previewFewRows, {
                  totalRows: preview.totalRows,
                })}
              </Typography>
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
          <LoadingButton
            disabled={busy || csvData === ''}
            loading={busy}
            onClick={runPreview}
            variant="contained"
          >
            {t(translations.verify)}
          </LoadingButton>
        )}
        {step === 2 && preview?.ok && (
          <LoadingButton
            disabled={busy}
            loading={busy}
            onClick={onConfirm}
            variant="contained"
          >
            {t(translations.continue)}
          </LoadingButton>
        )}
      </DialogActions>

      <ExternalGradeConflictPrompt
        componentNames={preview?.columnOrder ?? []}
        disabled={busy}
        identifierLabel={identifierModeLabel}
        keepLoading={pendingCommit === 'keep'}
        onCancel={() => setConflictOpen(false)}
        onKeepExisting={() => doCommit('keep')}
        onReplaceAll={() => doCommit('replace')}
        open={conflictOpen}
        replaceLoading={pendingCommit === 'replace'}
        rows={preview?.conflictRows ?? []}
        totalRows={preview?.totalRows ?? 0}
      />
    </Dialog>
  );
};

export default ImportExternalAssessmentsWizard;
