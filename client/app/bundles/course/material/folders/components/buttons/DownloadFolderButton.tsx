import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Download as DownloadIcon,
  Downloading as DownloadingIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { AppDispatch } from 'types/store';

import CustomTooltip from 'lib/components/core/CustomTooltip';

import { downloadFolder } from '../../operations';

interface Props extends WrappedComponentProps {
  currFolderId: number;
}

const translations = defineMessages({
  downloadTooltip: {
    id: 'course.materials.folders.downloadTooltip',
    defaultMessage: 'Download Entire Folder',
  },
  downloadFolderErrorMessage: {
    id: 'course.materials.folders.downloadFolderErrorMessage',
    defaultMessage: 'Download has failed. Please try again later.',
  },
  downloading: {
    id: 'course.materials.folders.downloading',
    defaultMessage: 'Downloading...',
  },
});

const DownloadFolderButton: FC<Props> = (props) => {
  const { intl, currFolderId } = props;

  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  if (isLoading) {
    return (
      <CustomTooltip title={intl.formatMessage(translations.downloading)}>
        <DownloadingIcon style={{ padding: 4 }} />
      </CustomTooltip>
    );
  }

  return (
    <Tooltip
      placement="top"
      title={intl.formatMessage(translations.downloadTooltip)}
    >
      <IconButton
        id="download-folder-button"
        onClick={(): void => {
          setIsLoading(true);
          dispatch(
            downloadFolder(
              currFolderId,
              () => setIsLoading(false),
              () => {
                toast.error(
                  intl.formatMessage(translations.downloadFolderErrorMessage),
                );
                setIsLoading(false);
              },
            ),
          );
        }}
        style={{ padding: 6 }}
      >
        <DownloadIcon />
      </IconButton>
    </Tooltip>
  );
};

export default injectIntl(DownloadFolderButton);
