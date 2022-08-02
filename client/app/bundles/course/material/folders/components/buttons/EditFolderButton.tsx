import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import EditButton from 'lib/components/buttons/EditButton';

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
    <EditButton
      id="edit-folder-button"
      style={{ padding: 6 }}
      color="default"
      onClick={handleOnClick}
      tooltip={intl.formatMessage(translations.editFolderTooltip)}
    />
  );
};

export default injectIntl(EditFolderButton);
