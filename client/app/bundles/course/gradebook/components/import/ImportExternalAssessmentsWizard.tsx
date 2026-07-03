import { FC, useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import { LoadingButton } from '@mui/lab';
import type { SxProps, Theme } from '@mui/material';
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link as MuiLink,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { ExistingExternalAssessment } from 'types/course/gradebook';

import SegmentedSwitch from 'lib/components/core/buttons/SegmentedSwitch';
import Link from 'lib/components/core/Link';
import { FilePreview } from 'lib/components/form/fields/SingleFileInput';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { commitImport } from '../../operations';
import { getStudents } from '../../selectors';

import {
  exampleCsv,
  identifierHeader,
  readFileText,
  templateDataUri,
} from './buildTemplate';
import ColumnMappingTable from './ColumnMappingTable';
import ExternalGradeConflictPrompt from './ExternalGradeConflictPrompt';
import useImportMapping from './useImportMapping';

const translations = defineMessages({
  title: {
    id: 'course.gradebook.ImportWizard.title',
    defaultMessage: 'Import external assessments',
  },
  stepUpload: {
    id: 'course.gradebook.ImportWizard.stepUpload',
    defaultMessage: 'Upload',
  },
  stepMap: {
    id: 'course.gradebook.ImportWizard.stepMap',
    defaultMessage: 'Map columns',
  },
  stepPreview: {
    id: 'course.gradebook.ImportWizard.stepPreview',
    defaultMessage: 'Preview',
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
      "Your CSV's first column must be {headers} to identify students.",
  },
  exampleHeader: {
    id: 'course.gradebook.ImportWizard.exampleHeader',
    defaultMessage: 'Example ',
  },
  template: {
    id: 'course.gradebook.ImportWizard.template',
    defaultMessage: '(Template File)',
  },
  blockUnreadable: {
    id: 'course.gradebook.ImportWizard.blockUnreadable',
    defaultMessage:
      "We couldn't read any columns from this file. Upload a CSV with a header row.",
  },
  blockDuplicateHeaders: {
    id: 'course.gradebook.ImportWizard.blockDuplicateHeaders',
    defaultMessage:
      'This file has duplicate column names ({headers}). Rename them so each is unique, then re-upload.',
  },
  blockIdentifierNotFirst: {
    id: 'course.gradebook.ImportWizard.blockIdentifierNotFirst',
    defaultMessage:
      'The first column must be “{expected}”, but it is “{found}”. Put the identifier first, or switch how you match students above.',
  },
  blockNoGradeColumns: {
    id: 'course.gradebook.ImportWizard.blockNoGradeColumns',
    defaultMessage:
      'This file only has the identifier column. Add at least one grade column, then re-upload.',
  },
  blockNoDataRows: {
    id: 'course.gradebook.ImportWizard.blockNoDataRows',
    defaultMessage:
      'This file has no data rows. Add at least one student row, then re-upload.',
  },
  identifierColumnStatic: {
    id: 'course.gradebook.ImportWizard.identifierColumnStatic',
    defaultMessage: 'Identifier column',
  },
  dropzone: {
    id: 'course.gradebook.ImportWizard.dropzone',
    defaultMessage: 'Drag a CSV here, or click to choose a file',
  },
  upload: {
    id: 'course.gradebook.ImportWizard.upload',
    defaultMessage: 'Upload filled CSV',
  },
  back: { id: 'course.gradebook.ImportWizard.back', defaultMessage: 'Back' },
  next: { id: 'course.gradebook.ImportWizard.next', defaultMessage: 'Next' },
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
  commitError: {
    id: 'course.gradebook.ImportWizard.commitError',
    defaultMessage: 'Import failed. Nothing was saved.',
  },
  // Reuses the exact id + copy B5 already added for ColumnMappingTable's own
  // success path; this wizard fires the same toast on a clean commit.
  importSuccess: {
    id: 'course.gradebook.ImportWizard.importSuccess',
    defaultMessage:
      'Imported grades. Created {count, plural, one {# external assessment} other {# external assessments}}.',
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
  weightedViewEnabled: boolean;
  existingAssessments: ExistingExternalAssessment[];
}

type WizardStep = 'upload' | 'map' | 'preview';

// Keep every alert's text at body2 size and black so the error (red) and
// warning (amber) blocks read identically; the severity icon keeps its color.
const alertSx: SxProps<Theme> = {
  mb: 1,
  color: 'common.black',
  '& .MuiAlertTitle-root': { typography: 'body2' },
  '& .MuiAlert-message .MuiTypography-root': { typography: 'body2' },
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
  const [step, setStep] = useState<WizardStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingCommit, setPendingCommit] = useState<'keep' | 'replace' | null>(
    null,
  );

  const {
    identifierMode,
    setIdentifierMode,
    identifierColumn,
    columns,
    uploadBlock,
    setColumnAction,
    setCreateTitle,
    setExistingTarget,
    setCreateMaxGrade,
    setCreateWeight,
    parseFile,
    canPreview,
    preview,
    previewError,
    buildRequest,
  } = useImportMapping();

  const students = useAppSelector(getStudents);
  const missingStudents = students.filter(
    (s) => s.externalId == null || s.externalId === '',
  );
  const identifierReady =
    identifierMode === 'email' || missingStudents.length === 0;
  const identifierModeLabel = t(
    identifierMode === 'email' ? translations.email : translations.externalId,
  );

  const uploadBlockMessage = ((): string | null => {
    if (!uploadBlock) return null;
    switch (uploadBlock.kind) {
      case 'unreadable':
        return t(translations.blockUnreadable);
      case 'duplicateHeaders':
        return t(translations.blockDuplicateHeaders, {
          headers: uploadBlock.headers.join(', '),
        });
      case 'identifierNotFirst':
        return t(translations.blockIdentifierNotFirst, {
          expected: uploadBlock.expected,
          found: uploadBlock.found,
        });
      case 'noGradeColumns':
        return t(translations.blockNoGradeColumns);
      case 'noDataRows':
        return t(translations.blockNoDataRows);
      case 'unknownIdentifiers':
        return t(
          identifierMode === 'email'
            ? translations.unresolvedEmail
            : translations.unresolvedExternalId,
          {
            count: uploadBlock.ids.length,
            ids: uploadBlock.ids.join(', '),
          },
        );
      default:
        return null;
    }
  })();

  useEffect(() => {
    if (!open) {
      setStep('upload');
      setFile(null);
      setConflictOpen(false);
      setPendingCommit(null);
      setBusy(false);
      setIdentifierMode('external_id');
      // Blows away the hook's parsed headers/mappings/preview so reopening
      // the wizard starts from a clean slate, the same way a fresh mount
      // would — useImportMapping has no explicit reset, but parsing an empty
      // string drives it back to its initial shape.
      parseFile('');
    }
  }, [open]);

  useEffect(() => {
    if (step === 'preview' && previewError) {
      toast.error(previewError);
    }
  }, [step, previewError]);

  const onDrop = async (files: File[]): Promise<void> => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    const text = await readFileText(f);
    parseFile(text);
  };

  const doCommit = async (onConflict: 'keep' | 'replace'): Promise<void> => {
    setBusy(true);
    setPendingCommit(onConflict);
    try {
      const summary = await dispatch(
        commitImport({ ...buildRequest(), onConflict }),
      );
      if (summary.createdComponents > 0) {
        toast.success(
          t(translations.importSuccess, { count: summary.createdComponents }),
          { autoClose: false },
        );
      }
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
          <Alert severity="error" sx={alertSx}>
            <Typography variant="body2">
              {t(
                identifierMode === 'email'
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
          <Alert severity="error" sx={alertSx}>
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
          <Alert severity="warning" sx={alertSx}>
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
          <Alert severity="warning" sx={alertSx}>
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

  const stepIndex = { upload: 0, map: 1, preview: 2 }[step];

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
        <Stepper activeStep={stepIndex} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>{t(translations.stepUpload)}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t(translations.stepMap)}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t(translations.stepPreview)}</StepLabel>
          </Step>
        </Stepper>

        {step === 'upload' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Typography component="span" variant="subtitle2">
                {t(translations.identifierMode)}
              </Typography>
              <SegmentedSwitch
                ariaLabel={t(translations.identifierMode)}
                onChange={setIdentifierMode}
                options={[
                  {
                    value: 'external_id' as const,
                    label: t(translations.externalId),
                  },
                  { value: 'email' as const, label: t(translations.email) },
                ]}
                value={identifierMode}
              />
            </div>

            {identifierMode === 'external_id' && (
              <Alert severity={identifierReady ? 'info' : 'warning'}>
                {identifierReady
                  ? t(translations.externalIdHint, {
                      link: (chunks) => (
                        <MuiLink href={`/courses/${courseId}/students`}>
                          {chunks}
                        </MuiLink>
                      ),
                    })
                  : t(translations.externalIdBlocked, {
                      name: missingStudents[0]?.name ?? '',
                      count: missingStudents.length - 1,
                      link: (chunks) => (
                        <MuiLink href={`/courses/${courseId}/students`}>
                          {chunks}
                        </MuiLink>
                      ),
                    })}
              </Alert>
            )}

            <Typography variant="body2">
              {t(translations.requiredHeaders, {
                headers: identifierHeader(identifierMode),
              })}
            </Typography>

            <div>
              <Typography variant="body2">
                <strong>{t(translations.exampleHeader)}</strong>
                <Link
                  download="template.csv"
                  href={templateDataUri(identifierMode)}
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  {t(translations.template)}
                  <DownloadIcon
                    fontSize="small"
                    style={{ verticalAlign: 'bottom' }}
                  />
                </Link>
              </Typography>
              <pre>{exampleCsv(identifierMode)}</pre>
            </div>

            {file && uploadBlockMessage && (
              <Alert severity="error" sx={alertSx}>
                <Typography variant="body2">{uploadBlockMessage}</Typography>
              </Alert>
            )}

            <Dropzone
              accept={{ 'text/csv': ['.csv'] }}
              multiple={false}
              onDrop={onDrop}
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

        {step === 'map' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Typography component="span" variant="subtitle2">
                {t(translations.identifierColumnStatic)}
              </Typography>
              <Typography variant="body2">
                {identifierColumn} ({identifierModeLabel})
              </Typography>
            </div>

            <ColumnMappingTable
              columns={columns}
              existing={existingAssessments}
              setColumnAction={setColumnAction}
              setCreateMaxGrade={setCreateMaxGrade}
              setCreateTitle={setCreateTitle}
              setCreateWeight={setCreateWeight}
              setExistingTarget={setExistingTarget}
              weightedViewEnabled={weightedViewEnabled}
            />
          </div>
        )}

        {step === 'preview' && (
          <>
            {renderAlerts(true)}
            {preview?.ok && preview.conflictRows.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t(translations.willChangeExisting, {
                  count: preview.conflictRows.length,
                })}
              </Alert>
            )}
            {preview?.ok && (
              <>
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
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose} variant="outlined">
          {t(translations.cancel)}
        </Button>
        {step !== 'upload' && (
          <Button
            disabled={busy}
            onClick={() => setStep(step === 'preview' ? 'map' : 'upload')}
          >
            {t(translations.back)}
          </Button>
        )}
        {step === 'upload' && (
          <Button
            disabled={!identifierReady || !!uploadBlock}
            onClick={() => setStep('map')}
            variant="contained"
          >
            {t(translations.next)}
          </Button>
        )}
        {step === 'map' && (
          <Button
            disabled={!canPreview}
            onClick={() => setStep('preview')}
            variant="contained"
          >
            {t(translations.next)}
          </Button>
        )}
        {step === 'preview' && preview?.ok && !previewError && (
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
