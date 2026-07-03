import type {
  ExistingExternalAssessment,
  IdentifierMode,
} from 'types/course/gradebook';

export type ColumnAction = 'ignore' | 'create' | 'existing';
export type ColumnStatus = 'ok' | 'incomplete' | 'error';
export type ImportColumnError =
  | 'nonNumeric'
  | 'titleCollision'
  | 'duplicateTitle'
  | 'duplicateExisting';

// Mutable per-column configuration the user drives via the table's cells.
export interface ColumnConfig {
  header: string;
  action: ColumnAction;
  newTitle: string; // create-mode title; default = header
  newMaxGrade: number; // create-mode; default 100
  newWeight: number; // create-mode; default 0 (used only when weighted)
  existingTarget: string; // existing-mode component name; '' = not chosen
}

export interface ColumnState extends ColumnConfig {
  status: ColumnStatus;
  error?: ImportColumnError;
  badCells: { row: number; value: string }[];
}
// NOTE: for existing rows the greyed max/weight are looked up by the table from
// its own `existing` prop (which carries the real weightage). They are NOT on
// ColumnState because the hook's selector does not expose per-assessment weight.

export type UploadBlock =
  | { kind: 'unreadable' }
  | { kind: 'duplicateHeaders'; headers: string[] }
  | { kind: 'identifierNotFirst'; expected: string; found: string }
  | { kind: 'noGradeColumns' }
  | { kind: 'noDataRows' }
  | { kind: 'unknownIdentifiers'; ids: string[] };

// Cells that mean "no grade entered", not "bad data" — case-insensitive.
const NO_GRADE_VALUES = new Set(['', '-', '–', '—', 'n/a']);
const NUMERIC_PATTERN = /^-?\d+(\.\d+)?$/;

export const isNoGrade = (raw: string): boolean =>
  NO_GRADE_VALUES.has(raw.trim().toLowerCase());
export const isNumeric = (raw: string): boolean =>
  NUMERIC_PATTERN.test(raw.trim());

const canonicalIdentifierHeader = (mode: IdentifierMode): string =>
  mode === 'email' ? 'Email' : 'External ID';

const key = (s: string): string => s.trim().toLowerCase();

// Minimal roster shape for identifier matching (StudentData is assignable).
export interface RosterMember {
  externalId?: string | null;
  email?: string | null;
}

// Normalize an identifier for matching: trim always; lowercase for email
// (emails are case-insensitive). Deliberately lenient so a valid row is never
// wrongly blocked — the server preview stays the authoritative check.
const normIdentifier = (raw: string, mode: IdentifierMode): string =>
  mode === 'email' ? raw.trim().toLowerCase() : raw.trim();

// First-column identifiers with no matching student in the course roster,
// de-duplicated in first-seen order. Blank identifier cells are ignored
// (trailing/empty rows), not reported as unknown.
export const unknownIdentifiers = (
  rows: Record<string, string>[],
  identifierColumn: string,
  identifierMode: IdentifierMode,
  roster: RosterMember[],
): string[] => {
  const known = new Set(
    roster
      .map((m) => (identifierMode === 'email' ? m.email : m.externalId) ?? '')
      .filter((v) => v.trim() !== '')
      .map((v) => normIdentifier(v, identifierMode)),
  );
  const seen = new Set<string>();
  const unknown: string[] = [];
  rows.forEach((row) => {
    const raw = (row[identifierColumn] ?? '').trim();
    if (raw === '' || seen.has(raw)) return;
    seen.add(raw);
    if (!known.has(normIdentifier(raw, identifierMode))) unknown.push(raw);
  });
  return unknown;
};

export const classifyColumns = (
  configs: ColumnConfig[],
  rows: Record<string, string>[],
  existing: ExistingExternalAssessment[],
): ColumnState[] => {
  const existingTitles = new Set(existing.map((a) => key(a.name)));

  // Count colliding targets so every member of a pair/group is flagged.
  const createTitleCounts = new Map<string, number>();
  const existingTargetCounts = new Map<string, number>();
  configs.forEach((c) => {
    if (c.action === 'create' && c.newTitle.trim() !== '') {
      const k = key(c.newTitle);
      createTitleCounts.set(k, (createTitleCounts.get(k) ?? 0) + 1);
    } else if (c.action === 'existing' && c.existingTarget !== '') {
      const k = key(c.existingTarget);
      existingTargetCounts.set(k, (existingTargetCounts.get(k) ?? 0) + 1);
    }
  });

  return configs.map((c) => {
    const active = c.action !== 'ignore';
    const badCells: { row: number; value: string }[] = [];
    if (active) {
      rows.forEach((row, index) => {
        const raw = row[c.header] ?? '';
        if (isNoGrade(raw) || isNumeric(raw)) return;
        badCells.push({ row: index + 1, value: raw });
      });
    }

    let status: ColumnStatus = 'ok';
    let error: ImportColumnError | undefined;

    if (active && badCells.length > 0) {
      status = 'error';
      error = 'nonNumeric';
    } else if (c.action === 'create') {
      const title = c.newTitle.trim();
      if (title === '') {
        status = 'incomplete';
      } else if (existingTitles.has(key(title))) {
        status = 'error';
        error = 'titleCollision';
      } else if ((createTitleCounts.get(key(title)) ?? 0) > 1) {
        status = 'error';
        error = 'duplicateTitle';
      }
    } else if (c.action === 'existing') {
      if (c.existingTarget === '') {
        status = 'incomplete';
      } else if ((existingTargetCounts.get(key(c.existingTarget)) ?? 0) > 1) {
        status = 'error';
        error = 'duplicateExisting';
      }
    }

    return { ...c, status, error, badCells };
  });
};

const hasData = (rows: Record<string, string>[]): boolean =>
  rows.some((row) => Object.values(row).some((v) => (v ?? '').trim() !== ''));

export const detectUploadBlock = (
  headers: string[],
  rows: Record<string, string>[],
  identifierMode: IdentifierMode,
  roster: RosterMember[],
): UploadBlock | null => {
  if (headers.length === 0) return { kind: 'unreadable' };

  const seen = new Map<string, number>();
  headers.forEach((h) => seen.set(key(h), (seen.get(key(h)) ?? 0) + 1));
  const duplicateHeaders = headers.filter((h) => (seen.get(key(h)) ?? 0) > 1);
  if (duplicateHeaders.length > 0) {
    return {
      kind: 'duplicateHeaders',
      headers: [...new Set(duplicateHeaders)],
    };
  }

  const expected = canonicalIdentifierHeader(identifierMode);
  if (key(headers[0]) !== key(expected)) {
    return { kind: 'identifierNotFirst', expected, found: headers[0] };
  }

  if (headers.length < 2) return { kind: 'noGradeColumns' };
  if (!hasData(rows)) return { kind: 'noDataRows' };

  const unknown = unknownIdentifiers(rows, headers[0], identifierMode, roster);
  if (unknown.length > 0) return { kind: 'unknownIdentifiers', ids: unknown };

  return null;
};
