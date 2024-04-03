import { ComponentProps } from 'react';

import EditorField from 'lib/components/core/fields/EditorField';
import Accordion from 'lib/components/core/layouts/Accordion';

interface EditorAccordionProps extends ComponentProps<typeof EditorField> {
  title: string;
  disabled?: boolean;
  subtitle?: string;
}

const EditorAccordion = (props: EditorAccordionProps): JSX.Element => {
  const { title, subtitle, ...editorProps } = props;

  return (
    <Accordion disabled={props.disabled} subtitle={subtitle} title={title}>
      <EditorField {...editorProps} />
    </Accordion>
  );
};

export default EditorAccordion;
