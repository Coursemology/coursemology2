import { FC } from 'react';
import { defineMessages } from 'react-intl';
import type { SelectChangeEvent } from '@mui/material';
import {
  FormHelperText,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type { ExistingExternalAssessment } from 'types/course/gradebook';

import useTranslation from 'lib/hooks/useTranslation';

import type { ColumnAction, ColumnState } from './importValidation';

const translations = defineMessages({
  helperLine: {
    id: 'course.gradebook.ColumnMappingTable.helperLine',
    defaultMessage:
      'Grade columns must contain only numbers (blank, "-" or "N/A" mean no grade). Columns with non-numeric values can\'t be imported as grades and are set to Don\'t import.',
  },
  csvHeader: {
    id: 'course.gradebook.ColumnMappingTable.csvHeader',
    defaultMessage: 'CSV Header',
  },
  actionLabel: {
    id: 'course.gradebook.ColumnMappingTable.actionLabel',
    defaultMessage: 'Action',
  },
  mapToExisting: {
    id: 'course.gradebook.ColumnMappingTable.mapToExisting',
    defaultMessage: 'Map to existing',
  },
  createNew: {
    id: 'course.gradebook.ColumnMappingTable.createNew',
    defaultMessage: 'Create new',
  },
  dontImport: {
    id: 'course.gradebook.ColumnMappingTable.dontImport',
    defaultMessage: "Don't import",
  },
  selectComponent: {
    id: 'course.gradebook.ColumnMappingTable.selectComponent',
    defaultMessage: 'Select component…',
  },
  titleLabel: {
    id: 'course.gradebook.ColumnMappingTable.titleLabel',
    defaultMessage: 'Title',
  },
  maxLabel: {
    id: 'course.gradebook.ColumnMappingTable.maxLabel',
    defaultMessage: 'Max marks',
  },
  weightLabel: {
    id: 'course.gradebook.ColumnMappingTable.weightLabel',
    defaultMessage: 'Weight',
  },
  nonNumericError: {
    id: 'course.gradebook.ColumnMappingTable.nonNumericError',
    defaultMessage:
      "Row {row} ‘{value}’ isn't a number. To import, fix the CSV and re-upload.",
  },
  titleCollisionError: {
    id: 'course.gradebook.ColumnMappingTable.titleCollisionError',
    defaultMessage:
      'This name is already used by an existing external assessment.',
  },
  duplicateTitleError: {
    id: 'course.gradebook.ColumnMappingTable.duplicateTitleError',
    defaultMessage:
      'Another column also creates an external assessment with this name.',
  },
  duplicateExistingError: {
    id: 'course.gradebook.ColumnMappingTable.duplicateExistingError',
    defaultMessage:
      'Another column is also mapped to this existing external assessment.',
  },
  incompleteHint: {
    id: 'course.gradebook.ColumnMappingTable.incompleteHint',
    defaultMessage: 'Finish mapping the highlighted columns to continue.',
  },
  nothingImportedHint: {
    id: 'course.gradebook.ColumnMappingTable.nothingImportedHint',
    defaultMessage:
      'Set at least one column to Create new or Map to existing to continue.',
  },
  nonGradeColumnNote: {
    id: 'course.gradebook.ColumnMappingTable.nonGradeColumnNote',
    defaultMessage: 'No numeric values found. Treated as a non-grade column.',
  },
});

const DASH = '–';

interface Props {
  columns: ColumnState[];
  existing: ExistingExternalAssessment[];
  weightedViewEnabled: boolean;
  setColumnAction: (header: string, action: ColumnAction) => void;
  setCreateTitle: (header: string, title: string) => void;
  setExistingTarget: (header: string, name: string) => void;
  setCreateMaxGrade: (header: string, max: number) => void;
  setCreateWeight: (header: string, weight: number) => void;
}

const ColumnMappingTable: FC<Props> = ({
  columns,
  existing,
  weightedViewEnabled,
  setColumnAction,
  setCreateTitle,
  setExistingTarget,
  setCreateMaxGrade,
  setCreateWeight,
}) => {
  const { t } = useTranslation();

  // Real max/weight for existing rows live on this prop (the wizard passes the
  // course's actual assessments, with weight) — not on ColumnState.
  const existingByName = new Map(
    existing.map((a) => [a.name.trim().toLowerCase(), a]),
  );

  const dash = (
    <Typography color="text.disabled" variant="body2">
      {DASH}
    </Typography>
  );

  const renderError = (col: ColumnState): JSX.Element | null => {
    if (col.status !== 'error') return null;
    let message: string;
    if (col.error === 'nonNumeric') {
      const first = col.badCells[0];
      message = t(translations.nonNumericError, {
        row: first?.row ?? 0,
        value: first?.value ?? '',
      });
    } else if (col.error === 'titleCollision') {
      message = t(translations.titleCollisionError);
    } else if (col.error === 'duplicateExisting') {
      message = t(translations.duplicateExistingError);
    } else {
      message = t(translations.duplicateTitleError);
    }
    return <FormHelperText error>{message}</FormHelperText>;
  };

  const renderAction = (col: ColumnState): JSX.Element => (
    <Select
      fullWidth
      inputProps={{ 'aria-label': t(translations.actionLabel) }}
      onChange={(e: SelectChangeEvent) =>
        setColumnAction(col.header, e.target.value as ColumnAction)
      }
      size="small"
      value={col.action}
    >
      <MenuItem value="ignore">{t(translations.dontImport)}</MenuItem>
      <MenuItem value="create">{t(translations.createNew)}</MenuItem>
      <MenuItem value="existing">{t(translations.mapToExisting)}</MenuItem>
    </Select>
  );

  const renderTitle = (col: ColumnState): JSX.Element => {
    if (col.action === 'ignore') {
      if (col.hasNumericData) return dash;
      return (
        <FormHelperText sx={{ color: 'text.secondary' }}>
          {t(translations.nonGradeColumnNote)}
        </FormHelperText>
      );
    }
    if (col.action === 'create') {
      return (
        <>
          <TextField
            error={col.status === 'error'}
            fullWidth
            inputProps={{ 'aria-label': t(translations.titleLabel) }}
            onChange={(e) => setCreateTitle(col.header, e.target.value)}
            size="small"
            value={col.newTitle}
          />
          {renderError(col)}
        </>
      );
    }
    return (
      <>
        <Select
          displayEmpty
          error={col.status === 'error'}
          fullWidth
          inputProps={{ 'aria-label': t(translations.mapToExisting) }}
          onChange={(e: SelectChangeEvent) =>
            setExistingTarget(col.header, e.target.value)
          }
          renderValue={(value) =>
            value ? (
              (value as string)
            ) : (
              <Typography
                color="text.secondary"
                component="span"
                fontStyle="italic"
                variant="body2"
              >
                {t(translations.selectComponent)}
              </Typography>
            )
          }
          size="small"
          value={col.existingTarget}
        >
          {existing.map((a) => (
            <MenuItem key={a.name} value={a.name}>
              {a.name}
            </MenuItem>
          ))}
        </Select>
        {renderError(col)}
      </>
    );
  };

  const renderMax = (col: ColumnState): JSX.Element => {
    if (col.action === 'ignore') return dash;
    if (col.action === 'create') {
      return (
        <TextField
          fullWidth
          inputProps={{ 'aria-label': t(translations.maxLabel) }}
          onChange={(e) =>
            setCreateMaxGrade(col.header, Number(e.target.value))
          }
          size="small"
          type="number"
          value={col.newMaxGrade}
        />
      );
    }
    const resolved = existingByName.get(
      col.existingTarget.trim().toLowerCase(),
    );
    return (
      <TextField
        disabled
        fullWidth
        size="small"
        value={resolved?.maximumGrade ?? ''}
      />
    );
  };

  const renderWeight = (col: ColumnState): JSX.Element => {
    if (col.action === 'ignore') return dash;
    if (col.action === 'create') {
      return (
        <TextField
          fullWidth
          inputProps={{ 'aria-label': t(translations.weightLabel) }}
          onChange={(e) => setCreateWeight(col.header, Number(e.target.value))}
          size="small"
          type="number"
          value={col.newWeight}
        />
      );
    }
    const resolved = existingByName.get(
      col.existingTarget.trim().toLowerCase(),
    );
    return (
      <TextField
        disabled
        fullWidth
        size="small"
        value={resolved?.weight ?? ''}
      />
    );
  };

  const incomplete = columns.some((c) => c.status === 'incomplete');
  const nothingImported =
    columns.length > 0 && columns.every((c) => c.action === 'ignore');

  return (
    <div className="flex flex-col gap-3">
      <Typography color="text.secondary" variant="body2">
        {t(translations.helperLine)}
      </Typography>

      <Table size="small" sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '22%' }}>
              {t(translations.csvHeader)}
            </TableCell>
            <TableCell sx={{ width: '26%' }}>
              {t(translations.actionLabel)}
            </TableCell>
            <TableCell sx={{ width: weightedViewEnabled ? '24%' : '38%' }}>
              {t(translations.titleLabel)}
            </TableCell>
            <TableCell sx={{ width: '14%' }}>
              {t(translations.maxLabel)}
            </TableCell>
            {weightedViewEnabled && (
              <TableCell sx={{ width: '14%' }}>
                {t(translations.weightLabel)}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {columns.map((col) => (
            <TableRow
              key={col.header}
              sx={col.action === 'ignore' ? { opacity: 0.6 } : undefined}
            >
              <TableCell sx={{ verticalAlign: 'top', wordBreak: 'break-word' }}>
                <Typography
                  color={
                    col.action === 'ignore' ? 'text.secondary' : 'text.primary'
                  }
                  sx={{ mt: 1 }}
                  variant="body2"
                >
                  {col.header}
                </Typography>
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top' }}>
                {renderAction(col)}
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top' }}>
                {renderTitle(col)}
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top' }}>
                {renderMax(col)}
              </TableCell>
              {weightedViewEnabled && (
                <TableCell sx={{ verticalAlign: 'top' }}>
                  {renderWeight(col)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(incomplete || nothingImported) && (
        <Typography color="text.secondary" variant="body2">
          {nothingImported
            ? t(translations.nothingImportedHint)
            : t(translations.incompleteHint)}
        </Typography>
      )}
    </div>
  );
};

export default ColumnMappingTable;
