;
import { blue, green, grey, yellow, red } from '@mui/material/colors';

const style = {
  submissionStatusColor: {
    unstarted: { backgroundColor: red[100] },
    attempting: { backgroundColor: yellow[100] },
    submitted: { backgroundColor: grey[100] },
    graded: { backgroundColor: blue[100] },
    published: { backgroundColor: green[100] },
  },
  submissionsHistogram: {
    style: {
      borderRadius: 10,
      display: 'flex',
      overflow: 'hidden',
      textAlign: 'center',
    },
    common: { transition: 'flex .5s, min-width .5s' },
  }
};

export default style;