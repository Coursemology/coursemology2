import { FC } from 'react';
import { Download } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { ProgrammingContent } from 'types/course/assessment/submission/answer/programming';
import { downloadFile } from 'utilities/downloadFile';

import { basename } from 'course/assessment/components/FileTreeManager/paths';

interface Props {
  file: ProgrammingContent;
}

const ProgrammingFileDownloadChip: FC<Props> = (props) => {
  const { file } = props;

  // Browsers don't allow `/` in a download's name, so the file downloads under its own name; the
  // chip still shows the whole path.
  const handleDownload = (): void => {
    downloadFile('text/plain', file.content, basename(file.filename));
  };

  return (
    <Chip
      color="primary"
      icon={<Download />}
      label={file.filename}
      onClick={handleDownload}
      size="small"
      variant="outlined"
    />
  );
};

export default ProgrammingFileDownloadChip;
