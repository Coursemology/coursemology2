import PropTypes from 'prop-types';
import { FC } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Icon,
  Paper,
  Typography,
} from '@mui/material';
import { scroller } from 'react-scroll';
import { blue, green, orange } from '@mui/material/colors';

interface Props {
  name: string;
  imageUrl: string;
  email: string;
  role: string;
  exp?: number;
  level?: number;
  experiencePointsRecordsUrl?: string;
  manageEmailSubscriptionUrl?: string;
  achievementCount?: number;
}

const UserProfileCard: FC<Props> = ({
  name,
  imageUrl,
  email,
  role,
  exp,
  level,
  experiencePointsRecordsUrl,
  manageEmailSubscriptionUrl,
  achievementCount,
}: Props) => {
  const styles = {
    courseUserImage: {
      height: 140,
      width: 140,
    },
    emailStyle: {
      span: {
        display: 'none',
      },
      '&:hover span': {
        display: 'initial',
      },
    },
    icon: {
      fontSize: 12,
      padding: '0px',
    },
    statsContainer: {
      '& a': {
        textDecoration: 'none',
      },
      '& .user-stats-card': {
        margin: '4px 4px 4px 0px',
        padding: '12px',
        minWidth: '100px',
        maxWidth: '144px',
        transition: 'background-color 0.5s, color 0.5s',
      },
      '& :nth-child(2n):hover .user-stats-card,& .user-stats-card:nth-child(2n):hover':
        {
          backgroundColor: blue[400],
        },
      '& :nth-child(3n):hover .user-stats-card,& .user-stats-card:nth-child(3n):hover':
        {
          backgroundColor: orange[400],
        },
      '& .user-stats-card:hover': {
        backgroundColor: green[400],
        color: 'white',
      },
    },
  };

  function UserStatsCard(props): JSX.Element {
    return (
      <Paper variant="outlined" className="user-stats-card">
        <Typography variant="overline">{props.title}</Typography>
        <Typography variant="h5">{props.value}</Typography>
      </Paper>
    );
  }

  UserStatsCard.propTypes = {
    title: PropTypes.string,
    value: PropTypes.number,
  };

  function handleScrollToAchievements(e: React.MouseEvent): void {
    e.preventDefault();
    scroller.scrollTo('user-profile-achievements', {
      smooth: true,
      duration: 200,
      offset: -50,
    });
  }

  const renderManageEmail = (): JSX.Element => {
    if (manageEmailSubscriptionUrl) {
      return (
        <Box sx={styles.emailStyle}>
          <a href={manageEmailSubscriptionUrl}>
            {email}{' '}
            <Icon
              className="fa fa-wrench manage-email-icon"
              style={styles.icon}
            />
          </a>
        </Box>
      );
    }
    return <>{email}</>;
  };

  const renderUserStats = (): JSX.Element | null => {
    if (role !== 'Student') {
      return null;
    }
    return (
      <Grid
        item
        container
        direction="row"
        justifyContent={{ xs: 'center', sm: 'start' }}
        sx={styles.statsContainer}
      >
        {level !== undefined && <UserStatsCard title="Level" value={level} />}
        {exp !== undefined && (
          <a href={experiencePointsRecordsUrl}>
            <UserStatsCard title="EXP" value={exp} />
          </a>
        )}
        {achievementCount !== undefined && (
          <a
            href="#user-profile-achievements"
            onClick={(e): void => handleScrollToAchievements(e)}
          >
            <UserStatsCard title="Achievements" value={achievementCount} />
          </a>
        )}
      </Grid>
    );
  };

  return (
    <Card>
      <CardContent>
        <Grid
          container
          direction="row"
          flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
          spacing={{ xs: 1, sm: 4 }}
        >
          <Grid
            item
            container
            direction="column"
            alignItems="center"
            xs={12}
            sm="auto"
          >
            <Avatar src={imageUrl} sx={styles.courseUserImage} />
          </Grid>
          <Grid
            item
            container
            direction="column"
            alignItems={{ xs: 'center', sm: 'start' }}
          >
            <Typography variant="h4">{name}</Typography>
            <Typography variant="body1">
              <strong>{role}</strong>
            </Typography>
            <Typography variant="body1">{renderManageEmail()}</Typography>

            {renderUserStats()}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
