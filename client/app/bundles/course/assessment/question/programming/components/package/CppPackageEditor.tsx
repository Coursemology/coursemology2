import { Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import BasicPackageEditor from './BasicPackageEditor';
import { PackageEditorProps } from './PackageEditor';

const TestCasesHint = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Typography color="text.secondary" variant="body2">
      {t(translations.cppTestCasesHint, {
        code: (chunk) => <code>{chunk}</code>,
        gtf: (chunk) => (
          <Link href="https://github.com/google/googletest" opensInNewTab>
            {chunk}
          </Link>
        ),
        sts: (chunk) => (
          <Link
            href="http://en.cppreference.com/w/cpp/string/basic_string/to_string"
            opensInNewTab
          >
            <code>{chunk}</code>
          </Link>
        ),
      })}
    </Typography>
  );
};

const CppPackageEditor = (props: PackageEditorProps): JSX.Element => (
  <BasicPackageEditor {...props} hint={<TestCasesHint />} language="c_cpp" />
);

export default CppPackageEditor;
