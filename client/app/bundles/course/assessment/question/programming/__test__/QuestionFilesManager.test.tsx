/* eslint-disable sonarjs/no-duplicate-string */
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, within } from 'test-utils';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import { DraftableDataFile, mark } from '../commons/draftFiles';
import QuestionFilesManager from '../components/common/QuestionFilesManager';

// A row's delete button, which is labelled "Delete" alone: the row says what it deletes.
const rowNamed = (name: string): HTMLElement =>
  screen.getByRole('treeitem', {
    name: (label) => label === name || label.startsWith(`${name}, `),
  });
const deleteButtonOf = (name: string): HTMLElement =>
  within(rowNamed(name)).getByRole('button', { name: 'Delete' });

const saved = (filename: string): DraftableDataFile => ({
  filename,
  size: 4,
  hash: 'abc',
});

let form: UseFormReturn<ProgrammingFormData>;

const Form = (props: { files: unknown[] }): JSX.Element => {
  form = useForm<ProgrammingFormData>({
    defaultValues: {
      testUi: { mode: 'python', metadata: { dataFiles: props.files } },
    } as unknown as ProgrammingFormData,
  });

  // react-hook-form only tracks `isDirty` for a form that reads it while rendering, as
  // `lib/components/form/Form` does to show its save bar.
  const { isDirty } = form.formState;

  return (
    <FormProvider {...form}>
      <QuestionFilesManager name="testUi.metadata.dataFiles" />
      <span data-testid="dirty">{String(isDirty)}</span>
    </FormProvider>
  );
};

const dataFiles = (): unknown[] =>
  form.getValues('testUi.metadata.dataFiles') as unknown[];

const renderForm = async (files: unknown[]): Promise<void> => {
  render(<Form files={files} />);
  await screen.findByRole('tree');
};

describe('QuestionFilesManager', () => {
  it('shows saved, new and marked files from the form', async () => {
    await renderForm([saved('a.py'), mark(saved('data/b.csv'))]);

    expect(screen.getByRole('treeitem', { name: 'a.py' })).toBeVisible();
    expect(
      screen.getByRole('treeitem', { name: 'b.csv, To delete' }),
    ).toBeVisible();
  });

  it('adds an upload to the form under its path, with its file', async () => {
    const user = userEvent.setup();
    await renderForm([saved('data/b.csv')]);

    await user.click(screen.getByRole('treeitem', { name: 'data' }));
    const file = new File(['x,y'], 'c.csv');
    fireEvent.change(screen.getByTestId('file-tree-add-files'), {
      target: { files: [file] },
    });

    expect(dataFiles()).toEqual([
      saved('data/b.csv'),
      { filename: 'data/c.csv', size: 3, hash: '', raw: file },
    ]);
  });

  it('adds an empty upload as a file of no bytes', async () => {
    await renderForm([]);

    const file = new File([], '__init__.py');
    fireEvent.change(screen.getByTestId('file-tree-add-files'), {
      target: { files: [file] },
    });

    expect(dataFiles()).toEqual([
      { filename: '__init__.py', size: 0, hash: '', raw: file },
    ]);
    expect(
      screen.getByRole('treeitem', { name: '__init__.py, New' }),
    ).toBeVisible();
  });

  it('marks a saved file, and drops a new one, when deleted', async () => {
    const user = userEvent.setup();
    const file = new File(['x'], 'new.py');
    await renderForm([
      saved('a.py'),
      { filename: 'new.py', size: 1, hash: '', raw: file },
    ]);

    await user.click(deleteButtonOf('a.py'));
    await user.click(deleteButtonOf('new.py'));

    expect(dataFiles()).toEqual([mark(saved('a.py'))]);
  });

  it('restores a marked file', async () => {
    const user = userEvent.setup();
    await renderForm([mark(saved('a.py'))]);

    await user.click(screen.getByLabelText('Restore a.py'));

    expect(dataFiles()).toEqual([saved('a.py')]);
  });

  it('marks every saved file in a deleted folder, and the form as changed', async () => {
    const user = userEvent.setup();
    await renderForm([saved('data/a.csv'), saved('data/b.csv'), saved('c.py')]);
    expect(screen.getByTestId('dirty')).toHaveTextContent('false');

    await user.click(deleteButtonOf('data'));

    expect(dataFiles()).toEqual([
      mark(saved('data/a.csv')),
      mark(saved('data/b.csv')),
      saved('c.py'),
    ]);
    expect(screen.getByTestId('dirty')).toHaveTextContent('true');
  });

  it('renames a new file in the form', async () => {
    const user = userEvent.setup();
    const file = new File(['x'], 'draft.py');
    await renderForm([{ filename: 'draft.py', size: 1, hash: '', raw: file }]);

    await user.click(screen.getByLabelText('Rename draft.py'));
    const field = screen.getByLabelText('New name for draft.py');
    await user.clear(field);
    await user.type(field, 'main.py{Enter}');

    expect(dataFiles()).toEqual([
      { filename: 'main.py', size: 1, hash: '', raw: file },
    ]);
  });
});
