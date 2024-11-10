import { ComponentProps } from 'react';
import { Controller, FieldPathByValue, useFormContext } from 'react-hook-form';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import EditorAccordion from './EditorAccordion';

type EditorAccordionProps = ComponentProps<typeof EditorAccordion>;

interface ControlledEditorChildProps extends Partial<EditorAccordionProps> {
  language: EditorAccordionProps['language'];
}

interface ControlledEditorProps extends ControlledEditorChildProps {
  name: FieldPathByValue<ProgrammingFormData, string | null>;
  title: EditorAccordionProps['title'];
  defaultValue?: string;
}

const ControlledEditor = (props: ControlledEditorProps): JSX.Element => {
  const { name, defaultValue, ...editorProps } = props;

  const { control } = useFormContext<ProgrammingFormData>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }): JSX.Element => (
        <EditorAccordion
          {...editorProps}
          name={field.name}
          onChange={field.onChange}
          value={field.value ?? defaultValue ?? ''}
        />
      )}
    />
  );
};

const Prepend = (props: ControlledEditorChildProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <ControlledEditor
      subtitle={t(translations.prependHint)}
      title={t(translations.prepend)}
      {...props}
      name="testUi.metadata.prepend"
    />
  );
};

const Append = (props: ControlledEditorChildProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <ControlledEditor
      subtitle={t(translations.appendHint)}
      title={t(translations.append)}
      {...props}
      name="testUi.metadata.append"
    />
  );
};

const Template = (props: ControlledEditorChildProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <ControlledEditor
      subtitle={t(translations.templateHint)}
      title={t(translations.template)}
      {...props}
      name="testUi.metadata.submission"
    />
  );
};

const Solution = (props: ControlledEditorChildProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <ControlledEditor
      subtitle={t(translations.solutionHint)}
      title={t(translations.solution)}
      {...props}
      name="testUi.metadata.solution"
    />
  );
};

export default { Append, Prepend, Solution, Template };
