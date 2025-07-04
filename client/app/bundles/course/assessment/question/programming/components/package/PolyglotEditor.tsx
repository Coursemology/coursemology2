import { ElementType } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  LanguageMode,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';

import Section from 'lib/components/core/layouts/Section';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import ControlledEditor from '../common/ControlledEditor';

import CppPackageEditor from './CppPackageEditor';
import CsharpPackageEditor from './CsharpPackageEditor';
import GoPackageEditor from './GoPackageEditor';
import JavaPackageEditor from './JavaPackageEditor';
import JavascriptPackageEditor from './JavascriptPackageEditor';
import PackageDetails from './PackageDetails';
import PythonPackageEditor from './PythonPackageEditor';
import RPackageEditor from './RPackageEditor';
import RustPackageEditor from './RustPackageEditor';
import TypescriptPackageEditor from './TypescriptPackageEditor';

const EDITORS: Partial<Record<LanguageMode, ElementType>> = {
  python: PythonPackageEditor,
  java: JavaPackageEditor,
  c_cpp: CppPackageEditor,
  r: RPackageEditor,
  javascript: JavascriptPackageEditor,
  csharp: CsharpPackageEditor,
  golang: GoPackageEditor,
  rust: RustPackageEditor,
  typescript: TypescriptPackageEditor,
};

interface PolyglotEditorProps {
  languageMode: LanguageMode;
  disabled?: boolean;
}

const PolyglotEditor = (props: PolyglotEditorProps): JSX.Element => {
  const { t } = useTranslation();

  const { watch } = useFormContext<ProgrammingFormData>();

  const autograded = watch('question.autograded');
  const editOnline = watch('question.editOnline');

  if (!autograded)
    return (
      <Section sticksToNavbar title={t(translations.templates)}>
        <ControlledEditor.Template
          disabled={props.disabled}
          language={props.languageMode}
        />
      </Section>
    );

  if (!editOnline) return <PackageDetails disabled={props.disabled} />;

  const EditorComponent = EDITORS[props.languageMode];

  if (!EditorComponent)
    throw new Error(`Unsupported language mode: "${props.languageMode}".`);

  return <EditorComponent disabled={props.disabled} />;
};

export default PolyglotEditor;
