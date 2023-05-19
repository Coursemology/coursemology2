import { Grid } from '@mui/material';

import Discussion from './Discussion';
import VideoPlayer from './VideoPlayer';

const Submission = () => (
  <Grid container spacing={2}>
    <Grid item lg={8} xs={12}>
      <VideoPlayer />
    </Grid>

    <Grid className="sticky top-0 h-[calc(95vh-70px)]" item lg={4} xs={12}>
      <Discussion />
    </Grid>
  </Grid>
);

export default Submission;
