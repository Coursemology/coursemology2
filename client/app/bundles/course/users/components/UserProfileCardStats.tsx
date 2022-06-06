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
      variant="outlined"
      className={`${styles.userStatsCard} ${props.className}`}
    >
      <Typography variant="overline">{props.title}</Typography>
      <Typography variant="h5" className={`${props.className}-value`}>
        {props.value}
      </Typography>
    </Paper>
  );
};

export default UserProfileCardStats;
