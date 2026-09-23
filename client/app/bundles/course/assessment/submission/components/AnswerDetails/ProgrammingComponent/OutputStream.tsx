import { FC } from 'react';
import { Chip } from '@mui/material';

import Accordion from 'lib/components/core/layouts/Accordion';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface Props {
  outputStreamType: 'standardOutput' | 'standardError';
  output?: string;
  /** Renders the "students can't see output streams" subtitle. */
  staffOnly?: boolean;
}

const OutputStream: FC<Props> = (props) => {
  const { outputStreamType, output, staffOnly } = props;
  const { t } = useTranslation();

  return (
    <Accordion
      defaultExpanded={false}
      disabled={!output}
      disableGutters
      icon={
        !output && (
          <Chip
            label={t(translations.noOutputs)}
            size="small"
            variant="outlined"
          />
        )
      }
      id={outputStreamType}
      subtitle={staffOnly ? t(translations.staffOnlyOutputStream) : undefined}
      title={t(translations[outputStreamType])}
    >
      <pre className="w-full">{output}</pre>
    </Accordion>
  );
};

export default OutputStream;
