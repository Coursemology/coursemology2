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
import JavaPackageEditor from './JavaPackageEditor';
import PackageDetails from './PackageDetails';
import PythonPackageEditor from './PythonPackageEditor';

const EDITORS: Partial<Record<LanguageMode, ElementType>> = {
  python: PythonPackageEditor,
  java: JavaPackageEditor,
  c_cpp: CppPackageEditor,
};

export const SUPPORTED_EDITORS = new Set(
  Object.keys(EDITORS) as LanguageMode[],
);

export const isLanguageSupported = (language: LanguageMode): boolean =>
  SUPPORTED_EDITORS.has(language);

interface PolyglotEditorProps {
  getModeFromId: (id: number) => LanguageMode;
  disabled?: boolean;
}

const PolyglotEditor = (props: PolyglotEditorProps): JSX.Element => {
  const { t } = useTranslation();

  const { watch } = useFormContext<ProgrammingFormData>();

  const language = props.getModeFromId(watch('question.languageId'));
  const autograded = watch('question.autograded');
  const editOnline = watch('question.editOnline');

  if (!autograded)
    return (
      <Section sticksToNavbar title={t(translations.templates)}>
        <ControlledEditor.Template
          disabled={props.disabled}
          language={language}
        />
      </Section>
    );

  if (!editOnline) return <PackageDetails disabled={props.disabled} />;

  const EditorComponent = EDITORS[language];

  if (!EditorComponent)
    throw new Error(`Unsupported language mode: "${language}".`);

  return <EditorComponent disabled={props.disabled} />;
};

export default PolyglotEditor;
