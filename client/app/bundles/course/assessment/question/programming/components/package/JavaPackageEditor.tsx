import { Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import ControlledEditor from '../common/ControlledEditor';
import QuestionFilesManager from '../common/QuestionFilesManager';
import ReorderableJavaTestCase from '../common/ReorderableJavaTestCase';
import SubmissionModeTemplates from '../common/SubmissionModeTemplates';
import ReorderableTestCasesManager from '../ReorderableTestCasesManager';

import PackageEditor, {
  CODE_INSERTS_ID,
  PackageEditorProps,
} from './PackageEditor';

const printValueDefinition = `String printValue(Object val) {
  String.valueOf(val);
}` as const;

const expectEqualsDefinition =
  `void expectEquals(Object expression, Object expected) {
  Assert.assertEquals(expression, expected);
}` as const;

const TestCasesHint = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <Typography color="text.secondary" variant="body2">
        {t(translations.javaTestCasesHint, {
          code: (chunk) => <code>{chunk}</code>,
        })}
      </Typography>

      <pre>
        <code>{expectEqualsDefinition}</code>
      </pre>

      <Typography color="text.secondary" variant="body2">
        {t(translations.javaTestCasesHint2, {
          code: (chunk) => <code>{chunk}</code>,
        })}
      </Typography>

      <pre>
        <code>{printValueDefinition}</code>
      </pre>

      <Typography color="text.secondary" variant="body2">
        {t(translations.javaTestCasesHint3, {
          append: (chunk) => <Link href={`#${CODE_INSERTS_ID}`}>{chunk}</Link>,
        })}
      </Typography>
    </>
  );
};

const JavaPackageEditor = (props: PackageEditorProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <PackageEditor.Templates>
        <SubmissionModeTemplates disabled={props.disabled} language="java" />
      </PackageEditor.Templates>

      <PackageEditor.CodeInserts>
        <ControlledEditor.Prepend disabled={props.disabled} language="java" />
        <ControlledEditor.Append disabled={props.disabled} language="java" />
      </PackageEditor.CodeInserts>

      <PackageEditor.DataFiles>
        <QuestionFilesManager
          disabled={props.disabled}
          name="testUi.metadata.dataFiles"
        />
      </PackageEditor.DataFiles>

      <PackageEditor.TestCasesTemplate hint={<TestCasesHint />}>
        <ReorderableTestCasesManager
          component={ReorderableJavaTestCase}
          disabled={props.disabled}
          lhsHeader={t(translations.expression)}
          name="testUi.metadata.testCases.public"
          rhsHeader={t(translations.expected)}
        />
      </PackageEditor.TestCasesTemplate>
    </>
  );
};

export default JavaPackageEditor;
