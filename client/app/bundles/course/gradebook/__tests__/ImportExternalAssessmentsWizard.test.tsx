import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from 'test-utils';
import type { AssessmentData, StudentData } from 'types/course/gradebook';
import TestApp from 'utilities/TestApp';

import CourseAPI from 'api/course';
import toast from 'lib/hooks/toast';

import ExternalGradeConflictPrompt from '../components/import/ExternalGradeConflictPrompt';
import ImportExternalAssessmentsWizard from '../components/import/ImportExternalAssessmentsWizard';

jest.mock('api/course');
jest.mock('lib/components/wrappers/I18nProvider');
jest.mock('lib/hooks/toast');

const EXTERNAL_ID = 'External ID';
const MIDTERM = 'Midterm';
const A001 = 'A001';

const defaultProps = {
  existingAssessments: [],
  onClose: jest.fn(),
  weightedViewEnabled: true,
};

const file = (text: string): File =>
  new File([text], 'marks.csv', { type: 'text/csv' });

const student = (partial: Partial<StudentData>): StudentData => ({
  id: 1,
  name: 'Student',
  email: 's@x.com',
  externalId: 'E1',
  level: 0,
  totalXp: 0,
  levelContribution: null,
  ...partial,
});

const studentsState = (students: StudentData[]): object => ({
  gradebook: {
    categories: [],
    tabs: [],
    submissions: [],
    assessments: [],
    gamificationEnabled: false,
    weightedViewEnabled: false,
    canManageWeights: true,
    students,
  },
});

// Like studentsState, but also seeds existing external assessments so
// useImportMapping's own header-matching (against getExternalAssessments,
// not the wizard's `existingAssessments` prop) can auto-map a column.
const assessmentsState = (
  assessments: AssessmentData[],
  students: StudentData[] = [],
): object => ({
  gradebook: {
    categories: [],
    tabs: [],
    submissions: [],
    assessments,
    gamificationEnabled: false,
    weightedViewEnabled: false,
    canManageWeights: true,
    students,
  },
});

const okPreview = (over: Partial<Record<string, unknown>> = {}): unknown => ({
  data: {
    ok: true,
    unresolved: [],
    malformed: [],
    outOfRange: [],
    sample: [{ identifier: A001, grades: { Midterm: 41 } }],
    conflictRows: [],
    reassignments: [],
    columnOrder: [MIDTERM],
    totalRows: 1,
    ...over,
  },
});

const okCommit = (over: Partial<Record<string, unknown>> = {}): unknown => ({
  data: {
    createdComponents: 1,
    updatedComponents: 0,
    gradesWritten: 1,
    ...over,
  },
});

const okIndex = (): unknown => ({
  data: {
    categories: [],
    tabs: [],
    assessments: [],
    students: [],
    submissions: [],
    gamificationEnabled: false,
    weightedViewEnabled: true,
    canManageWeights: true,
  },
});

// Render against an isolated store (not the shared singleton, which a commit
// test can leave without a students slice and crash getStudents()).
const renderWizard = (
  props: Partial<{
    weightedViewEnabled: boolean;
    existingAssessments: typeof defaultProps.existingAssessments;
  }> = {},
  students: StudentData[] = [student({ externalId: A001 })],
): void => {
  render(
    <ImportExternalAssessmentsWizard
      {...defaultProps}
      existingAssessments={props.existingAssessments ?? []}
      open
      weightedViewEnabled={props.weightedViewEnabled ?? true}
    />,
    { state: studentsState(students) },
  );
};

const nextButton = (): HTMLElement =>
  screen.getByRole('button', { name: /^next$/i });

const dropCsv = async (csv: string): Promise<void> => {
  await userEvent.upload(screen.getByLabelText(/upload/i), file(csv));
  await waitFor(() => expect(nextButton()).toBeEnabled());
};

// upload -> map
const advanceToMap = async (csv: string): Promise<void> => {
  await dropCsv(csv);
  await userEvent.click(nextButton());
};

