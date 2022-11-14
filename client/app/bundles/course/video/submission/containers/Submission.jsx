import { connect } from 'react-redux';
import { Grid } from '@mui/material';

import NotificationBar, {
  notificationShape,
} from 'lib/components/core/NotificationBar';

import Discussion from './Discussion';
import VideoPlayer from './VideoPlayer';

const propTypes = {
  notification: notificationShape,
};

const Submission = (props) => (
  <>
    <Grid container spacing={2}>
      <Grid item lg={8} xs={12}>
        <VideoPlayer />
      </Grid>
      <Grid className="sticky top-0 h-[calc(95vh-70px)]" item lg={4} xs={12}>
        <Discussion />
      </Grid>
    </Grid>
    <NotificationBar notification={props.notification} />
  </>
);

Submission.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    notification: state.notification,
  };
}

export default connect(mapStateToProps)(Submission);
