import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';

interface Props extends WrappedComponentProps {
  handleOnClick: () => void;
}

const translations = defineMessages({
  uploadFilesTooltip: {
    id: 'course.materials.folders.uploadFilesTooltip',
    defaultMessage: 'Upload',
  },
});

const UploadFilesButton: FC<Props> = (props) => {
  const { intl, handleOnClick } = props;

  return (
    <Tooltip
      title={intl.formatMessage(translations.uploadFilesTooltip)}
      placement="top"
    >
      <IconButton
        id="upload-files-button"
        style={{ padding: 4 }}
        onClick={handleOnClick}
      >
        <UploadIcon />
      </IconButton>
    </Tooltip>
  );
};

export default injectIntl(UploadFilesButton);
