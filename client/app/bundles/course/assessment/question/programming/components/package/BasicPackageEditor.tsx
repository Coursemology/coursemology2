import { ReactNode } from 'react';
import { LanguageMode } from 'types/course/assessment/question/programming';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import ControlledEditor from '../common/ControlledEditor';
import DataFilesManager from '../common/DataFilesManager';
import ReorderableTestCasesManager from '../ReorderableTestCasesManager';

import PackageEditor, { PackageEditorProps } from './PackageEditor';

interface BasicPackageEditorProps extends PackageEditorProps {
  language: LanguageMode;
  hint?: ReactNode;
}

const BasicPackageEditor = (props: BasicPackageEditorProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <PackageEditor.Templates>
        <ControlledEditor.Template
          disabled={props.disabled}
          language={props.language}
        />
        <ControlledEditor.Solution
          disabled={props.disabled}
          language={props.language}
        />
      </PackageEditor.Templates>

      <PackageEditor.CodeInserts>
        <ControlledEditor.Prepend
          disabled={props.disabled}
          language={props.language}
        />
        <ControlledEditor.Append
          disabled={props.disabled}
          language={props.language}
        />
      </PackageEditor.CodeInserts>

      <PackageEditor.DataFiles>
        <DataFilesManager
          disabled={props.disabled}
          name="testUi.metadata.dataFiles"
        />
      </PackageEditor.DataFiles>

      <PackageEditor.TestCasesTemplate hint={props.hint}>
        <ReorderableTestCasesManager
          disabled={props.disabled}
          lhsHeader={t(translations.expression)}
          name="testUi.metadata.testCases.public"
          rhsHeader={t(translations.expected)}
        />
      </PackageEditor.TestCasesTemplate>
    </>
  );
};

export default BasicPackageEditor;
