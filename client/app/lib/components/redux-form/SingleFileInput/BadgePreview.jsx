import React from 'react';
import InsertDriveFileIcon from 'material-ui/svg-icons/editor/insert-drive-file';
import Avatar from 'material-ui/Avatar';
import ImagePreview from './ImagePreview';

function renderBadge(imageSrc) {
  const avatarProps = { size: 100 };

  if (imageSrc) {
    avatarProps.src = imageSrc;
  } else {
    avatarProps.icon = <InsertDriveFileIcon />;
  }
  return <Avatar {...avatarProps} />;
}

const BadgePreview = (props) => (
  <ImagePreview render={renderBadge} {...props} />
);

export default BadgePreview;
