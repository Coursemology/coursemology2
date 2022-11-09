import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { scroller } from 'react-scroll';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Link,
  Typography,
} from '@mui/material';
import { CourseUserEntity } from 'types/course/courseUsers';

import { COURSE_USER_ROLES } from 'lib/constants/sharedConstants';

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
          <Typography component="span" variant="body1">
            {user.email} &mdash;{' '}
          </Typography>
          <Link
            href={user.manageEmailSubscriptionUrl}
            underline="hover"
            variant="body1"
          >
            {intl.formatMessage(translations.manageEmailSubscription)}
          </Link>
        </Box>
      );
    }
    return (
      <Typography component="span" variant="body1">
        {user.email}
      </Typography>
    );
  };

  const renderUserStats = (): JSX.Element | null => {
    return (
      <Grid
        className={styles.userStatsContainer}
        container={true}
        direction="row"
        item={true}
        justifyContent={{ xs: 'center', sm: 'start' }}
      >
        {user.level !== undefined && (
          <UserProfileCardStats
            className="user-level-stat"
            title={intl.formatMessage(translations.level)}
            value={user.level}
          />
        )}
        {user.exp !== undefined && (
          <RouterLink to={user.experiencePointsRecordsUrl ?? ''}>
            <UserProfileCardStats
              className="user-exp-stat"
              title={intl.formatMessage(translations.exp)}
              value={user.exp}
            />
          </RouterLink>
        )}
        {user.achievements !== undefined && (
          <a
            href="#user-profile-achievements"
            onClick={(e): void => handleScrollToAchievements(e)}
          >
            <UserProfileCardStats
              className="user-achievements-stat"
              title={intl.formatMessage(translations.achievements)}
              value={user.achievements.length}
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
          container={true}
          direction="row"
          flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
          spacing={{ xs: 1, sm: 4 }}
        >
          <Grid
            alignItems="center"
            container={true}
            direction="column"
            item={true}
            sm="auto"
            xs={12}
          >
            <Avatar className={styles.courseUserImage} src={user.imageUrl} />
          </Grid>
          <Grid
            alignItems={{ xs: 'center', sm: 'start' }}
            container={true}
            direction="column"
            item={true}
          >
            <Typography variant="h4">{user.name}</Typography>
            <Typography variant="body1">
              <strong>{COURSE_USER_ROLES[user.role]}</strong>
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
