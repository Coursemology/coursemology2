import { AppBar, Toolbar, Typography } from '@mui/material';
import PropTypes from 'prop-types';

// Hide menu icon by default. To revert once sidebar has been ported to MaterialUI.
const TitleBar = ({ iconElementLeft, iconElementRight, title, ...props }) => (
  <div className="grow">
    <AppBar
      {...props}
      className="static z-0 -mx-6 mb-0 w-screen sm:mx-0 sm:w-full sm:rounded-md"
      elevation={0}
    >
      <Toolbar>
        <div className="-ml-4 mr-2">{iconElementLeft}</div>
        <Typography className="grow" color="inherit" variant="h5">
          <label className="m-0 align-middle font-normal" title={title}>
            <div className="line-clamp-2">{title}</div>
          </label>
        </Typography>
        {iconElementRight}
      </Toolbar>
    </AppBar>
  </div>
);

TitleBar.propTypes = {
  onClick: PropTypes.func,
  iconElementLeft: PropTypes.node,
  iconElementRight: PropTypes.node,
  title: PropTypes.node,
};

export default TitleBar;
