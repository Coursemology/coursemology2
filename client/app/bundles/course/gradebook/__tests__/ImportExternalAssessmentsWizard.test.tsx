import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from 'test-utils';
import type { StudentData } from 'types/course/gradebook';
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
const MIDTERMS = 'Midterms';
const A001 = 'A001';

const defaultProps = {
  existingAssessments: [],
  onClose: jest.fn(),
  weightedViewEnabled: true,
};

const componentNameInput = (): HTMLElement =>
  screen.getByRole('textbox', { name: 'Component name' });

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

// Render against an isolated store (not the shared singleton, which a commit
// test can leave without a students slice and crash getStudents()).
const renderWizard = (
  props: Partial<{ weightedViewEnabled: boolean }> = {},
): void => {
  render(
    <ImportExternalAssessmentsWizard
      {...defaultProps}
      open
      weightedViewEnabled={props.weightedViewEnabled ?? true}
    />,
    { state: studentsState([]) },
  );
};

const advanceToVerifyStep = async (): Promise<void> => {
  await userEvent.type(componentNameInput(), MIDTERM);
  await userEvent.click(screen.getByRole('button', { name: /next/i }));
  await userEvent.upload(
    screen.getByLabelText(/upload/i),
    file(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`),
  );
  await userEvent.click(screen.getByRole('button', { name: /verify/i }));
  await screen.findByRole('button', { name: /confirm import/i });
};

const advanceToVerifyFailure = async (csv: string): Promise<void> => {
  await userEvent.type(componentNameInput(), MIDTERM);
  await userEvent.type(screen.getByLabelText(/weightage/i), '30');
  await userEvent.type(screen.getByLabelText(/max marks/i), '50');
  await userEvent.click(screen.getByRole('button', { name: /next/i }));
  await userEvent.upload(screen.getByLabelText(/upload/i), file(csv));
  await userEvent.click(screen.getByRole('button', { name: /verify/i }));
};

const fillOneComponent = async (): Promise<void> => {
  await userEvent.type(componentNameInput(), MIDTERM);
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

  it('walks define → upload → verify → commit with no conflicts', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
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
      },
    });
    (CourseAPI.gradebook.importCommit as jest.Mock).mockResolvedValue({
      data: { createdComponents: 1, updatedComponents: 0, gradesWritten: 1 },
    });
    (CourseAPI.gradebook.index as jest.Mock).mockResolvedValue({
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

    renderWizard();
    // Step 1: type a component
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: upload
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},${MIDTERM}\nA001,41\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    // Step 3: preview shows the sample
    expect(await screen.findByText(A001)).toBeVisible();
    expect(
      screen.getByRole('columnheader', { name: EXTERNAL_ID }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /continue|confirm/i }),
    );

    await waitFor(() =>
      expect(CourseAPI.gradebook.importCommit).toHaveBeenCalled(),
    );
    const payload = (CourseAPI.gradebook.importCommit as jest.Mock).mock
      .calls[0][0];
    expect(payload.onConflict).toBe('replace');
    expect(payload.identifierMode).toBe('external_id');
    expect(payload.components[0]).toMatchObject({
      name: MIDTERM,
      weightage: 30,
      maximumGrade: 50,
    });

    // success side-effects
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Import complete.'),
    );
  });

  it('uses singular copy for a single unresolved external ID', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: false,
        unresolved: ['ZZZ'],
        malformed: [],
        outOfRange: [],
        sample: [],
        conflictRows: [],
        reassignments: [],
      },
    });
    renderWizard();
    await advanceToVerifyFailure(`${EXTERNAL_ID},${MIDTERM}\nZZZ,1\n`);
    expect(
      await screen.findByText(
        /This external ID was not found in the course: ZZZ/,
      ),
    ).toBeInTheDocument();
  });

  it('uses plural copy for multiple unresolved external IDs', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: false,
        unresolved: ['ZZZ', 'YYY'],
        malformed: [],
        outOfRange: [],
        sample: [],
        conflictRows: [],
        reassignments: [],
      },
    });
    renderWizard();
    await advanceToVerifyFailure(`${EXTERNAL_ID},${MIDTERM}\nZZZ,1\nYYY,2\n`);
    expect(
      await screen.findByText(
        /These external IDs were not found in the course: ZZZ, YYY/,
      ),
    ).toBeInTheDocument();
  });

  it('lists up to five malformed cells then summarises the rest', async () => {
    const malformed = [
      'row 2, Midterm: a',
      'row 3, Midterm: b',
      'row 4, Midterm: c',
      'row 5, Midterm: d',
      'row 6, Midterm: e',
      'row 7, Midterm: f',
      'row 8, Midterm: g',
    ];
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: false,
        unresolved: [],
        malformed,
        outOfRange: [],
        sample: [],
        conflictRows: [],
        reassignments: [],
      },
    });
    renderWizard();
    await advanceToVerifyFailure(`${EXTERNAL_ID},${MIDTERM}\n${A001},a\n`);
    expect(await screen.findByText('row 2, Midterm: a')).toBeInTheDocument();
    expect(screen.getByText('row 6, Midterm: e')).toBeInTheDocument();
    expect(screen.queryByText('row 7, Midterm: f')).not.toBeInTheDocument();
    expect(screen.getByText('and 2 more')).toBeInTheDocument();
  });

  it('shows unresolved identifiers and stays on the upload step', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: false,
        unresolved: ['ZZZ'],
        malformed: [],
        outOfRange: [],
        sample: [],
        conflictRows: [],
        reassignments: [],
      },
    });
    renderWizard();

    await advanceToVerifyFailure(`${EXTERNAL_ID},${MIDTERM}\nZZZ,1\n`);
    expect(await screen.findByText(/ZZZ/)).toBeVisible();
    expect(CourseAPI.gradebook.importCommit).not.toHaveBeenCalled();
  });

  it('hides weightage field when weightedViewEnabled is false', async () => {
    render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[]}
        onClose={jest.fn()}
        open
        weightedViewEnabled={false}
      />,
    );
    await userEvent.type(componentNameInput(), MIDTERM);
    expect(screen.queryByLabelText(/weightage/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/max marks/i)).toBeInTheDocument();
  });

  it('disables Next when component name is empty', () => {
    renderWizard();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('labels the identifier toggle "External ID"', () => {
    render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[]}
        onClose={jest.fn()}
        open
        weightedViewEnabled={false}
      />,
    );
    expect(
      screen.getByRole('radio', { name: EXTERNAL_ID }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('radio', { name: 'Student ID' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the component input label independent of the selected identifier mode', async () => {
    renderWizard();
    expect(componentNameInput()).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: EXTERNAL_ID }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));

    expect(componentNameInput()).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'Email' }),
    ).not.toBeInTheDocument();
  });

  it('commits with keep when Keep Existing is clicked on the conflict prompt', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        outOfRange: [],
        sample: [{ identifier: A001, grades: { Midterm: 20 } }],
        conflictRows: [
          {
            identifier: A001,
            studentName: 'Alice',
            cells: { Midterm: { existing: 10, inFile: 20, changed: true } },
          },
        ],
        reassignments: [],
        columnOrder: [MIDTERM],
        totalRows: 1,
      },
    });
    (CourseAPI.gradebook.importCommit as jest.Mock).mockResolvedValue({
      data: { createdComponents: 0, updatedComponents: 1, gradesWritten: 0 },
    });
    (CourseAPI.gradebook.index as jest.Mock).mockResolvedValue({
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
    renderWizard();
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},${MIDTERM}\n${A001},20\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    await userEvent.click(
      await screen.findByRole('button', { name: /confirm import/i }),
    );
    expect(
      await screen.findByText(/1 of 1 rows have changes/i),
    ).toBeInTheDocument();
    // The struck old value (10) is unique to the matrix; the new value (20)
    // also appears in the Verify sample table behind the dialog, so assert
    // only the header + old value to avoid a multiple-match error.
    expect(screen.getByText('10')).toBeInTheDocument(); // struck old value
    await userEvent.click(
      await screen.findByRole('button', { name: /keep existing/i }),
    );
    await waitFor(() =>
      expect(
        (CourseAPI.gradebook.importCommit as jest.Mock).mock.calls[0][0]
          .onConflict,
      ).toBe('keep'),
    );
  });

  it('blocks Next in External ID mode while a student has no External ID', async () => {
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([
        student({ id: 1, name: 'Alice Lim', externalId: null }),
        student({ id: 2, name: 'Bob Tan', externalId: 'E2' }),
      ]),
    });
    await fillOneComponent();
    expect(
      screen.getByText(/Alice Lim has no External ID/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('enables Next once matching by Email instead', async () => {
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([
        student({ id: 1, name: 'Alice Lim', externalId: null }),
      ]),
    });
    await fillOneComponent();
    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('lists the exact required headers on the upload step', async () => {
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([
        student({ id: 1, name: 'Alice', externalId: 'E1' }),
      ]),
    });
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(
      screen.getByText(
        /Your CSV needs these column headers: External ID, Midterm/,
      ),
    ).toBeInTheDocument();
  });

  it('summarises the count when several students lack an External ID', async () => {
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([
        student({ id: 1, name: 'Alice Lim', externalId: null }),
        student({ id: 2, name: 'Bob Tan', externalId: '' }),
        student({ id: 3, name: 'Carol Low', externalId: '' }),
      ]),
    });
    await fillOneComponent();
    expect(
      screen.getByText(/Alice Lim and 2 other students have no External ID/),
    ).toBeInTheDocument();
  });

  it('does not show Confirm import button when preview has errors', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: false,
        unresolved: ['ZZZ'],
        malformed: [],
        outOfRange: [],
        sample: [],
        conflictRows: [],
        reassignments: [],
      },
    });
    renderWizard();
    await advanceToVerifyFailure(`${EXTERNAL_ID},${MIDTERM}\nZZZ,1\n`);
    await screen.findByText(/ZZZ/);
    expect(
      screen.queryByRole('button', { name: /confirm import/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the conflict prompt and commits with keep/replace', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        outOfRange: [],
        sample: [{ identifier: A001, grades: { Midterm: 20 } }],
        conflictRows: [
          {
            identifier: A001,
            studentName: 'Alice',
            cells: { Midterm: { existing: 10, inFile: 20, changed: true } },
          },
        ],
        reassignments: [],
        columnOrder: [MIDTERM],
        totalRows: 1,
      },
    });
    (CourseAPI.gradebook.importCommit as jest.Mock).mockResolvedValue({
      data: { createdComponents: 0, updatedComponents: 1, gradesWritten: 1 },
    });
    (CourseAPI.gradebook.index as jest.Mock).mockResolvedValue({
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
    render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[
          { name: MIDTERM, maximumGrade: 50, weightage: 30 },
        ]}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
    );
    // Step 1: MIDTERM matches existing → max/weightage locked; just Next.
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},${MIDTERM}\n${A001},20\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    await userEvent.click(
      await screen.findByRole('button', { name: /continue|confirm/i }),
    );
    // conflict prompt
    await userEvent.click(
      await screen.findByRole('button', { name: /replace/i }),
    );
    await waitFor(() =>
      expect(
        (CourseAPI.gradebook.importCommit as jest.Mock).mock.calls[0][0]
          .onConflict,
      ).toBe('replace'),
    );
  });

  it('renders existing external chips in the define step', () => {
    render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[
          { name: MIDTERM, maximumGrade: 50, weightage: 30 },
          { name: 'Finals', maximumGrade: 100, weightage: 70 },
        ]}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
    );
    expect(screen.getByRole('button', { name: MIDTERM })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finals' })).toBeInTheDocument();
  });

  it('clicking an existing chip inserts a locked row pre-filled with correct max and weight', async () => {
    render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[
          { name: MIDTERM, maximumGrade: 50, weightage: 30 },
        ]}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: MIDTERM }));

    // The chip-inserted row's name field is read-only (disabled input)
    const nameInput = screen.getByDisplayValue(MIDTERM);
    expect(nameInput).toBeDisabled();

    // Max and weight are pre-filled with the existing values
    expect(screen.getByDisplayValue('50')).toBeDisabled();
    expect(screen.getByDisplayValue('30')).toBeDisabled();

    // "Updates existing" label is shown
    expect(screen.getByText(/updates existing/i)).toBeInTheDocument();
  });

  it('hides a chip once the corresponding external has been added to the component list', async () => {
    render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[
          { name: MIDTERM, maximumGrade: 50, weightage: 30 },
        ]}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: MIDTERM }));
    // After clicking, chip disappears (already in the list)
    expect(
      screen.queryByRole('button', { name: MIDTERM }),
    ).not.toBeInTheDocument();
  });

  it('does not render the From existing section when there are no existing externals', () => {
    render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[]}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
    );
    expect(screen.queryByText(/from existing/i)).not.toBeInTheDocument();
  });

  it('warns about out-of-range grades at Verify without blocking import', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
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
        conflictRows: [],
        reassignments: [],
        columnOrder: [MIDTERM],
        totalRows: 1,
      },
    });
    renderWizard({ weightedViewEnabled: true });
    await advanceToVerifyStep();
    expect(
      screen.getByText(/S1 - Midterm: 105 \(max 100\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/floored or capped in the weighted total/i),
    ).toBeInTheDocument();
    // non-blocking: Confirm import still enabled
    expect(
      screen.getByRole('button', { name: /Confirm import/i }),
    ).toBeEnabled();
  });

  it('omits the weighted-total wording when weighted view is off', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
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
        conflictRows: [],
        reassignments: [],
        columnOrder: [MIDTERM],
        totalRows: 1,
      },
    });
    renderWizard({ weightedViewEnabled: false });
    await advanceToVerifyStep();
    expect(
      screen.getByText(/S1 - Midterm: 105 \(max 100\)/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/weighted total/i)).not.toBeInTheDocument();
  });

  it('shows a "did you mean" suggestion for a renamed column, not raw header dumps', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockRejectedValue({
      response: {
        data: {
          errors: {
            message: 'bad_header',
            missing: [],
            unrecognized: [],
            suggestions: [{ expected: MIDTERMS, didYouMean: MIDTERM }],
            duplicates: [],
          },
        },
      },
    });
    renderWizard();
    await userEvent.type(componentNameInput(), MIDTERMS);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},${MIDTERM}\nA001,41\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    // Actionable detail is shown (not the generic "Could not verify" toast)
    expect(
      await screen.findByText(/did you mean ['‘]Midterms['’]\?/i),
    ).toBeInTheDocument();
    // The old eye-diff "Found: …" / "do not match" dump is gone
    expect(screen.queryByText(/Found:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/do not match/i)).not.toBeInTheDocument();
    // Stays on the upload step — no preview/confirm advance
    expect(
      screen.queryByRole('button', { name: /confirm import/i }),
    ).not.toBeInTheDocument();
  });

  it('shows only the duplicate-header line when duplicates are the only problem', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockRejectedValue({
      response: {
        data: {
          errors: {
            message: 'bad_header',
            missing: [],
            unrecognized: [],
            suggestions: [],
            duplicates: [{ name: MIDTERM, count: 2 }],
          },
        },
      },
    });
    renderWizard();
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},${MIDTERM},${MIDTERM}\nA001,1,2\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    expect(
      await screen.findByText(/appears more than once:.*Midterm \(×2\)/i),
    ).toBeInTheDocument();
    // No bogus missing/unrecognized lines when every column is present
    expect(screen.queryByText(/is missing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recognized/i)).not.toBeInTheDocument();
  });

  it('uses singular copy for a single missing / unrecognized / duplicate column', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockRejectedValue({
      response: {
        data: {
          errors: {
            message: 'bad_header',
            missing: [MIDTERM],
            unrecognized: ['Wrong'],
            suggestions: [],
            duplicates: [{ name: 'Quiz', count: 2 }],
          },
        },
      },
    });
    renderWizard();
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},Wrong\nA001,41\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    expect(
      await screen.findByText(/is missing this column:.*Midterm\b/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This column isn['’]t recognized:.*Wrong/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This column appears more than once:.*Quiz \(×2\)/i),
    ).toBeInTheDocument();
  });

  it('uses plural copy for multiple missing / unrecognized / duplicate columns', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockRejectedValue({
      response: {
        data: {
          errors: {
            message: 'bad_header',
            missing: [MIDTERM, 'Final Exam'],
            unrecognized: ['Wrong', 'Extra'],
            suggestions: [],
            duplicates: [
              { name: 'Quiz', count: 2 },
              { name: 'Project', count: 3 },
            ],
          },
        },
      },
    });
    renderWizard();
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},Wrong,Extra\nA001,41,5\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    expect(
      await screen.findByText(
        /is missing these columns:.*Midterm, Final Exam/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/These columns aren['’]t recognized:.*Wrong, Extra/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /These columns appear more than once:.*Quiz \(×2\), Project \(×3\)/i,
      ),
    ).toBeInTheDocument();
  });

  it('shows preview subtitle with total row count when preview has more than 5 rows', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        totalRows: 6,
        unresolved: [],
        malformed: [],
        outOfRange: [],
        sample: [
          { identifier: A001, grades: { Midterm: 41 } },
          { identifier: 'A002', grades: { Midterm: 42 } },
          { identifier: 'A003', grades: { Midterm: 43 } },
          { identifier: 'A004', grades: { Midterm: 44 } },
          { identifier: 'A005', grades: { Midterm: 45 } },
        ],
        conflictRows: [],
        reassignments: [],
        columnOrder: [MIDTERM],
      },
    });

    renderWizard();

    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(
        [
          `${EXTERNAL_ID},${MIDTERM}`,
          'A001,41',
          'A002,42',
          'A003,43',
          'A004,44',
          'A005,45',
          'A006,46',
        ].join('\n'),
      ),
    );

    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    expect(await screen.findByText(A001)).toBeVisible();

    expect(
      screen.getByText(
        /Previewing the first 5 of 6 rows. Check that this preview matches your CSV before continuing./i,
      ),
    ).toBeInTheDocument();
  });

  it('shows all rows subtitle variant when totalRows is 5 or fewer', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        totalRows: 5,
        unresolved: [],
        malformed: [],
        outOfRange: [],
        sample: [
          { identifier: A001, grades: { Midterm: 41 } },
          { identifier: 'A002', grades: { Midterm: 42 } },
          { identifier: 'A003', grades: { Midterm: 43 } },
          { identifier: 'A004', grades: { Midterm: 44 } },
          { identifier: 'A005', grades: { Midterm: 45 } },
        ],
        conflictRows: [],
        reassignments: [],
        columnOrder: [MIDTERM],
      },
    });

    renderWizard();

    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(
        [
          `${EXTERNAL_ID},${MIDTERM}`,
          'A001,41',
          'A002,42',
          'A003,43',
          'A004,44',
          'A005,45',
        ].join('\n'),
      ),
    );

    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    expect(await screen.findByText(A001)).toBeVisible();

    expect(
      screen.getByText(
        /Previewing all 5 rows. Check that this preview matches your CSV before continuing./i,
      ),
    ).toBeInTheDocument();
  });

  it('renders the Verify preview columns in the CSV column order', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        outOfRange: [],
        sample: [{ identifier: 'A001', grades: { Final: 80, Midterm: 41 } }],
        conflictRows: [],
        reassignments: [],
        totalRows: 1,
        columnOrder: ['Final', 'Midterm'],
      },
    });

    renderWizard();
    // define Midterm first, then Final (opposite of the CSV order)
    await userEvent.type(componentNameInput(), 'Midterm');
    await userEvent.click(
      screen.getByRole('button', { name: /add component/i }),
    );
    const nameInputs = screen.getAllByRole('textbox', {
      name: 'Component name',
    });
    await userEvent.type(nameInputs[1], 'Final');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file('Final,External ID,Midterm\n80,A001,41\n'),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    await screen.findByRole('button', { name: /confirm import/i });

    const headerCells = screen
      .getAllByRole('columnheader')
      .map((c) => c.textContent);
    // identifier header first, then CSV order Final, Midterm
    expect(headerCells).toEqual(['External ID', 'Final', 'Midterm']);
  });

  it('states grades import as-is, with the clamping hint only when weighted view is on', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        conflictRows: [],
        reassignments: [],
        totalRows: 1,
        columnOrder: [MIDTERM],
        sample: [{ identifier: 'A1', grades: { Midterm: 105 } }],
        outOfRange: [
          {
            identifier: 'A1',
            component: MIDTERM,
            grade: 105,
            max: 100,
            kind: 'above',
          },
        ],
      },
    });
    renderWizard({ weightedViewEnabled: true });
    await advanceToVerifyStep();
    expect(
      screen.getByText(
        /Grades will be imported exactly as entered\. This is only a warning; you can turn off this warning in Manage External Assessments\. Out-of-range grades are only floored or capped in the weighted total/,
      ),
    ).toBeInTheDocument();
  });

  it('omits the clamping hint when weighted view is off', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        conflictRows: [],
        reassignments: [],
        totalRows: 1,
        sample: [{ identifier: 'A1', grades: { Midterm: 105 } }],
        outOfRange: [
          {
            identifier: 'A1',
            component: MIDTERM,
            grade: 105,
            max: 100,
            kind: 'above',
          },
        ],
        columnOrder: [MIDTERM],
      },
    });
    renderWizard({ weightedViewEnabled: false });
    await advanceToVerifyStep();
    expect(
      screen.getByText(
        'Grades will be imported exactly as entered. This is only a warning; you can turn off this warning in Manage External Assessments. If these out-of-range grades are intentional, continue.',
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText(/floored or capped/)).not.toBeInTheDocument();
  });

  it('wraps the preview table in a horizontally scrollable container', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        conflictRows: [],
        reassignments: [],
        outOfRange: [],
        totalRows: 1,
        sample: [{ identifier: 'A1', grades: { Midterm: 80 } }],
        columnOrder: [MIDTERM],
      },
    });
    renderWizard();
    await advanceToVerifyStep();
    const table = screen.getByRole('table');
    expect(table.parentElement).toHaveClass('overflow-x-auto');
  });

  it('cues the pending change set on the Verify step before the confirm modal', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        outOfRange: [],
        columnOrder: [MIDTERM],
        sample: [{ identifier: A001, grades: { Midterm: 20 } }],
        conflictRows: [
          {
            identifier: A001,
            studentName: 'Alice',
            cells: { Midterm: { existing: 10, inFile: 20, changed: true } },
          },
        ],
        reassignments: [],
        totalRows: 1,
      },
    });
    renderWizard();
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},${MIDTERM}\n${A001},20\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    // Cue appears on the Verify step, before any confirm click
    expect(
      await screen.findByText(
        /1 row contains changes to existing grades\. After checking this preview, click Confirm import to review these conflicts before anything is imported\./i,
      ),
    ).toBeInTheDocument();
  });

  it('shows a spinner on Replace while the commit is in flight', async () => {
    let resolveCommit: (v: unknown) => void = () => {};
    (CourseAPI.gradebook.importCommit as jest.Mock).mockReturnValue(
      new Promise((res) => {
        resolveCommit = res;
      }),
    );
    (CourseAPI.gradebook.index as jest.Mock).mockResolvedValue({ data: {} });

    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        outOfRange: [],
        sample: [{ identifier: 'A001', grades: { Midterm: 41 } }],
        conflictRows: [
          {
            identifier: 'A001',
            studentName: 'student',
            identifierMismatch: false,
            cells: { Midterm: { existing: 10, inFile: 41, changed: true } },
          },
        ],
        reassignments: [],
        totalRows: 1,
        columnOrder: [MIDTERM],
      },
    });

    renderWizard();
    await advanceToVerifyStep();
    await userEvent.click(
      screen.getByRole('button', { name: /confirm import/i }),
    );
    // conflict prompt is open
    const replaceBtn = await screen.findByRole('button', { name: /replace/i });
    await userEvent.click(replaceBtn);

    // MUI LoadingButton sets aria-disabled and renders a progressbar while loading
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();

    resolveCommit({
      data: { createdComponents: 0, updatedComponents: 1, gradesWritten: 1 },
    });
  });

  it('renders the diagnostic heading and a single closing instruction', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockRejectedValue({
      response: {
        data: {
          errors: {
            message: 'bad_header',
            missing: ['Quiz 2'],
            unrecognized: [],
            suggestions: [],
            duplicates: [],
            identifierNotFirst: false,
          },
        },
      },
    });
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([]),
    });
    await advanceToVerifyFailure(`${EXTERNAL_ID},${MIDTERM}\nA001,41\n`);

    expect(await screen.findByText('These headers need fixing:')).toBeVisible();
    expect(
      screen.getByText('Correct these in your CSV, then re-upload.'),
    ).toBeVisible();
  });

  it('shows the identifier-first bullet when identifierNotFirst is set', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockRejectedValue({
      response: {
        data: {
          errors: {
            message: 'bad_header',
            missing: [],
            unrecognized: [],
            suggestions: [],
            duplicates: [],
            identifierNotFirst: true,
          },
        },
      },
    });
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([]),
    });
    await advanceToVerifyFailure(`${MIDTERM},${EXTERNAL_ID}\n41,A001\n`);

    expect(
      await screen.findByText('‘External ID’ must be the first column.'),
    ).toBeVisible();
  });

  it('shows a reassignment warning when an identifier now matches a different student', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        outOfRange: [],
        sample: [{ identifier: A001, grades: { Midterm: 77 } }],
        conflictRows: [],
        reassignments: [
          {
            identifier: A001,
            currentStudent: 'Carol',
            previousStudents: ['Alice'],
          },
        ],
        columnOrder: [MIDTERM],
        totalRows: 1,
      },
    });

    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([]),
    });
    await advanceToVerifyStep();

    expect(
      await screen.findByText(/now match a different student/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A001: now Carol \(was Alice\)/),
    ).toBeInTheDocument();
  });

  it('shows the External ID matching hint when every student has one', async () => {
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([
        student({ id: 1, name: 'Alice', externalId: 'E1' }),
      ]),
    });
    await fillOneComponent();
    expect(
      screen.getByText(/Matching uses each student's External ID/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('hides the External ID hint when matching by Email', async () => {
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([
        student({ id: 1, name: 'Alice', externalId: 'E1' }),
      ]),
    });
    await fillOneComponent();
    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));
    expect(
      screen.queryByText(/Matching uses each student's External ID/),
    ).not.toBeInTheDocument();
  });

  it('does not cue pending changes when no rows conflict', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
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
      },
    });
    // Use an isolated store (not the shared singleton, which an earlier commit
    // test may have left without a students slice).
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([]),
    });
    await advanceToVerifyStep();
    expect(
      screen.queryByText(/contains? changes to existing grades/i),
    ).not.toBeInTheDocument();
  });

  it('renders the change matrix: changed cells as old→new, unchanged as-is, missing as em-dash', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        outOfRange: [],
        sample: [
          { identifier: A001, grades: { Midterm: 20, Finals: 88 } },
          { identifier: 'A002', grades: { Midterm: 30 } },
        ],
        conflictRows: [
          {
            identifier: A001,
            studentName: 'Alice',
            identifierMismatch: false,
            cells: {
              Midterm: { existing: 10, inFile: 20, changed: true },
              Finals: { existing: 88, inFile: 88, changed: false },
            },
          },
          {
            identifier: 'A002',
            studentName: 'Bob',
            identifierMismatch: false,
            // Finals absent for this row → em-dash in matrix
            cells: { Midterm: { existing: 5, inFile: 30, changed: true } },
          },
        ],
        reassignments: [],
        columnOrder: [MIDTERM, 'Finals'],
        totalRows: 2,
      },
    });
    (CourseAPI.gradebook.importCommit as jest.Mock).mockResolvedValue({
      data: { createdComponents: 0, updatedComponents: 1, gradesWritten: 2 },
    });
    render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[
          { name: MIDTERM, maximumGrade: 50, weightage: 30 },
          { name: 'Finals', maximumGrade: 100, weightage: 70 },
        ]}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
      { state: studentsState([]) },
    );
    // Fill the initial blank row with Midterm (locks it as existing), then add
    // Finals from its chip — two components, so Next is enabled.
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.click(screen.getByRole('button', { name: 'Finals' }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},${MIDTERM},Finals\n${A001},20,88\nA002,30,\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    await userEvent.click(
      await screen.findByRole('button', { name: /confirm import/i }),
    );

    const dialog = await screen.findByRole('dialog', {
      name: /resolve grade conflicts/i,
    });
    // changed cell: struck old + bold new
    const struck = within(dialog).getByText('10');
    expect(struck).toHaveStyle('text-decoration: line-through');
    expect(within(dialog).getByText('20')).toHaveStyle('font-weight: 700');
    // unchanged cell (Finals 88 → 88): shows the stored value, not struck
    expect(within(dialog).getByText('88')).not.toHaveStyle(
      'text-decoration: line-through',
    );
    // missing Finals cell on A002 → em-dash
    expect(within(dialog).getByText('—')).toBeInTheDocument();
  });

  it('formats below-minimum out-of-range grades with a min-0 bound', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
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
        conflictRows: [],
        reassignments: [],
        columnOrder: [MIDTERM],
        totalRows: 1,
      },
    });
    renderWizard({ weightedViewEnabled: true });
    await advanceToVerifyStep();
    expect(screen.getByText(/S1 - Midterm: -5 \(min 0\)/)).toBeInTheDocument();
  });

  it('summarises out-of-range cells beyond the first ten', async () => {
    const outOfRange = Array.from({ length: 12 }, (_, i) => ({
      identifier: `S${i + 1}`,
      component: MIDTERM,
      grade: 105,
      max: 100,
      kind: 'above' as const,
    }));
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        outOfRange,
        sample: [{ identifier: 'S1', grades: { Midterm: 105 } }],
        conflictRows: [],
        reassignments: [],
        columnOrder: [MIDTERM],
        totalRows: 12,
      },
    });
    renderWizard({ weightedViewEnabled: true });
    await advanceToVerifyStep();
    expect(
      screen.getByText(/S10 - Midterm: 105 \(max 100\)/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/S11 - Midterm/)).not.toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('uses email copy for unresolved identifiers when matching by Email', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: false,
        unresolved: ['nope@x.com'],
        malformed: [],
        outOfRange: [],
        sample: [],
        conflictRows: [],
        reassignments: [],
      },
    });
    renderWizard();
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`Email,${MIDTERM}\nnope@x.com,1\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    expect(
      await screen.findByText(
        /This email address was not found in the course: nope@x.com/,
      ),
    ).toBeInTheDocument();
  });

  it('disables Next when two components share the same name', async () => {
    renderWizard();
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(
      screen.getByRole('button', { name: /add component/i }),
    );
    const names = screen.getAllByRole('textbox', { name: 'Component name' });
    await userEvent.type(names[1], MIDTERM);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('lists the Email header when matching by Email', async () => {
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([
        student({ id: 1, name: 'Alice', externalId: 'E1' }),
      ]),
    });
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(
      screen.getByText(/Your CSV needs these column headers: Email, Midterm/),
    ).toBeInTheDocument();
  });

  it('shows the header mismatch without a suggestion list when none is returned', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockRejectedValue({
      response: {
        data: {
          errors: {
            message: 'bad_header',
            missing: [MIDTERMS],
            unrecognized: ['Quiz'],
            suggestions: [],
            duplicates: [],
          },
        },
      },
    });
    renderWizard();
    await userEvent.type(componentNameInput(), MIDTERMS);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},Quiz\nA001,41\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    // The header diagnostic lists the mismatched columns, but with no
    // suggestions returned it omits the "did you mean" line entirely.
    expect(
      await screen.findByText('These headers need fixing:'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This column isn['’]t recognized:.*Quiz/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/did you mean/i)).not.toBeInTheDocument();
  });

  it('shows a specific error when the CSV has no data rows', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockRejectedValue({
      response: { data: { errors: { message: 'empty_csv' } } },
    });
    renderWizard();
    await advanceToVerifyFailure(`${EXTERNAL_ID},${MIDTERM}\n`);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringMatching(/no data rows|empty/i),
      ),
    );
  });

  it('shows the duplicated identifiers when a row identifier repeats', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockRejectedValue({
      response: {
        data: {
          errors: { message: 'duplicate_identifier', identifiers: ['A001'] },
        },
      },
    });
    renderWizard();
    await advanceToVerifyFailure(
      `${EXTERNAL_ID},${MIDTERM}\n${A001},40\n${A001},50\n`,
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/A001/)),
    );
  });

  it('toasts a generic error when the preview fails without a header diagnosis', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockRejectedValue(
      new Error('network'),
    );
    renderWizard();
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},${MIDTERM}\nA001,41\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Could not verify the file. Please try again.',
      ),
    );
    // stays on upload step
    expect(
      screen.queryByRole('button', { name: /confirm import/i }),
    ).not.toBeInTheDocument();
  });

  it('toasts failure and stays open when the commit request rejects', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
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
      },
    });
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
      { state: studentsState([]) },
    );
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file(`${EXTERNAL_ID},${MIDTERM}\n${A001},41\n`),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    await userEvent.click(
      await screen.findByRole('button', { name: /confirm import/i }),
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Import failed. Nothing was saved.',
      ),
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('resets to the define step when reopened after a close', async () => {
    const { rerender } = render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[]}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
    );
    await userEvent.type(componentNameInput(), MIDTERM);
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByLabelText(/upload/i)).toBeInTheDocument(); // on step 1
    // rerender re-renders the root element directly, so re-wrap in TestApp to
    // keep the Redux provider; reusing the singleton store keeps the same store
    // instance, exercising the open-prop reset effect rather than a remount.
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
    // back on define step with a blank component
    expect(componentNameInput()).toHaveValue('');
    expect(screen.queryByLabelText(/upload/i)).not.toBeInTheDocument();
  });
});
