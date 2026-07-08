import { FC } from 'react';
import Chip from '@mui/material/Chip';

import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

const FilePreview: FC<{ file: File | null }> = (props) => {
  const { file } = props;
  const { t } = useTranslation();
  return (
    <div className="file-name">
      {file && <Chip label={file.name} />}
      <div>{t(translations.dropzone)}</div>
    </div>
  );
};

export default FilePreview;
