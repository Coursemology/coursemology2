import { FC } from 'react';
import { ContentCopy } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { ProgrammingContent } from 'types/course/assessment/submission/answer/programming';

import toast from 'lib/hooks/toast';

interface Props {
  file: ProgrammingContent;
}

const CopyCodeButton: FC<Props> = (props) => {
  const { file } = props;

  const handleCopy = (): void => {
    navigator.clipboard.writeText(file.content).then(() => {
      toast.success('Copied to clipboard');
    });
  };

  return (
    <Chip
      className="copy-code-button"
      icon={<ContentCopy />}
      label="Copy"
      onClick={handleCopy}
      size="small"
      variant="outlined"
    />
  );
};

export default CopyCodeButton;
