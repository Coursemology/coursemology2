import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { AppDispatch } from 'types/store';

import { IconButton, Tooltip } from '@mui/material';
import {
  Download as DownloadIcon,
  Downloading as DownloadingIcon,
} from '@mui/icons-material';

import CustomTooltip from 'lib/components/CustomTooltip';

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
    defaultMessage: 'Download has failed unexpectedly',
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
  return (
    <>
      {isLoading ? (
        <CustomTooltip title={intl.formatMessage(translations.downloading)}>
          <DownloadingIcon style={{ padding: 4 }} />
        </CustomTooltip>
      ) : (
        <>
          <Tooltip
            title={intl.formatMessage(translations.downloadTooltip)}
            placement="top"
          >
            <IconButton
              id="download-folder-button"
              style={{ padding: 6 }}
              onClick={(): void => {
                setIsLoading(true);
                dispatch(downloadFolder(currFolderId))
                  .then(() => {
                    setIsLoading(false);
                  })
                  .catch((error) => {
                    toast.error(
                      `${intl.formatMessage(
                        translations.downloadFolderErrorMessage,
                      )}. Error: ${error}`,
                    );
                    setIsLoading(false);
                  });
              }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </>
  );
};

export default injectIntl(DownloadFolderButton);
