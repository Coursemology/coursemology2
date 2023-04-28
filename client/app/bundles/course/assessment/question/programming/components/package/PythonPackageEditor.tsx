import { Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import BasicPackageEditor from './BasicPackageEditor';
import { PackageEditorProps } from './PackageEditor';

const TestCasesHint = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Typography color="text.secondary" variant="body2">
      {t(translations.pythonTestCasesHint, {
        code: (chunk) => <code>{chunk}</code>,
      })}
    </Typography>
  );
};

const PythonPackageEditor = (props: PackageEditorProps): JSX.Element => (
  <BasicPackageEditor {...props} hint={<TestCasesHint />} language="python" />
);

export default PythonPackageEditor;
