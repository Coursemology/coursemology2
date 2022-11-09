import { FC } from 'react';
import { Paper, Typography } from '@mui/material';

import styles from './UserProfileCard.scss';

interface Props {
  title: string;
  value: number;
  className: string;
}

const UserProfileCardStats: FC<Props> = (props: Props) => {
  return (
    <Paper
      className={`${styles.userStatsCard} ${props.className}`}
      variant="outlined"
    >
      <Typography variant="overline">{props.title}</Typography>
      <Typography className={`${props.className}-value`} variant="h5">
        {props.value}
      </Typography>
    </Paper>
  );
};

export default UserProfileCardStats;
