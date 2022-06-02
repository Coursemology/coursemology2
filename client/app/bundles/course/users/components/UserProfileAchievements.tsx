import { FC } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Avatar, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
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
      height: 100,
      width: 100,
    },
  };

  return (
    <>
      <Typography variant="h4" component="h2" id="user-profile-achievements">
        Achievements
      </Typography>
      {achievements.length > 0 ? (
        <Grid container>
          {achievements
            .concat(achievements)
            .concat(achievements)
            .concat(achievements)
            .concat(achievements)
            .map((achievement) => (
              <Grid
                item
                id={`achievement_${achievement.id}`}
                key={achievement.id}
                xs={4}
                sm={3}
                md={3}
                lg={2}
              >
                <Link
                  key={achievement.id}
                  to={`/courses/${getCourseId()}/achievements/${
                    achievement.id
                  }`}
                >
                  <Grid
                    container
                    direction="column"
                    spacing={1}
                    alignItems="center"
                  >
                    <Grid container item xs={3} justifyContent="center">
                      <Avatar
                        src={achievement.badge.url}
                        alt={achievement.badge.name}
                        sx={styles.achievementBadge}
                      />
                    </Grid>
                    <Grid item xs>
                      <Typography variant="body1">
                        {achievement.title}
                      </Typography>
                    </Grid>
                  </Grid>
                </Link>
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
