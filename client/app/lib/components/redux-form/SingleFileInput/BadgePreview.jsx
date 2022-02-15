import React from 'react';
import { Avatar } from '@material-ui/core';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import ImagePreview from './ImagePreview';

const styles = {
  avatar: {
    height: '100px',
    width: '100px',
  },
};

function renderBadge(imageSrc) {
  const avatarProps = {};

  if (imageSrc) {
    avatarProps.src = imageSrc;
  } else {
    avatarProps.icon = <InsertDriveFile />;
  }
  return (
    <Avatar {...avatarProps} style={styles.avatar}>
      {avatarProps.icon}
    </Avatar>
  );
}

const BadgePreview = (props) => (
  <ImagePreview render={renderBadge} {...props} />
);

export default BadgePreview;
