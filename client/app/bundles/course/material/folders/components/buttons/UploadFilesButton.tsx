import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Upload as UploadIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

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
      placement="top"
      title={intl.formatMessage(translations.uploadFilesTooltip)}
    >
      <IconButton
        id="upload-files-button"
        onClick={handleOnClick}
        style={{ padding: 6 }}
      >
        <UploadIcon />
      </IconButton>
    </Tooltip>
  );
};

export default injectIntl(UploadFilesButton);
