import userEvent from '@testing-library/user-event';
import { store as appStore } from 'store';
import { render, screen, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import ImportExternalAssessmentsWizard from '../components/import/ImportExternalAssessmentsWizard';

jest.mock('api/course');
jest.mock('lib/components/wrappers/I18nProvider');

const renderWizard = (): void => {
  render(
    <ImportExternalAssessmentsWizard
      existingExternalTitles={[]}
      onClose={jest.fn()}
      open
      weightedViewEnabled
    />,
    { store: appStore },
  );
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
        existingExternalTitles={[]}
        onClose={jest.fn()}
        open
        weightedViewEnabled={false}
      />,
      { store: appStore },
    );
    await userEvent.type(screen.getByLabelText(/component name/i), 'Midterm');
    expect(screen.queryByLabelText(/weightage/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/max marks/i)).toBeInTheDocument();
  });

  it('disables Next when component name is empty', () => {
    renderWizard();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
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
        existingExternalTitles={['Midterm']}
        onClose={jest.fn()}
        open
        weightedViewEnabled
      />,
      { store: appStore },
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
});
