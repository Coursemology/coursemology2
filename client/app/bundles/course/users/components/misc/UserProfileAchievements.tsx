import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Grid, Typography } from '@mui/material';
import { AchievementMiniEntity } from 'types/course/achievements';
import { getCourseId } from 'lib/helpers/url-helpers';
import { getAchievementURL } from 'lib/helpers/url-builders';
import AvatarWithLabel from 'lib/components/AvatarWithLabel';

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
      <Typography variant="h4" component="h2" id="user-profile-achievements">
        {intl.formatMessage(translations.achivementsHeader)}
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
                <a href={getAchievementURL(getCourseId(), achievement.id)}>
                  <AvatarWithLabel
                    label={achievement.title}
                    imageUrl={achievement.badge.url}
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
