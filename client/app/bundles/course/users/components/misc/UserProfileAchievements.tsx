import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Grid, Typography } from '@mui/material';
import { AchievementMiniEntity } from 'types/course/achievements';

import AvatarWithLabel from 'lib/components/core/AvatarWithLabel';
import { getAchievementURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

interface Props extends WrappedComponentProps {
  achievements: AchievementMiniEntity[];
}

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

const translations = defineMessages({
  achivementsHeader: {
    id: 'course.users.show.achievementsHeader',
    defaultMessage: 'Achievements',
  },
  noAchievements: {
    id: 'course.users.show.noAchievements',
    defaultMessage: 'No achievements... yet!',
  },
});

const UserProfileAchievements: FC<Props> = ({ achievements, intl }: Props) => {
  return (
    <>
      <Typography component="h2" id="user-profile-achievements" variant="h4">
        {intl.formatMessage(translations.achivementsHeader)}
      </Typography>
      {achievements.length > 0 ? (
        <Grid container spacing={1}>
          {achievements.map((achievement) => (
            <Grid
              key={achievement.id}
              id={`achievement_${achievement.id}`}
              item
              lg={2}
              sm={3}
              xs={4}
            >
              <Grid container sx={styles.achievementMiniEntityContainer}>
                <a href={getAchievementURL(getCourseId(), achievement.id)}>
                  <AvatarWithLabel
                    imageUrl={achievement.badge.url}
                    label={achievement.title}
                    size="md"
                  />
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
