import { Link, Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import ControlledEditor from '../common/ControlledEditor';
import DataFilesManager from '../common/DataFilesManager';
import ReorderableTestCasesManager from '../ReorderableTestCasesManager';

import PackageEditor, { PackageEditorProps } from './PackageEditor';

const PREPEND_DIV_ID = 'code-inserts-prepend';
const APPEND_DIV_ID = 'code-inserts-append';

const TestCasesHint = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Typography color="text.secondary" variant="body2">
      {t(translations.standardInputOutputTestCasesHint, {
        language: 'C#',
        prepend: (chunk) => <Link href={`#${PREPEND_DIV_ID}`}>{chunk}</Link>,
        append: (chunk) => <Link href={`#${APPEND_DIV_ID}`}>{chunk}</Link>,
      })}
    </Typography>
  );
};

const CsharpPackageEditor = (props: PackageEditorProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <PackageEditor.Templates>
        <ControlledEditor.Template
          disabled={props.disabled}
          language="csharp"
        />
        <ControlledEditor.Solution
          disabled={props.disabled}
          language="csharp"
        />
      </PackageEditor.Templates>

      <PackageEditor.CodeInserts>
        <div id={PREPEND_DIV_ID}>
          <ControlledEditor.Prepend
            defaultValue="// using System;"
            disabled={props.disabled}
            language="csharp"
          />
        </div>
        <div id={APPEND_DIV_ID}>
          <ControlledEditor.Append
            defaultValue={
              '// public class Program\n' +
              '// {\n' +
              '//     public static void Main(string[] args)\n' +
              '//     {\n' +
              '//        int N = int.Parse(Console.ReadLine());\n' +
              '//        int result = MyClass.MyFunction(N);\n' +
              '//        Console.WriteLine(result);\n' +
              '//     }\n' +
              '// }\n'
            }
            disabled={props.disabled}
            language="csharp"
          />
        </div>
      </PackageEditor.CodeInserts>

      <PackageEditor.DataFiles>
        <DataFilesManager
          disabled={props.disabled}
          name="testUi.metadata.dataFiles"
        />
      </PackageEditor.DataFiles>

      <PackageEditor.TestCasesTemplate hint={<TestCasesHint />}>
        <ReorderableTestCasesManager
          disabled={props.disabled}
          lhsHeader={t(translations.input)}
          name="testUi.metadata.testCases.public"
          rhsHeader={t(translations.expectedOutput)}
        />
      </PackageEditor.TestCasesTemplate>
    </>
  );
};

export default CsharpPackageEditor;
