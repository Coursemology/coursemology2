import { FC } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Chip } from '@mui/material';

import Accordion from 'lib/components/core/layouts/Accordion';

const translations = defineMessages({
  noOutputs: {
    id: 'course.assessment.submission.TestCaseView.noOutputs',
    defaultMessage: 'No outputs',
  },
});

interface OutputStreamProps {
  outputStreamType: 'standardOutput' | 'standardError';
  output?: string;
  title: string;
}

const OutputStream: FC<OutputStreamProps> = (props) => {
  const { outputStreamType, output, title } = props;
  return (
    <Accordion
      defaultExpanded={false}
      disabled={!output}
      disableGutters
      icon={
        !output && (
          <Chip
            label={<FormattedMessage {...translations.noOutputs} />}
            size="small"
            variant="outlined"
          />
        )
      }
      id={outputStreamType}
      title={title}
    >
      <pre className="w-full">{output}</pre>
    </Accordion>
  );
};

export default OutputStream;
