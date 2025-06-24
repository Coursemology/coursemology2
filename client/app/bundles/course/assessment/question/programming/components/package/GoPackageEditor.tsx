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
        language: 'Go',
        prepend: (chunk) => <Link href={`#${PREPEND_DIV_ID}`}>{chunk}</Link>,
        append: (chunk) => <Link href={`#${APPEND_DIV_ID}`}>{chunk}</Link>,
      })}
    </Typography>
  );
};

const GoPackageEditor = (props: PackageEditorProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <PackageEditor.Templates>
        <ControlledEditor.Template
          disabled={props.disabled}
          language="golang"
        />
        <ControlledEditor.Solution
          disabled={props.disabled}
          language="golang"
        />
      </PackageEditor.Templates>

      <PackageEditor.CodeInserts>
        <div id={PREPEND_DIV_ID}>
          <ControlledEditor.Prepend
            defaultValue={
              '// package main\n' +
              '// import (\n' +
              '//     "fmt"\n' +
              '// )\n'
            }
            disabled={props.disabled}
            language="golang"
          />
        </div>
        <div id={APPEND_DIV_ID}>
          <ControlledEditor.Append
            defaultValue={
              '// func main() {\n' +
              '//     var n int\n' +
              '//     fmt.Scan(&n)\n' +
              '//     result := myFunction(n)\n' +
              '//     fmt.Println(result)\n' +
              '// }\n'
            }
            disabled={props.disabled}
            language="golang"
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

export default GoPackageEditor;
