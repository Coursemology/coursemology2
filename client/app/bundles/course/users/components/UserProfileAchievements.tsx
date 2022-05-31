import { FC } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Avatar, Grid, Typography } from '@mui/material';
import { AchievementMiniEntity } from 'types/course/achievements';
import { getCourseId } from 'lib/helpers/url-helpers';

interface Props {
  achievements: AchievementMiniEntity[];
  intl?: any;
}

const translations = defineMessages({
  noAchievements: {
    id: 'course.users.show.noAchievements',
    defaultMessage: 'No achievements... yet!',
  },
});

const UserProfileAchievements: FC<Props> = ({ achievements, intl }: Props) => {
  const styles = {
    achievementBadge: {
      height: '100px',
      width: '100px',
    },
    achievementMiniEntityContainer: {
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
    },
  };

  return (
    <>
      <Typography variant="h4" component="h2" id="user-profile-achievements">
        Achievements
      </Typography>
      {achievements.length > 0 ? (
        <Grid container spacing={1}>
          {achievements.map((achievement) => (
            <Grid
              item
              id={`achievement_${achievement.id}`}
              key={achievement.id}
              xs={4}
              sm={3}
              lg={2}
            >
              <Grid container sx={styles.achievementMiniEntityContainer}>
                <a
                  href={`/courses/${getCourseId()}/achievements/${
                    achievement.id
                  }`}
                >
                  <Grid container justifyContent="center">
                    <Avatar
                      src={achievement.badge.url}
                      alt={achievement.badge.name}
                      sx={styles.achievementBadge}
                    />
                  </Grid>
                  <Typography variant="body2" align="center">
                    {achievement.title}
                  </Typography>
                </a>
              </Grid>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">
          {intl.formatMessage(translations.noAchievements)}
        </Typography>
      )}
    </>
  );
};

export default injectIntl(UserProfileAchievements);
