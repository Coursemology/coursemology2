import { ComponentProps } from 'react';

import Accordion from 'lib/components/core/layouts/Accordion';

import DataFilesManager from './DataFilesManager';

interface DataFilesAccordionProps
  extends ComponentProps<typeof DataFilesManager> {
  title: string;
  disabled?: boolean;
  subtitle?: string;
}

const DataFilesAccordion = (props: DataFilesAccordionProps): JSX.Element => {
  const { title, disabled, subtitle, ...otherProps } = props;

  return (
    <Accordion disabled={disabled} subtitle={subtitle} title={title}>
      <DataFilesManager {...otherProps} headless toolbarClassName="p-5" />
    </Accordion>
  );
};

export default DataFilesAccordion;