// upload -> map -> preview
const advanceToPreview = async (csv: string): Promise<void> => {
  await advanceToMap(csv);
  await waitFor(() => expect(nextButton()).toBeEnabled());
  await userEvent.click(nextButton());
};

describe('dialog dismissal guards', () => {
  it('does not close the wizard on backdrop click or escape', async () => {
    const onClose = jest.fn();
    render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[]}
        onClose={onClose}
        open
        weightedViewEnabled
      />,
    );

    const backdrop = document.querySelector('.MuiBackdrop-root');
    expect(backdrop).not.toBeNull();
    await userEvent.click(backdrop as Element);
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();

    // The explicit Cancel button still closes it
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close the conflict prompt on backdrop click', async () => {
    const onCancel = jest.fn();
    render(
      <ExternalGradeConflictPrompt
        componentNames={[MIDTERM]}
        identifierLabel="External ID"
        onCancel={onCancel}
        onKeepExisting={jest.fn()}
        onReplaceAll={jest.fn()}
        open
        rows={[]}
        totalRows={0}
      />,
    );

    const backdrop = document.querySelector('.MuiBackdrop-root');
    expect(backdrop).not.toBeNull();
    await userEvent.click(backdrop as Element);
    expect(onCancel).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('ImportExternalAssessmentsWizard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('drops a CSV, advances to Map, and shows the flat mapping table', async () => {
    renderWizard();
    await advanceToMap(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(MIDTERM)).toBeInTheDocument();
    // The identifier is a static label now, not a Select — it always reads
    // headers[0] and shows the active match mode alongside it.
    expect(
      screen.getByText(`${EXTERNAL_ID} (${EXTERNAL_ID})`),
    ).toBeInTheDocument();
  });

  it('walks upload -> map -> preview -> commit with no conflicts', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview(),
    );
    (CourseAPI.gradebook.importCommit as jest.Mock).mockResolvedValue(
      okCommit({ createdComponents: 1 }),
    );
    (CourseAPI.gradebook.index as jest.Mock).mockResolvedValue(okIndex());

    renderWizard();
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);

    expect(await screen.findByText(A001)).toBeVisible();
    expect(
      screen.getByRole('columnheader', { name: EXTERNAL_ID }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /confirm import/i }),
    );

    await waitFor(() =>
      expect(CourseAPI.gradebook.importCommit).toHaveBeenCalled(),
    );
    const payload = (CourseAPI.gradebook.importCommit as jest.Mock).mock
      .calls[0][0];
    expect(payload.onConflict).toBe('replace');
    expect(payload.identifierMode).toBe('external_id');
    expect(payload.identifierColumn).toBe(EXTERNAL_ID);
    expect(payload.mappings).toContainEqual({
      header: MIDTERM,
      action: 'create',
      target: MIDTERM,
      maxGrade: 100,
      weight: 0,
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Imported grades. Created 1 external assessment.',
        { autoClose: false },
      ),
    );
  });

  it('does not toast success when createdComponents is 0', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview(),
    );
    (CourseAPI.gradebook.importCommit as jest.Mock).mockResolvedValue(
      okCommit({ createdComponents: 0, updatedComponents: 1 }),
    );
    (CourseAPI.gradebook.index as jest.Mock).mockResolvedValue(okIndex());

    renderWizard();
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);
    await screen.findByText(A001);
    await userEvent.click(
      screen.getByRole('button', { name: /confirm import/i }),
    );

    await waitFor(() =>
      expect(CourseAPI.gradebook.importCommit).toHaveBeenCalled(),
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('disables Next/Preview on the Map step while a column has a non-numeric grade', async () => {
    renderWizard({}, [
      student({ id: 1, externalId: A001 }),
      student({ id: 2, externalId: 'A002' }),
    ]);
    // A numeric first row auto-maps the column to "create"; the second row's
    // non-numeric cell then trips the mapping's nonNumeric error.
    await advanceToMap(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\nA002,abc\n`);

    expect(nextButton()).toBeDisabled();
    expect(screen.getByText(/isn.t a number/i)).toBeInTheDocument();
  });

  it('re-previews when a column mapping dropdown changes', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({ columnOrder: [MIDTERM, 'Finals'] }),
    );
    renderWizard();
    await advanceToMap(`${EXTERNAL_ID},${MIDTERM},Finals\n${A001},41,88\n`);

    await waitFor(() =>
      expect(CourseAPI.gradebook.importPreview).toHaveBeenCalledTimes(1),
    );

    // Flip "Finals" (currently auto-mapped to create) to "Don't import".
    const comboboxes = screen.getAllByRole('combobox');
    const finalsSelect = comboboxes[comboboxes.length - 1];
    await userEvent.click(finalsSelect);
    await userEvent.click(
      screen.getByRole('option', { name: /don't import/i }),
    );

    await waitFor(() =>
      expect(CourseAPI.gradebook.importPreview).toHaveBeenCalledTimes(2),
    );
  });

  it('links the External ID hint to the students page, not /users', async () => {
    renderWizard({}, [student({ id: 1, name: 'Alice', externalId: 'E1' })]);
    const link = screen.getByRole('link', { name: /manage users/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('/students'));
    expect(link).not.toHaveAttribute('href', expect.stringContaining('/users'));
  });

  it('blocks Next on the Upload step while a student has no External ID', async () => {
    renderWizard({}, [
      student({ id: 1, name: 'Alice Lim', externalId: null }),
      student({ id: 2, name: 'Bob Tan', externalId: 'E2' }),
    ]);
    expect(
      screen.getByText(/Alice Lim has no External ID/),
    ).toBeInTheDocument();
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`),
    );
    await screen.findByText('marks.csv'); // file parsed
    expect(nextButton()).toBeDisabled();
  });

  it('enables Next once matching by Email instead', async () => {
    renderWizard({}, [
      student({ id: 1, name: 'Alice Lim', externalId: null, email: A001 }),
    ]);
    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));
    await dropCsv(`Email,${MIDTERM}\n${A001},41\n`);
    expect(nextButton()).toBeEnabled();
  });

  it('states the identifier must be the first column on the upload step, reacting to the toggle', async () => {
    renderWizard({}, [student({ id: 1, name: 'Alice', externalId: 'E1' })]);
    expect(
      screen.getByText(/first column must be External ID/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));
    expect(screen.getByText(/first column must be Email/i)).toBeInTheDocument();
  });

  it('shows the External ID example template by default with a downloadable CSV', () => {
    renderWizard();

    const example = screen.getByText(/External ID,Assessment 1,Assessment 2/);
    expect(example).toHaveTextContent('A0123456,85,90');
    expect(example).toHaveTextContent('A0123457,78,88');

    const link = screen.getByRole('link', { name: /template file/i });
    expect(link).toHaveAttribute('download', 'template.csv');
    expect(link.getAttribute('href')).toMatch(/^data:text\/csv/);
  });

  it('switches the example template to Email when the identifier toggle flips', async () => {
    renderWizard();

    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));

    const example = screen.getByText(/Email,Assessment 1,Assessment 2/);
    expect(example).toHaveTextContent('test1@example.com,85,90');

    const link = screen.getByRole('link', { name: /template file/i });
    expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain(
      'test1@example.com,85,90',
    );
  });

  // NOTE: this test's original premise — that an unrecognized identifier
  // header falls through to Map with a blank identifier Select for the user
  // to fix — no longer applies. The identifier is now always headers[0]
  // (there is no more Select to pick it from), and detectUploadBlock now
  // structurally blocks the upload when the first column doesn't match the
  // selected mode's canonical header. So the equivalent current behavior is
  // the opposite of "enables Next": Next stays disabled on Upload, gated by
  // uploadBlock, with the block alert explaining why.
  it('blocks Next on the Upload step when the identifier header is not first', async () => {
    renderWizard();
    // "Student ID" does not case-insensitively match the canonical "External
    // ID" header for external_id mode.
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`Student ID,${MIDTERM}\n${A001},41\n`),
    );
    await screen.findByText('marks.csv');
    expect(nextButton()).toBeDisabled();
    expect(screen.getByText(/but it is .*Student ID/i)).toBeInTheDocument();
  });

  it('opens the conflict prompt and commits with keep/replace', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({
        sample: [{ identifier: A001, grades: { Midterm: 20 } }],
        conflictRows: [
          {
            identifier: A001,
            studentName: 'Alice',
            cells: { Midterm: { existing: 10, inFile: 20, changed: true } },
          },
        ],
      }),
    );
    (CourseAPI.gradebook.importCommit as jest.Mock).mockResolvedValue(
      okCommit({ createdComponents: 0, updatedComponents: 1 }),
    );
    (CourseAPI.gradebook.index as jest.Mock).mockResolvedValue(okIndex());

    renderWizard();
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},20\n`);
    await screen.findByText(A001);

    // The pending-change cue appears before the confirm modal.
    expect(
      await screen.findByText(
        /1 row contains changes to existing grades\. After checking this preview, click Confirm import to review these conflicts before anything is imported\./i,
      ),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /confirm import/i }),
    );

    const dialog = await screen.findByRole('dialog', {
      name: /resolve grade conflicts/i,
    });
    expect(within(dialog).getByText('10')).toHaveStyle(
      'text-decoration: line-through',
    );

    await userEvent.click(
      within(dialog).getByRole('button', { name: /replace/i }),
    );
    await waitFor(() =>
      expect(
        (CourseAPI.gradebook.importCommit as jest.Mock).mock.calls[0][0]
          .onConflict,
      ).toBe('replace'),
    );
  });

  it('commits with keep when Keep Existing is clicked on the conflict prompt', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({
        sample: [{ identifier: A001, grades: { Midterm: 20 } }],
        conflictRows: [
          {
            identifier: A001,
            studentName: 'Alice',
            cells: { Midterm: { existing: 10, inFile: 20, changed: true } },
          },
        ],
      }),
    );
    (CourseAPI.gradebook.importCommit as jest.Mock).mockResolvedValue(
      okCommit({ createdComponents: 0, updatedComponents: 1 }),
    );
    (CourseAPI.gradebook.index as jest.Mock).mockResolvedValue(okIndex());

    renderWizard();
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},20\n`);
    await screen.findByText(A001);
    await userEvent.click(
      screen.getByRole('button', { name: /confirm import/i }),
    );
    const dialog = await screen.findByRole('dialog', {
      name: /resolve grade conflicts/i,
    });
    await userEvent.click(
      within(dialog).getByRole('button', { name: /keep existing/i }),
    );
    await waitFor(() =>
      expect(
        (CourseAPI.gradebook.importCommit as jest.Mock).mock.calls[0][0]
          .onConflict,
      ).toBe('keep'),
    );
  });

  it('does not open the conflict prompt when the preview reports no existing grades', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview(),
    );
    (CourseAPI.gradebook.importCommit as jest.Mock).mockResolvedValue(
      okCommit(),
    );
    (CourseAPI.gradebook.index as jest.Mock).mockResolvedValue(okIndex());

    renderWizard();
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);
    await screen.findByText(A001);
    expect(
      screen.queryByText(/contains? changes to existing grades/i),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /confirm import/i }),
    );

    expect(
      screen.queryByRole('dialog', { name: /resolve grade conflicts/i }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(CourseAPI.gradebook.importCommit).toHaveBeenCalled(),
    );
    expect(
      (CourseAPI.gradebook.importCommit as jest.Mock).mock.calls[0][0]
        .onConflict,
    ).toBe('replace');
  });

  it('renders the change matrix: changed cells as old->new, unchanged as-is, missing as em-dash', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({
        sample: [
          { identifier: A001, grades: { Midterm: 20, Finals: 88 } },
          { identifier: 'A002', grades: { Midterm: 30 } },
        ],
        conflictRows: [
          {
            identifier: A001,
            studentName: 'Alice',
            cells: {
              Midterm: { existing: 10, inFile: 20, changed: true },
              Finals: { existing: 88, inFile: 88, changed: false },
            },
          },
          {
            identifier: 'A002',
            studentName: 'Bob',
            cells: { Midterm: { existing: 5, inFile: 30, changed: true } },
          },
        ],
        columnOrder: [MIDTERM, 'Finals'],
        totalRows: 2,
      }),
    );
    (CourseAPI.gradebook.importCommit as jest.Mock).mockResolvedValue(
      okCommit({ createdComponents: 0, updatedComponents: 1 }),
    );

    renderWizard({}, [
      student({ id: 1, externalId: A001 }),
      student({ id: 2, externalId: 'A002' }),
    ]);
    await advanceToPreview(
      `${EXTERNAL_ID},${MIDTERM},Finals\n${A001},20,88\nA002,30,\n`,
    );
    await screen.findByText(A001);
    await userEvent.click(
      screen.getByRole('button', { name: /confirm import/i }),
    );

    const dialog = await screen.findByRole('dialog', {
      name: /resolve grade conflicts/i,
    });
    const struck = within(dialog).getByText('10');
    expect(struck).toHaveStyle('text-decoration: line-through');
    expect(within(dialog).getByText('20')).toHaveStyle('font-weight: 700');
    expect(within(dialog).getByText('88')).not.toHaveStyle(
      'text-decoration: line-through',
    );
    expect(within(dialog).getByText('—')).toBeInTheDocument();
  });

  it('shows a spinner on Replace while the commit is in flight', async () => {
    let resolveCommit: (v: unknown) => void = () => {};
    (CourseAPI.gradebook.importCommit as jest.Mock).mockReturnValue(
      new Promise((res) => {
        resolveCommit = res;
      }),
    );
    (CourseAPI.gradebook.index as jest.Mock).mockResolvedValue({ data: {} });
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({
        conflictRows: [
          {
            identifier: A001,
            studentName: 'student',
            cells: { Midterm: { existing: 10, inFile: 41, changed: true } },
          },
        ],
      }),
    );

    renderWizard();
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);
    await screen.findByText(A001);
    await userEvent.click(
      screen.getByRole('button', { name: /confirm import/i }),
    );
    const dialog = await screen.findByRole('dialog', {
      name: /resolve grade conflicts/i,
    });
    const replaceBtn = within(dialog).getByRole('button', {
      name: /replace/i,
    });
    await userEvent.click(replaceBtn);

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();

    resolveCommit(okCommit({ createdComponents: 0, updatedComponents: 1 }));
  });

  it('toasts failure and stays open when the commit request rejects', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview(),
    );
    (CourseAPI.gradebook.importCommit as jest.Mock).mockRejectedValue(
      new Error('boom'),
    );
    const onClose = jest.fn();
    render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[]}
        onClose={onClose}
        open
        weightedViewEnabled
      />,
      { state: studentsState([student({ externalId: A001 })]) },
    );
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);
    await screen.findByText(A001);
    await userEvent.click(
      screen.getByRole('button', { name: /confirm import/i }),
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Import failed. Nothing was saved.',
      ),
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('warns about out-of-range grades at Preview without blocking import', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({
        outOfRange: [
          {
            identifier: 'S1',
            component: MIDTERM,
            grade: 105,
            max: 100,
            kind: 'above',
          },
        ],
        sample: [{ identifier: 'S1', grades: { Midterm: 105 } }],
      }),
    );
    renderWizard({ weightedViewEnabled: true }, [
      student({ externalId: 'S1' }),
    ]);
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\nS1,105\n`);
    expect(
      await screen.findByText(/S1 - Midterm: 105 \(max 100\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/floored or capped in the weighted total/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Confirm import/i }),
    ).toBeEnabled();
  });

  it('omits the weighted-total wording when weighted view is off', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({
        outOfRange: [
          {
            identifier: 'S1',
            component: MIDTERM,
            grade: 105,
            max: 100,
            kind: 'above',
          },
        ],
        sample: [{ identifier: 'S1', grades: { Midterm: 105 } }],
      }),
    );
    renderWizard({ weightedViewEnabled: false }, [
      student({ externalId: 'S1' }),
    ]);
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\nS1,105\n`);
    expect(
      await screen.findByText(/S1 - Midterm: 105 \(max 100\)/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/weighted total/i)).not.toBeInTheDocument();
  });

  it('formats below-minimum out-of-range grades with a min-0 bound', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({
        outOfRange: [
          {
            identifier: 'S1',
            component: MIDTERM,
            grade: -5,
            max: 100,
            kind: 'below',
          },
        ],
        sample: [{ identifier: 'S1', grades: { Midterm: -5 } }],
      }),
    );
    renderWizard({ weightedViewEnabled: true }, [
      student({ externalId: 'S1' }),
    ]);
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\nS1,-5\n`);
    expect(
      await screen.findByText(/S1 - Midterm: -5 \(min 0\)/),
    ).toBeInTheDocument();
  });

  it('summarises out-of-range cells beyond the first ten', async () => {
    const outOfRange = Array.from({ length: 12 }, (_, i) => ({
      identifier: `S${i + 1}`,
      component: MIDTERM,
      grade: 105,
      max: 100,
      kind: 'above' as const,
    }));
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({
        outOfRange,
        sample: [{ identifier: 'S1', grades: { Midterm: 105 } }],
      }),
    );
    renderWizard({ weightedViewEnabled: true }, [
      student({ externalId: 'S1' }),
    ]);
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\nS1,105\n`);
    expect(
      await screen.findByText(/S10 - Midterm: 105 \(max 100\)/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/S11 - Midterm/)).not.toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('shows a reassignment warning when an identifier now matches a different student', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({
        reassignments: [
          {
            identifier: A001,
            currentStudent: 'Carol',
            previousStudents: ['Alice'],
          },
        ],
      }),
    );
    renderWizard();
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);
    expect(
      await screen.findByText(/now match a different student/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A001: now Carol \(was Alice\)/),
    ).toBeInTheDocument();
  });

  it('toasts a meaningful message and hides Confirm import when the preview request itself rejects', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockRejectedValue({
      response: { data: { errors: { message: 'empty_csv' } } },
    });
    renderWizard();
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'The uploaded file has no data rows. Add at least one student row and try again.',
      ),
    );
    expect(
      screen.queryByRole('button', { name: /confirm import/i }),
    ).not.toBeInTheDocument();
    expect(CourseAPI.gradebook.importCommit).not.toHaveBeenCalled();
  });

  // The client now blocks a CSV identifier with no matching student at the
  // Upload step, before the server is ever consulted — so an unrecognized
  // identifier can no longer reach Preview via the client-side path. These
  // two cases assert that Upload-step block instead (same copy as before).
  it('blocks Next on the Upload step and shows unresolved external IDs', async () => {
    renderWizard();
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},${MIDTERM}\nZZZ,1\n`),
    );
    await screen.findByText('marks.csv');
    expect(nextButton()).toBeDisabled();
    expect(
      screen.getByText(/This external ID was not found in the course: ZZZ/),
    ).toBeInTheDocument();
    expect(CourseAPI.gradebook.importPreview).not.toHaveBeenCalled();
  });

  it('uses email copy for unresolved identifiers when matching by Email', async () => {
    renderWizard();
    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`Email,${MIDTERM}\nnope@x.com,1\n`),
    );
    await screen.findByText('marks.csv');
    expect(nextButton()).toBeDisabled();
    expect(
      screen.getByText(
        /This email address was not found in the course: nope@x.com/,
      ),
    ).toBeInTheDocument();
    expect(CourseAPI.gradebook.importPreview).not.toHaveBeenCalled();
  });

  // Backstop: the server preview stays the authoritative check even for an
  // identifier the client's roster snapshot accepted (e.g. stale client
  // state, or a server-side rule the client doesn't replicate).
  it('shows the Preview alert when the server rejects an identifier the client accepted', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({ ok: false, unresolved: [A001], sample: [] }),
    );
    renderWizard();
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},1\n`);
    expect(
      await screen.findByText(
        new RegExp(`This external ID was not found in the course: ${A001}`),
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /confirm import/i }),
    ).not.toBeInTheDocument();
    expect(CourseAPI.gradebook.importCommit).not.toHaveBeenCalled();
  });

  it('lists up to five malformed cells then summarises the rest', async () => {
    const malformed = [
      'row 2, Midterm: a',
      'row 3, Midterm: b',
      'row 4, Midterm: c',
      'row 5, Midterm: d',
      'row 6, Midterm: e',
      'row 7, Midterm: f',
    ];
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({ ok: false, malformed, sample: [] }),
    );
    renderWizard();
    // The mocked server response is what actually reports these cells as
    // malformed; the local CSV just needs a numeric cell so the column
    // auto-maps to "create" and Map step's mapping validation passes.
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);
    expect(await screen.findByText('row 2, Midterm: a')).toBeInTheDocument();
    expect(screen.getByText('row 6, Midterm: e')).toBeInTheDocument();
    expect(screen.queryByText('row 7, Midterm: f')).not.toBeInTheDocument();
    expect(screen.getByText('and 1 more')).toBeInTheDocument();
  });

  it('shows preview subtitle with total row count when preview has more than 5 rows', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({
        totalRows: 6,
        sample: [
          { identifier: A001, grades: { Midterm: 41 } },
          { identifier: 'A002', grades: { Midterm: 42 } },
          { identifier: 'A003', grades: { Midterm: 43 } },
          { identifier: 'A004', grades: { Midterm: 44 } },
          { identifier: 'A005', grades: { Midterm: 45 } },
        ],
      }),
    );
    renderWizard(
      {},
      ['A001', 'A002', 'A003', 'A004', 'A005', 'A006'].map((id, i) =>
        student({ id: i + 1, externalId: id }),
      ),
    );
    await advanceToPreview(
      [
        `${EXTERNAL_ID},${MIDTERM}`,
        'A001,41',
        'A002,42',
        'A003,43',
        'A004,44',
        'A005,45',
        'A006,46',
      ].join('\n'),
    );
    expect(await screen.findByText(A001)).toBeVisible();
    expect(
      screen.getByText(
        /Previewing the first 5 of 6 rows. Check that this preview matches your CSV before continuing./i,
      ),
    ).toBeInTheDocument();
  });

  it('shows all rows subtitle variant when totalRows is 5 or fewer', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview({
        totalRows: 5,
        sample: [
          { identifier: A001, grades: { Midterm: 41 } },
          { identifier: 'A002', grades: { Midterm: 42 } },
        ],
      }),
    );
    renderWizard({}, [
      student({ id: 1, externalId: A001 }),
      student({ id: 2, externalId: 'A002' }),
    ]);
    await advanceToPreview(
      [`${EXTERNAL_ID},${MIDTERM}`, 'A001,41', 'A002,42'].join('\n'),
    );
    expect(await screen.findByText(A001)).toBeVisible();
    expect(
      screen.getByText(
        /Previewing all 5 rows. Check that this preview matches your CSV before continuing./i,
      ),
    ).toBeInTheDocument();
  });

  it('wraps the preview table in a horizontally scrollable container', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview(),
    );
    renderWizard();
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);
    const table = await screen.findByRole('table');
    expect(table.parentElement).toHaveClass('overflow-x-auto');
  });

  it('resets to the Upload step when reopened after a close', async () => {
    const { rerender } = render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[]}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
      { state: studentsState([student({ externalId: A001 })]) },
    );
    await advanceToMap(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);
    expect(screen.getByRole('table')).toBeInTheDocument(); // on Map

    rerender(
      <TestApp>
        <ImportExternalAssessmentsWizard
          existingAssessments={[]}
          onClose={jest.fn()}
          open={false}
          weightedViewEnabled
        />
      </TestApp>,
    );
    rerender(
      <TestApp>
        <ImportExternalAssessmentsWizard
          existingAssessments={[]}
          onClose={jest.fn()}
          open
          weightedViewEnabled
        />
      </TestApp>,
    );

    // back on the Upload step with no file and a blank identifier column
    expect(screen.getByLabelText(/upload/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/Drag a CSV here/)).toBeInTheDocument();
  });

  it('preserves the dropped file and identifier mode when Back returns from Map to Upload', async () => {
    renderWizard({}, [student({ email: A001 })]);
    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));
    await advanceToMap(`Email,${MIDTERM}\n${A001},41\n`);
    expect(screen.getByRole('table')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^back$/i }));

    // Back on Upload: the previously dropped file and the Email toggle are
    // still there — Back must not reset either.
    expect(screen.getByText('marks.csv')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Email' })).toBeChecked();
    // Next re-enables immediately: the file's already-parsed headers were
    // not thrown away either.
    expect(nextButton()).toBeEnabled();
  });

  it("re-drops a new file and reseeds column mappings from that file's own headers, not the previous file's", async () => {
    renderWizard({}, [
      student({ id: 1, externalId: A001 }),
      student({ id: 2, externalId: 'A002' }),
    ]);
    await advanceToMap(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);

    // Flip Midterm away from its auto-detected "create" default.
    const midtermSelect = screen.getAllByRole('combobox').at(-1)!;
    await userEvent.click(midtermSelect);
    await userEvent.click(
      screen.getByRole('option', { name: /don't import/i }),
    );
    // With the only column set to "Don't import", the flat table's footer
    // hint switches to the nothing-imported variant.
    expect(screen.getByText(/set at least one column/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^back$/i }));
    await dropCsv(`${EXTERNAL_ID},${MIDTERM}\nA002,55\n`);
    await userEvent.click(nextButton());

    // A fresh parseFile re-seeds Midterm's default action ("create") from
    // the new file's own data; the earlier "Don't import" override for the
    // old file must not leak across files.
    expect(screen.getByText(MIDTERM)).toBeInTheDocument();
    expect(
      screen.queryByText(/set at least one column/i),
    ).not.toBeInTheDocument();
  });

  it('renders the Map step with the flat table and no footer hint when every column is already mapped', async () => {
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: assessmentsState(
        [{ id: 1, title: MIDTERM, tabId: 1, maxGrade: 100, external: true }],
        [student({ externalId: A001 })],
      ),
    });

    await advanceToMap(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);

    // Still on Map — a fully-mapped column does not auto-skip to Preview;
    // it just renders in the (always-visible) flat table with no
    // incomplete/nothing-imported footer hint.
    expect(
      screen.getByText(`${EXTERNAL_ID} (${EXTERNAL_ID})`),
    ).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.queryByText(/finish mapping|set at least one column/i),
    ).not.toBeInTheDocument();
    expect(nextButton()).toBeEnabled();
  });

  it('preserves column mappings and the identifier column when Back returns from Preview to Map', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue(
      okPreview(),
    );
    renderWizard();
    await advanceToPreview(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`);
    expect(await screen.findByText(A001)).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: /^back$/i }));

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(MIDTERM)).toBeInTheDocument();
    expect(
      screen.getByText(`${EXTERNAL_ID} (${EXTERNAL_ID})`),
    ).toBeInTheDocument();
    // canPreview was already satisfied before Back — Next re-enables without
    // the user having to redo any mapping.
    expect(nextButton()).toBeEnabled();
  });
});
