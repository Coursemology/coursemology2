import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  Download as DownloadIcon,
  Downloading as DownloadingIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import CustomTooltip from 'lib/components/core/CustomTooltip';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import { downloadFolder } from '../../operations';

interface Props extends WrappedComponentProps {
  currFolderId: number;
}

const translations = defineMessages({
  downloadTooltip: {
    id: 'course.material.folders.DownloadFolderButton.downloadTooltip',
    defaultMessage: 'Download Entire Folder',
  },
  downloadFolderErrorMessage: {
    id: 'course.material.folders.DownloadFolderButton.downloadFolderErrorMessage',
    defaultMessage: 'Download has failed. Please try again later.',
  },
  downloading: {
    id: 'course.material.folders.DownloadFolderButton.downloading',
    defaultMessage: 'Downloading...',
  },
});

const DownloadFolderButton: FC<Props> = (props) => {
  const { intl, currFolderId } = props;

  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();

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
                setIsLoading(false);
                toast.error(
                  intl.formatMessage(translations.downloadFolderErrorMessage),
                );
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
