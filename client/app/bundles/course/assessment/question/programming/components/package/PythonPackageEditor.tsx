import { useFormContext } from 'react-hook-form';
import { Typography } from '@mui/material';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import BasicPackageEditor from './BasicPackageEditor';
import { PackageEditorProps } from './PackageEditor';

// Shown in an empty prepend with file submission, where the tests import the student's files
// instead of having them pasted in. Commented out, so it does nothing if left as is.
export const FILE_SUBMISSION_PREPEND_EXAMPLE =
  "# Import the student's files here, then call them from the test cases.\n" +
  '# For example, if the student submits main.py:\n' +
  '# import main as student\n' +
  '# A test case can then call student.my_function(1, 2).\n';

const TestCasesHint = (): JSX.Element => {
  const { t } = useTranslation();

  const { watch } = useFormContext<ProgrammingFormData>();
  const submitAsFile = watch('testUi.metadata.submitAsFile');

  return (
    <Typography color="text.secondary" variant="body2">
      {t(
        submitAsFile
          ? translations.pythonFileSubmissionTestCasesHint
          : translations.pythonTestCasesHint,
        { code: (chunk) => <code>{chunk}</code> },
      )}
    </Typography>
  );
};

const PythonPackageEditor = (props: PackageEditorProps): JSX.Element => {
  const { watch } = useFormContext<ProgrammingFormData>();
  const submitAsFile = watch('testUi.metadata.submitAsFile');

  return (
    <BasicPackageEditor
      {...props}
      hint={<TestCasesHint />}
      language="python"
      prependDefaultValue={
        submitAsFile ? FILE_SUBMISSION_PREPEND_EXAMPLE : undefined
      }
    />
  );
};

export default PythonPackageEditor;
