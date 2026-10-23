import { ComponentProps } from 'react';

import Accordion from 'lib/components/core/layouts/Accordion';

import QuestionFilesManager from './QuestionFilesManager';

interface DataFilesAccordionProps
  extends ComponentProps<typeof QuestionFilesManager> {
  title: string;
  disabled?: boolean;
  subtitle?: string;
}

const DataFilesAccordion = (props: DataFilesAccordionProps): JSX.Element => {
  const { title, disabled, subtitle, ...otherProps } = props;

  return (
    <Accordion disabled={disabled} subtitle={subtitle} title={title}>
      <div className="p-5">
        <QuestionFilesManager disabled={disabled} {...otherProps} />
      </div>
    </Accordion>
  );
};

export default DataFilesAccordion;
