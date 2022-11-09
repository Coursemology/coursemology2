import { FC } from 'react';
import { Avatar, Grid, Typography } from '@mui/material';

interface Props {
  label: string;
  imageUrl: string;
  size: 'sm' | 'md' | 'lg';
}

const styles = {
  sm: {
    height: 75,
    width: 75,
  },
  md: {
    height: 100,
    width: 100,
  },
  lg: {
    height: 140,
    width: 140,
  },
  label: {
    paddingTop: '2em',
  },
};

const AvatarWithLabel: FC<Props> = (props: Props) => {
  return (
    <>
      <Grid container={true} justifyContent="center">
        <Avatar
          alt={props.label}
          src={props.imageUrl}
          sx={styles[props.size]}
        />
      </Grid>
      <Typography align="center" variant="body2">
        {props.label}
      </Typography>
    </>
  );
};

export default AvatarWithLabel;
