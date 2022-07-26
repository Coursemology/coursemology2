import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

interface Props extends WrappedComponentProps {
  handleOnClick: () => void;
}

const translations = defineMessages({
  editFolderTooltip: {
    id: 'course.materials.folders.editFolderTooltip',
    defaultMessage: 'Edit Folder',
  },
});

const EditFolderButton: FC<Props> = (props) => {
  const { intl, handleOnClick } = props;

  return (
    <Tooltip
      title={intl.formatMessage(translations.editFolderTooltip)}
      placement="top"
    >
      <IconButton
        id="edit-folder-button"
        style={{ padding: 4 }}
        onClick={handleOnClick}
      >
        <EditIcon />
      </IconButton>
    </Tooltip>
  );
};

export default injectIntl(EditFolderButton);
