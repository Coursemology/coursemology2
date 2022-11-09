import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { CreateNewFolderTwoTone as CreateNewFolderIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

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
      placement="top"
      title={intl.formatMessage(translations.newSubfolderTooltip)}
    >
      <IconButton
        id="new-subfolder-button"
        onClick={handleOnClick}
        style={{ padding: 6 }}
      >
        <CreateNewFolderIcon />
      </IconButton>
    </Tooltip>
  );
};

export default injectIntl(NewSubfolderButton);
