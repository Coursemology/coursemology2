import { Slide, Typography } from '@mui/material';

const LoadingEllipsis = (): JSX.Element => (
  <Slide direction="up" in>
    <span className="flex">
      <Typography className="bouncing-dot">.</Typography>
      <Typography className="bouncing-dot">.</Typography>
      <Typography className="bouncing-dot">.</Typography>
    </span>
  </Slide>
);

export default LoadingEllipsis;
