import React from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';

const styles = {
  bar: {
    // Ensure title bar does not overlap coursemology topbar when page is scrolled.
    // To be removed once top bar has been migrated to MaterialUI.
    zIndex: 0,
  },
};

// Hide menu icon by default. To revert once sidebar has been ported to MaterialUI.
const TitleBar = ({ style, iconElementLeft, ...props }) => (
  <AppBar
    style={Object.assign({}, styles.bar, style)}
    {...props}
    {...{ iconElementLeft }}
    showMenuIconButton={!!iconElementLeft}
  />
);

TitleBar.propTypes = {
  onTouchTap: PropTypes.func,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  iconElementLeft: PropTypes.node,
};

export default TitleBar;
