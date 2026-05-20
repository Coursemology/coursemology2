import { downloadCsv } from 'lib/components/table/utils';

import { exportGradebookCsv } from '../components/exportGradebookCsv';
import type { AssessmentData, StudentData, SubmissionData } from '../types';

jest.mock('lib/components/table/utils', () => ({ downloadCsv: jest.fn() }));

const mockDownloadCsv = downloadCsv as jest.Mock;

const assessments: AssessmentData[] = [
  { id: 100, title: 'Quiz 1', tabId: 10, maxGrade: 10 },
  { id: 101, title: 'Quiz 2', tabId: 10, maxGrade: 20 },
];

const students: StudentData[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', externalId: null, level: 3 },
  { id: 2, name: 'Bob', email: 'bob@example.com', externalId: 'EXT-1', level: 5 },
];

const submissions: SubmissionData[] = [
  { studentId: 1, assessmentId: 100, grade: 8, workflowState: 'graded' },
  { studentId: 2, assessmentId: 101, grade: 15, workflowState: 'graded' },
];

const allColumns = [
  { id: 'name', title: 'Name' },
  { id: 'email', title: 'Email' },
  { id: 'externalId', title: 'External ID' },
  { id: 'level', title: 'Level' },
  { id: 'asn-100', title: 'Quiz 1' },
  { id: 'asn-101', title: 'Quiz 2' },
];

const allIds = allColumns.map((c) => c.id);

const parseRows = (csv: string): string[][] =>
  csv
    .split('\n')
    .map((line) => line.split(',').map((cell) => cell.replace(/^"|"$/g, '')));

describe('exportGradebookCsv', () => {
  beforeEach(() => mockDownloadCsv.mockClear());

  it('calls downloadCsv once', () => {
    exportGradebookCsv({
      visibleColumnIds: allIds,
      columnMeta: allColumns,
      assessments,
      students,
      submissions,
    });
    expect(mockDownloadCsv).toHaveBeenCalledTimes(1);
  });

  it('first row is header with column titles in order', () => {
    exportGradebookCsv({
      visibleColumnIds: allIds,
      columnMeta: allColumns,
      assessments,
      students,
      submissions,
    });
    const rows = parseRows(mockDownloadCsv.mock.calls[0][0]);
    expect(rows[0]).toEqual(['Name', 'Email', 'External ID', 'Level', 'Quiz 1', 'Quiz 2']);
  });

  it('second row (Points Possible) has blank for non-assessment cols and maxGrade for assessment cols', () => {
    exportGradebookCsv({
      visibleColumnIds: allIds,
      columnMeta: allColumns,
      assessments,
      students,
      submissions,
    });
    const rows = parseRows(mockDownloadCsv.mock.calls[0][0]);
    expect(rows[1][0]).toBe('');
    expect(rows[1][1]).toBe('');
    expect(rows[1][2]).toBe('');
    expect(rows[1][3]).toBe('');
    expect(rows[1][4]).toBe('10');
    expect(rows[1][5]).toBe('20');
  });

  it('student rows start at index 2', () => {
    exportGradebookCsv({
      visibleColumnIds: allIds,
      columnMeta: allColumns,
      assessments,
      students,
      submissions,
    });
    const rows = parseRows(mockDownloadCsv.mock.calls[0][0]);
    expect(rows[2][0]).toBe('Alice');
    expect(rows[3][0]).toBe('Bob');
  });

  it('renders grade for a matching submission', () => {
    exportGradebookCsv({
      visibleColumnIds: allIds,
      columnMeta: allColumns,
      assessments,
      students,
      submissions,
    });
    const rows = parseRows(mockDownloadCsv.mock.calls[0][0]);
    expect(rows[2][4]).toBe('8');
  });

  it('renders empty string for a missing submission', () => {
    exportGradebookCsv({
      visibleColumnIds: allIds,
      columnMeta: allColumns,
      assessments,
      students,
      submissions,
    });
    const rows = parseRows(mockDownloadCsv.mock.calls[0][0]);
    expect(rows[2][5]).toBe('');
  });

  it('renders level in student rows', () => {
    exportGradebookCsv({
      visibleColumnIds: allIds,
      columnMeta: allColumns,
      assessments,
      students,
      submissions,
    });
    const rows = parseRows(mockDownloadCsv.mock.calls[0][0]);
    expect(rows[2][3]).toBe('3');
    expect(rows[3][3]).toBe('5');
  });

  it('renders externalId as empty string when null', () => {
    exportGradebookCsv({
      visibleColumnIds: allIds,
      columnMeta: allColumns,
      assessments,
      students,
      submissions,
    });
    const rows = parseRows(mockDownloadCsv.mock.calls[0][0]);
    expect(rows[2][2]).toBe('');
  });

  it('renders externalId value when present', () => {
    exportGradebookCsv({
      visibleColumnIds: allIds,
      columnMeta: allColumns,
      assessments,
      students,
      submissions,
    });
    const rows = parseRows(mockDownloadCsv.mock.calls[0][0]);
    expect(rows[3][2]).toBe('EXT-1');
  });

  it('omits columns not in visibleColumnIds', () => {
    const visibleIds = ['name', 'asn-100'];
    exportGradebookCsv({
      visibleColumnIds: visibleIds,
      columnMeta: allColumns,
      assessments,
      students,
      submissions,
    });
    const rows = parseRows(mockDownloadCsv.mock.calls[0][0]);
    expect(rows[0]).toHaveLength(2);
    expect(rows[0][0]).toBe('Name');
    expect(rows[0][1]).toBe('Quiz 1');
  });

  it('passes filename to downloadCsv when provided', () => {
    exportGradebookCsv({
      visibleColumnIds: allIds,
      columnMeta: allColumns,
      assessments,
      students,
      submissions,
      filename: 'my-gradebook',
    });
    expect(mockDownloadCsv).toHaveBeenCalledWith(expect.any(String), 'my-gradebook');
  });
});
