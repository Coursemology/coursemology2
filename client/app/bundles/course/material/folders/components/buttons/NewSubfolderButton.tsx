import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { CreateNewFolderTwoTone as CreateNewFolderIcon } from '@mui/icons-material';

interface Props extends WrappedComponentProps {
  handleOnClick: () => void;
}

const translations = defineMessages({
  newSubfolderTooltip: {
    id: 'course.materials.folders.newSubfolderTooltip',
    defaultMessage: 'New Subfolder',
  },
});

const NewSubfolderButton: FC<Props> = (props) => {
  const { intl, handleOnClick } = props;

  return (
    <Tooltip
      title={intl.formatMessage(translations.newSubfolderTooltip)}
      placement="top"
    >
      <IconButton
        id="new-subfolder-button"
        style={{ padding: 4 }}
        onClick={handleOnClick}
      >
        <CreateNewFolderIcon />
      </IconButton>
    </Tooltip>
  );
};

export default injectIntl(NewSubfolderButton);
