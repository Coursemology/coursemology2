import { FC } from 'react';
import { Download } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { ProgrammingContent } from 'types/course/assessment/submission/answer/programming';
import { downloadFile } from 'utilities/downloadFile';

interface Props {
  file: ProgrammingContent;
}

const ProgrammingFileDownloadChip: FC<Props> = (props) => {
  const { file } = props;
  const filename = file.filename;

  const handleDownload = (): void => {
    downloadFile('text/plain', file.content, filename);
  };

  return (
    <Chip
      color="primary"
      icon={<Download />}
      label={filename}
      onClick={handleDownload}
      size="small"
      variant="outlined"
    />
  );
};

export default ProgrammingFileDownloadChip;
