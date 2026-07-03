import { useCallback, useEffect, useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import Papa from 'papaparse';
import type {
  IdentifierMode,
  ImportColumnAction,
  ImportColumnMapping,
  ImportPreviewRequest,
  ImportPreviewResult,
} from 'types/course/gradebook';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { previewImport } from '../../operations';
import { getExternalAssessments, getStudents } from '../../selectors';

import {
  classifyColumns,
  type ColumnAction,
  type ColumnConfig,
  type ColumnState,
  detectUploadBlock,
  isNoGrade,
  isNumeric,
  type UploadBlock,
} from './importValidation';

const PREVIEW_DEBOUNCE_MS = 400;

const translations = defineMessages({
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
});

const importErrorCode = (
  error: unknown,
): { message: string; identifiers?: string[] } | null => {
  const msg = (
    error as {
      response?: {
        data?: { errors?: { message?: string; identifiers?: string[] } };
      };
    }
  )?.response?.data?.errors?.message;
  if (!msg) return null;
  return (
    error as {
      response: {
        data: { errors: { message: string; identifiers?: string[] } };
      };
    }
  ).response.data.errors;
};

export type { ColumnState } from './importValidation';

export interface UseImportMapping {
  headers: string[];
  identifierMode: IdentifierMode;
  setIdentifierMode: (m: IdentifierMode) => void;
  identifierColumn: string; // always headers[0] (or '' before upload)
  columns: ColumnState[]; // all non-identifier columns, CSV order
  uploadBlock: UploadBlock | null;
  setColumnAction: (header: string, action: ColumnAction) => void;
  setCreateTitle: (header: string, title: string) => void;
  setExistingTarget: (header: string, name: string) => void;
  setCreateMaxGrade: (header: string, max: number) => void;
  setCreateWeight: (header: string, weight: number) => void;
  parseFile: (csvData: string) => void;
  canPreview: boolean;
  preview: ImportPreviewResult | null;
  previewing: boolean;
  previewError: string | null;
  buildRequest: () => ImportPreviewRequest;
}

const useImportMapping = (): UseImportMapping => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const existingAssessments = useAppSelector(getExternalAssessments);
  const students = useAppSelector(getStudents);

  const [csvData, setCsvData] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  // PapaParse (header:true) silently renames duplicate columns (Midterm ->
  // Midterm_1), so `meta.fields` never reveals duplicates. Keep the raw header
  // row separately so detectUploadBlock can reject true duplicates.
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [identifierMode, setIdentifierMode] =
    useState<IdentifierMode>('external_id');
  const [configs, setConfigs] = useState<ColumnConfig[]>([]);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // The identifier is always the first CSV column; detectUploadBlock enforces
  // that its header actually matches the chosen mode.
  const identifierColumn = headers[0] ?? '';

  const existing = useMemo(
    () =>
      existingAssessments.map((a) => ({
        name: a.title,
        maximumGrade: a.maxGrade,
        weight: 0, // weight is looked up for display only; import ignores it
      })),
    [existingAssessments],
  );

  const parseFile = useCallback(
    (data: string): void => {
      setCsvData(data);
      const result = Papa.parse<Record<string, string>>(data, {
        header: true,
      });
      const fields = result.meta.fields ?? [];
      const parsedRows = result.data;

      // Re-read the un-renamed header row (no header mode, first line only) so
      // duplicate columns are visible to detectUploadBlock.
      const rawHeaderRow =
        Papa.parse<string[]>(data, { preview: 1 }).data[0] ?? [];

      const idColumn = fields[0] ?? '';
      const existingTitleMatch = (header: string): string | undefined =>
        existingAssessments.find(
          (a) => a.title.toLowerCase() === header.toLowerCase(),
        )?.title;

      const newConfigs: ColumnConfig[] = fields
        .filter((h) => h !== idColumn)
        .map((header) => {
          const matchedTitle = existingTitleMatch(header);
          if (matchedTitle) {
            return {
              header,
              action: 'existing' as const,
              newTitle: header,
              newMaxGrade: 100,
              newWeight: 0,
              existingTarget: matchedTitle,
            };
          }

          const hasNumericCell = parsedRows.some((row) => {
            const raw = row[header] ?? '';
            return !isNoGrade(raw) && isNumeric(raw);
          });

          return {
            header,
            action: hasNumericCell ? ('create' as const) : ('ignore' as const),
            newTitle: header,
            newMaxGrade: 100,
            newWeight: 0,
            existingTarget: '',
          };
        });

      setHeaders(fields);
      setRawHeaders(rawHeaderRow);
      setRows(parsedRows);
      setConfigs(newConfigs);
      setPreview(null);
    },
    [existingAssessments],
  );

  const patch = useCallback(
    (header: string, next: Partial<ColumnConfig>): void => {
      setConfigs((cs) =>
        cs.map((c) => (c.header === header ? { ...c, ...next } : c)),
      );
    },
    [],
  );

  const setColumnAction = useCallback(
    (header: string, action: ColumnAction): void => patch(header, { action }),
    [patch],
  );
  const setCreateTitle = useCallback(
    (header: string, title: string): void => patch(header, { newTitle: title }),
    [patch],
  );
  const setExistingTarget = useCallback(
    (header: string, name: string): void =>
      patch(header, { action: 'existing', existingTarget: name }),
    [patch],
  );
  const setCreateMaxGrade = useCallback(
    (header: string, max: number): void => patch(header, { newMaxGrade: max }),
    [patch],
  );
  const setCreateWeight = useCallback(
    (header: string, weight: number): void =>
      patch(header, { newWeight: weight }),
    [patch],
  );

  const columns = useMemo(
    () => classifyColumns(configs, rows, existing),
    [configs, rows, existing],
  );

  const uploadBlock = useMemo(
    () => detectUploadBlock(rawHeaders, rows, identifierMode, students),
    [rawHeaders, rows, identifierMode, students],
  );

  const canPreview = useMemo(
    () =>
      uploadBlock === null &&
      columns.some((c) => c.action !== 'ignore') &&
      columns.every((c) => c.status === 'ok'),
    [uploadBlock, columns],
  );

  const buildRequest = useCallback((): ImportPreviewRequest => {
    const mappings: ImportColumnMapping[] = columns
      .filter((c) => c.action !== 'ignore')
      .map((c) => {
        const target = c.action === 'create' ? c.newTitle : c.existingTarget;
        const mapping: ImportColumnMapping = {
          header: c.header,
          action: c.action as ImportColumnAction,
          target,
        };
        if (c.action === 'create') {
          mapping.maxGrade = c.newMaxGrade;
          mapping.weight = c.newWeight;
        }
        return mapping;
      });

    return { identifierMode, identifierColumn, csvData, mappings };
  }, [columns, identifierMode, identifierColumn, csvData]);

  const extractMessage = useCallback(
    (error: unknown): string => {
      const known = importErrorCode(error);
      if (known?.message === 'empty_csv') {
        return t(translations.emptyCsv);
      }
      if (known?.message === 'duplicate_identifier') {
        const ids = known.identifiers ?? [];
        return t(translations.duplicateIdentifier, {
          count: ids.length,
          ids: ids.join(', '),
        });
      }
      return t(translations.previewError);
    },
    [t],
  );

  useEffect(() => {
    if (!canPreview) {
      setPreview(null);
      setPreviewing(false);
      return undefined;
    }

    setPreviewError(null);
    setPreviewing(true);
    const timer = setTimeout(() => {
      dispatch(previewImport(buildRequest()))
        .then((result) => setPreview(result))
        .catch((err: unknown) => setPreviewError(extractMessage(err)))
        .finally(() => setPreviewing(false));
    }, PREVIEW_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [canPreview, buildRequest, dispatch, extractMessage]);

  return {
    headers,
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
    previewing,
    previewError,
    buildRequest,
  };
};

export default useImportMapping;
