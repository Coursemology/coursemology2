import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import ImportExternalAssessmentsWizard from '../components/import/ImportExternalAssessmentsWizard';

jest.mock('api/course');
jest.mock('lib/components/wrappers/I18nProvider');

const defaultProps = {
  existingAssessments: [],
  onClose: jest.fn(),
  weightedViewEnabled: true,
};

const renderWizard = (): void => {
  render(
    <ImportExternalAssessmentsWizard
      existingAssessments={[]}
      onClose={jest.fn()}
      open
      weightedViewEnabled
    />,
  );
};

const studentsState = (students: object[]): object => ({
  gradebook: {
    categories: [], tabs: [], submissions: [], assessments: [],
    gamificationEnabled: false, weightedViewEnabled: false, canManageWeights: true,
    students,
  },
});

const fillOneComponent = async (): Promise<void> => {
  await userEvent.type(screen.getByLabelText('Component name'), 'Midterm');
};

const file = (text: string): File =>
  new File([text], 'marks.csv', { type: 'text/csv' });

describe('ImportExternalAssessmentsWizard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('walks define → upload → verify → commit with no conflicts', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        sample: [{ studentName: 'Alice', grades: { Midterm: 41 } }],
        conflicts: [],
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
    await userEvent.type(screen.getByLabelText(/component name/i), 'Midterm');
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: upload
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file('Identifier,Midterm\nA001,41\n'),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    // Step 3: preview shows the sample
    expect(await screen.findByText('Alice')).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: /continue|confirm/i }),
    );

    await waitFor(() =>
      expect(CourseAPI.gradebook.importCommit).toHaveBeenCalled(),
    );
    const payload = (CourseAPI.gradebook.importCommit as jest.Mock).mock
      .calls[0][0];
    expect(payload.onConflict).toBe('replace');
    expect(payload.identifierMode).toBe('student_id');
    expect(payload.components[0]).toMatchObject({
      name: 'Midterm',
      weightage: 30,
      maximumGrade: 50,
    });
  });

  it('shows unresolved identifiers and stays on the upload step', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: false,
        unresolved: ['ZZZ'],
        malformed: [],
        sample: [],
        conflicts: [],
      },
    });
    renderWizard();
    await userEvent.type(screen.getByLabelText(/component name/i), 'Midterm');
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file('Identifier,Midterm\nZZZ,1\n'),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
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
    await userEvent.type(screen.getByLabelText(/component name/i), 'Midterm');
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
    expect(screen.getByRole('radio', { name: 'External ID' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Student ID' })).not.toBeInTheDocument();
  });

  it('commits with keep when Keep Existing is clicked on the conflict prompt', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: true,
        unresolved: [],
        malformed: [],
        sample: [{ studentName: 'Alice', grades: { Midterm: 20 } }],
        conflicts: [
          {
            component: 'Midterm',
            studentName: 'Alice',
            existingGrade: 10,
            inFileGrade: 20,
            identifierMismatch: false,
          },
        ],
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
    await userEvent.type(screen.getByLabelText(/component name/i), 'Midterm');
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file('Identifier,Midterm\nA001,20\n'),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    await userEvent.click(
      await screen.findByRole('button', { name: /confirm import/i }),
    );
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
        { id: 1, name: 'Alice Lim', email: 'a@x.com', externalId: null, level: 0, totalXp: 0 },
        { id: 2, name: 'Bob Tan', email: 'b@x.com', externalId: 'E2', level: 0, totalXp: 0 },
      ]),
    });
    await fillOneComponent();
    expect(screen.getByText(/Alice Lim has no External ID/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('enables Next once matching by Email instead', async () => {
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([
        { id: 1, name: 'Alice Lim', email: 'a@x.com', externalId: null, level: 0, totalXp: 0 },
      ]),
    });
    await fillOneComponent();
    await userEvent.click(screen.getByRole('radio', { name: 'Email' }));
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('lists the exact required headers on the upload step', async () => {
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([
        { id: 1, name: 'Alice', email: 'a@x.com', externalId: 'E1', level: 0, totalXp: 0 },
      ]),
    });
    await userEvent.type(screen.getByLabelText('Component name'), 'Midterm');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(
      screen.getByText(/Your CSV needs these column headers: External ID, Midterm/),
    ).toBeInTheDocument();
  });

  it('summarises the count when several students lack an External ID', async () => {
    render(<ImportExternalAssessmentsWizard {...defaultProps} open />, {
      state: studentsState([
        { id: 1, name: 'Alice Lim', email: 'a@x.com', externalId: null, level: 0, totalXp: 0 },
        { id: 2, name: 'Bob Tan', email: 'b@x.com', externalId: '', level: 0, totalXp: 0 },
      ]),
    });
    await fillOneComponent();
    expect(screen.getByText(/2 students have no External ID, including Alice Lim/)).toBeInTheDocument();
  });

  it('does not show Confirm import button when preview has errors', async () => {
    (CourseAPI.gradebook.importPreview as jest.Mock).mockResolvedValue({
      data: {
        ok: false,
        unresolved: ['ZZZ'],
        malformed: [],
        sample: [],
        conflicts: [],
      },
    });
    renderWizard();
    await userEvent.type(screen.getByLabelText(/component name/i), 'Midterm');
    await userEvent.type(screen.getByLabelText(/weightage/i), '30');
    await userEvent.type(screen.getByLabelText(/max marks/i), '50');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file('Identifier,Midterm\nZZZ,1\n'),
    );
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
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
        sample: [{ studentName: 'Alice', grades: { Midterm: 20 } }],
        conflicts: [
          {
            component: 'Midterm',
            studentName: 'Alice',
            existingGrade: 10,
            inFileGrade: 20,
            identifierMismatch: false,
          },
        ],
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
        existingAssessments={[{ name: 'Midterm', maximumGrade: 50, weightage: 30 }]}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
    );
    // Step 1: 'Midterm' matches existing → max/weightage locked; just Next.
    await userEvent.type(screen.getByLabelText(/component name/i), 'Midterm');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.upload(
      screen.getByLabelText(/upload/i),
      file('Identifier,Midterm\nA001,20\n'),
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
          { name: 'Midterm', maximumGrade: 50, weightage: 30 },
          { name: 'Finals', maximumGrade: 100, weightage: 70 },
        ]}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
    );
    expect(screen.getByRole('button', { name: 'Midterm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finals' })).toBeInTheDocument();
  });

  it('clicking an existing chip inserts a locked row pre-filled with correct max and weight', async () => {
    render(
      <ImportExternalAssessmentsWizard
        existingAssessments={[{ name: 'Midterm', maximumGrade: 50, weightage: 30 }]}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Midterm' }));

    // The chip-inserted row's name field is read-only (disabled input)
    const nameInput = screen.getByDisplayValue('Midterm');
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
        existingAssessments={[{ name: 'Midterm', maximumGrade: 50, weightage: 30 }]}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Midterm' }));
    // After clicking, chip disappears (already in the list)
    expect(screen.queryByRole('button', { name: 'Midterm' })).not.toBeInTheDocument();
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
});
