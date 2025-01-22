import { Controller, useFormContext } from 'react-hook-form';
import { RadioGroup, Typography } from '@mui/material';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Subsection from 'lib/components/core/layouts/Subsection';
import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import { useProgrammingFormDataContext } from '../../hooks/ProgrammingFormDataContext';
import ControlledEditor from '../common/ControlledEditor';
import DataFilesAccordion from '../common/DataFilesAccordion';
import DataFilesManager from '../common/DataFilesManager';
import JavaTestCase from '../common/JavaTestCase';
import ReorderableTestCases from '../common/ReorderableTestCases';

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

  const { control, watch } = useFormContext<ProgrammingFormData>();

  const {
    question: { hasSubmissions },
  } = useProgrammingFormDataContext();

  const submitAsFile = watch('testUi.metadata.submitAsFile');

  return (
    <>
      <PackageEditor.Templates>
        <Subsection
          subtitle={t(translations.templateModeHint)}
          title={t(translations.templateMode)}
        >
          <Controller
            control={control}
            name="testUi.metadata.submitAsFile"
            render={({ field: { value, onChange } }): JSX.Element => (
              <RadioGroup
                className="space-y-5"
                onChange={(e): void => onChange(e.target.value === 'file')}
                value={value ? 'file' : 'code'}
              >
                <RadioButton
                  className="my-0"
                  description={t(translations.codeSubmissionHint)}
                  disabled={hasSubmissions || props.disabled}
                  label={t(translations.codeSubmission)}
                  value="code"
                />

                <RadioButton
                  className="my-0"
                  description={t(translations.fileSubmissionHint)}
                  disabled={hasSubmissions || props.disabled}
                  label={t(translations.fileSubmission)}
                  value="file"
                />
              </RadioGroup>
            )}
          />
        </Subsection>

        {submitAsFile ? (
          <>
            <DataFilesAccordion
              disabled={props.disabled}
              name="testUi.metadata.submissionFiles"
              subtitle={t(translations.templateHint)}
              title={t(translations.template)}
            />

            <DataFilesAccordion
              disabled={props.disabled}
              name="testUi.metadata.solutionFiles"
              subtitle={t(translations.solutionHint)}
              title={t(translations.solution)}
            />
          </>
        ) : (
          <>
            <ControlledEditor.Template
              disabled={props.disabled}
              language="java"
            />
            <ControlledEditor.Solution
              disabled={props.disabled}
              language="java"
            />
          </>
        )}
      </PackageEditor.Templates>

      <PackageEditor.CodeInserts>
        <ControlledEditor.Prepend disabled={props.disabled} language="java" />
        <ControlledEditor.Append disabled={props.disabled} language="java" />
      </PackageEditor.CodeInserts>

      <PackageEditor.DataFiles>
        <DataFilesManager
          disabled={props.disabled}
          name="testUi.metadata.dataFiles"
        />
      </PackageEditor.DataFiles>

      <PackageEditor.TestCasesTemplate hint={<TestCasesHint />}>
        <ReorderableTestCases
          as={JavaTestCase}
          disabled={props.disabled}
          hintHeader={t(translations.hint)}
          lhsHeader={t(translations.expression)}
          name="testUi.metadata.testCases.public"
          rhsHeader={t(translations.expected)}
          title={t(translations.publicTestCases)}
        />

        <ReorderableTestCases
          as={JavaTestCase}
          disabled={props.disabled}
          hintHeader={t(translations.hint)}
          lhsHeader={t(translations.expression)}
          name="testUi.metadata.testCases.private"
          rhsHeader={t(translations.expected)}
          subtitle={t(translations.privateTestCasesHint)}
          title={t(translations.privateTestCases)}
        />

        <ReorderableTestCases
          as={JavaTestCase}
          disabled={props.disabled}
          hintHeader={t(translations.hint)}
          lhsHeader={t(translations.expression)}
          name="testUi.metadata.testCases.evaluation"
          rhsHeader={t(translations.expected)}
          subtitle={t(translations.evaluationTestCasesHint)}
          title={t(translations.evaluationTestCases)}
        />
      </PackageEditor.TestCasesTemplate>
    </>
  );
};

export default JavaPackageEditor;
