import { ComponentProps } from 'react';

import Accordion from 'lib/components/core/layouts/Accordion';

import Editor from './Editor';

interface EditorAccordionProps extends ComponentProps<typeof Editor> {
  title: string;
  disabled?: boolean;
  subtitle?: string;
}

const EditorAccordion = (props: EditorAccordionProps): JSX.Element => {
  const { title, subtitle, ...editorProps } = props;

  return (
    <Accordion disabled={props.disabled} subtitle={subtitle} title={title}>
      <Editor {...editorProps} />
    </Accordion>
  );
};

export default EditorAccordion;
