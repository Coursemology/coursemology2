import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Link,
  Typography,
} from '@mui/material';
import { scroller } from 'react-scroll';
import { CourseUserEntity } from 'types/course/course_users';
import UserProfileCardStats from './UserProfileCardStats';
import styles from './UserProfileCard.scss';

interface Props extends WrappedComponentProps {
  user: CourseUserEntity;
}

const translations = defineMessages({
  manageEmailSubscription: {
    id: 'course.users.show.manageEmailSubscription',
    defaultMessage: 'Manage email subscriptions',
  },
  level: {
    id: 'course.users.show.level',
    defaultMessage: 'Level',
  },
  exp: {
    id: 'course.users.show.exp',
    defaultMessage: 'EXP',
  },
  achievements: {
    id: 'course.users.show.achievements',
    defaultMessage: 'Achievements',
  },
});

const UserProfileCard: FC<Props> = ({ user, intl }) => {
  const handleScrollToAchievements = (e: React.MouseEvent): void => {
    e.preventDefault();
    scroller.scrollTo('user-profile-achievements', {
      smooth: true,
      duration: 200,
      offset: -50,
    });
  };

  const renderManageEmail = (): JSX.Element => {
    if (user.manageEmailSubscriptionUrl) {
      return (
        <Box>
          <Typography variant="body1" component="span">
            {user.email} &mdash;{' '}
          </Typography>
          <Link
            href={user.manageEmailSubscriptionUrl}
            variant="body1"
            underline="hover"
          >
            {intl.formatMessage(translations.manageEmailSubscription)}
          </Link>
        </Box>
      );
    }
    return (
      <Typography variant="body1" component="span">
        {user.email}
      </Typography>
    );
  };

  const renderUserStats = (): JSX.Element | null => {
    return (
      <Grid
        item
        container
        direction="row"
        justifyContent={{ xs: 'center', sm: 'start' }}
        className={styles.userStatsContainer}
      >
        {user.level !== undefined && (
          <UserProfileCardStats
            title={intl.formatMessage(translations.level)}
            value={user.level}
            className="user-level-stat"
          />
        )}
        {user.exp !== undefined && (
          <a href={user.experiencePointsRecordsUrl}>
            <UserProfileCardStats
              title={intl.formatMessage(translations.exp)}
              value={user.exp}
              className="user-exp-stat"
            />
          </a>
        )}
        {user.achievements !== undefined && (
          <a
            href="#user-profile-achievements"
            onClick={(e): void => handleScrollToAchievements(e)}
          >
            <UserProfileCardStats
              title={intl.formatMessage(translations.achievements)}
              value={user.achievements.length}
              className="user-achievements-stat"
            />
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
            <Avatar src={user.imageUrl} className={styles.courseUserImage} />
          </Grid>
          <Grid
            item
            container
            direction="column"
            alignItems={{ xs: 'center', sm: 'start' }}
          >
            <Typography variant="h4">{user.name}</Typography>
            <Typography variant="body1">
              <strong>{user.role}</strong>
            </Typography>
            {renderManageEmail()}
            {renderUserStats()}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default injectIntl(UserProfileCard);
