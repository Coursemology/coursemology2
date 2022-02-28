import React from 'react';
import PropTypes from 'prop-types';
import { AppBar, Toolbar, Typography } from '@material-ui/core';

const styles = {
  bar: {
    // Ensure title bar does not overlap coursemology topbar when page is scrolled.
    // To be removed once top bar has been migrated to MaterialUI.
    zIndex: 0,
    position: 'static',
  },
  leftIcon: {
    marginLeft: -16,
    marginRight: 8,
  },
  text: {
    flexGrow: 1,
  },
};

// Hide menu icon by default. To revert once sidebar has been ported to MaterialUI.
const TitleBar = ({
  style,
  iconElementLeft,
  iconElementRight,
  title,
  ...props
}) => (
  <div style={{ flexGrow: 1 }}>
    <AppBar style={{ ...styles.bar, ...style }} {...props}>
      <Toolbar>
        <div style={styles.leftIcon}>{iconElementLeft}</div>
        <Typography variant="h5" color="inherit" style={styles.text}>
          {title}
        </Typography>
        {iconElementRight}
      </Toolbar>
    </AppBar>
  </div>
);

TitleBar.propTypes = {
  onClick: PropTypes.func,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  iconElementLeft: PropTypes.node,
  iconElementRight: PropTypes.node,
  title: PropTypes.node,
};

export default TitleBar;
