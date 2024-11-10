import { Link, Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import ControlledEditor from '../common/ControlledEditor';
import DataFilesManager from '../common/DataFilesManager';
import TestCases from '../common/TestCases';

import PackageEditor, { PackageEditorProps } from './PackageEditor';

const PREPEND_DIV_ID = 'code-inserts-prepend';
const APPEND_DIV_ID = 'code-inserts-append';

const TestCasesHint = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Typography color="text.secondary" variant="body2">
      {t(translations.rTestCasesHint, {
        prepend: (chunk) => <Link href={`#${PREPEND_DIV_ID}`}>{chunk}</Link>,
        append: (chunk) => <Link href={`#${APPEND_DIV_ID}`}>{chunk}</Link>,
      })}
    </Typography>
  );
};

const RPackageEditor = (props: PackageEditorProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <PackageEditor.Templates>
        <ControlledEditor.Template disabled={props.disabled} language="r" />
        <ControlledEditor.Solution disabled={props.disabled} language="r" />
      </PackageEditor.Templates>

      <PackageEditor.CodeInserts>
        <div id={PREPEND_DIV_ID}>
          <ControlledEditor.Prepend disabled={props.disabled} language="r" />
        </div>
        <div id={APPEND_DIV_ID}>
          <ControlledEditor.Append
            defaultValue={
              "# N <- as.integer(readLines('stdin', n=1))\n" +
              '# result <- my_function(N)\n' +
              '# cat(result)\n'
            }
            disabled={props.disabled}
            language="r"
          />
        </div>
      </PackageEditor.CodeInserts>

      <PackageEditor.DataFiles>
        <DataFilesManager
          disabled={props.disabled}
          name="testUi.metadata.dataFiles"
        />
      </PackageEditor.DataFiles>

      <PackageEditor.TestCases hint={<TestCasesHint />}>
        <TestCases
          disabled={props.disabled}
          hintHeader={t(translations.hint)}
          lhsHeader={t(translations.input)}
          name="testUi.metadata.testCases.public"
          rhsHeader={t(translations.expectedOutput)}
          title={t(translations.publicTestCases)}
        />

        <TestCases
          disabled={props.disabled}
          hintHeader={t(translations.hint)}
          lhsHeader={t(translations.input)}
          name="testUi.metadata.testCases.private"
          rhsHeader={t(translations.expectedOutput)}
          subtitle={t(translations.privateTestCasesHint)}
          title={t(translations.privateTestCases)}
        />

        <TestCases
          disabled={props.disabled}
          hintHeader={t(translations.hint)}
          lhsHeader={t(translations.input)}
          name="testUi.metadata.testCases.evaluation"
          rhsHeader={t(translations.expectedOutput)}
          subtitle={t(translations.evaluationTestCasesHint)}
          title={t(translations.evaluationTestCases)}
        />
      </PackageEditor.TestCases>
    </>
  );
};

export default RPackageEditor;
