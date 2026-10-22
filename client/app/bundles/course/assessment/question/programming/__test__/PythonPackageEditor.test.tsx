import { FormProvider, useForm } from 'react-hook-form';
import { fireEvent, render, screen } from 'test-utils';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import PythonPackageEditor, {
  FILE_SUBMISSION_PREPEND_EXAMPLE,
} from '../components/package/PythonPackageEditor';
import { ProgrammingFormDataProvider } from '../hooks/ProgrammingFormDataContext';

jest.mock(
  'lib/components/core/fields/EditorField',
  () =>
    // eslint-disable-next-line react/display-name
    ({ name, value }: { name: string; value: string }): JSX.Element => (
      <textarea data-testid={name} name={name} readOnly value={value} />
    ),
);

const PYTHON_ID = 18;

const renderEditor = (prepend?: string): void => {
  const data = {
    question: { languageId: PYTHON_ID, hasSubmissions: false },
    languages: [
      {
        id: PYTHON_ID,
        name: 'Python 3.10',
        disabled: false,
        editorMode: 'python',
        whitelists: {
          defaultEvaluator: true,
          codaveriEvaluator: true,
          multipleFileSubmission: true,
        },
        dependencies: [],
      },
    ],
  } as unknown as ProgrammingFormData;

  const Harness = (): JSX.Element => {
    const methods = useForm({
      defaultValues: {
        question: { languageId: PYTHON_ID },
        testUi: {
          mode: 'python',
          metadata: {
            submitAsFile: false,
            submission: '',
            solution: '',
            prepend,
            append: '',
            dataFiles: [],
            submissionFiles: [],
            solutionFiles: [],
            testCases: { public: [], private: [], evaluation: [] },
          },
        },
      } as unknown as ProgrammingFormData,
    });

    return (
      <ProgrammingFormDataProvider from={data}>
        <FormProvider {...methods}>
          <PythonPackageEditor />
          <output data-testid="saved-prepend">
            {JSON.stringify(methods.watch('testUi.metadata.prepend') ?? null)}
          </output>
        </FormProvider>
      </ProgrammingFormDataProvider>
    );
  };

  render(<Harness />);
};

describe('<PythonPackageEditor />', () => {
  it('shows a commented example in an empty prepend with file submission, without saving it', async () => {
    renderEditor();

    const fileSubmission = await screen.findByRole('radio', {
      name: 'File submission',
    });
    expect(screen.getByTestId('testUi.metadata.prepend')).toHaveValue('');

    fireEvent.click(fileSubmission);

    expect(screen.getByTestId('testUi.metadata.prepend')).toHaveValue(
      FILE_SUBMISSION_PREPEND_EXAMPLE,
    );
    expect(screen.getByTestId('saved-prepend')).toHaveTextContent('null');
  });

  it('shows the prepend the question creator wrote instead of the example', async () => {
    renderEditor('import app as student');

    fireEvent.click(
      await screen.findByRole('radio', { name: 'File submission' }),
    );

    expect(screen.getByTestId('testUi.metadata.prepend')).toHaveValue(
      'import app as student',
    );
  });

  it('explains how test cases reach the student files in file submission mode', async () => {
    renderEditor();

    expect(
      await screen.findByText(
        /Expressions will be evaluated in the context of the submitted code/,
      ),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('radio', { name: 'File submission' }));

    expect(
      screen.getByText(
        /submitted code file\(s\) must be imported in the prepend script/,
      ),
    ).toBeVisible();
  });
});
