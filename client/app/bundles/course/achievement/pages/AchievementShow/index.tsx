import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Grid, Tooltip, Typography } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { AppDispatch, AppState } from 'types/store';
import AchievementManagementButtons from '../../components/buttons/AchievementManagementButtons';
import { loadAchievement } from '../../operations';
import { getAchievementEntity } from '../../selectors';

interface Props {
  intl?: any;
}

const styles = {
  badge: {
    maxHeight: 75,
    maxWidth: 75,
    marginRight: 16,
  },
  courseUserImage: {
    maxHeight: 75,
    maxWidth: 75,
  },
  description: {
    maxWidth: 1200,
  },
};

const translations = defineMessages({
  studentsWithAchievement: {
    id: 'course.achievement.show.studentsWithAchievement',
    defaultMessage: 'Students with this achievement',
  },
});

const AchievementShow: FC<Props> = (props) => {
  const { intl } = props;
  const courseId = getCourseId();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { achievementId } = useParams();
  const achievement = useSelector((state: AppState) =>
    getAchievementEntity(state, +achievementId!),
  );

  useEffect(() => {
    if (achievementId) {
      dispatch(loadAchievement(+achievementId)).finally(() =>
        setIsLoading(false),
      );
    }
  }, [dispatch, achievementId]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!achievement) {
    return null;
  }

  const headerToolbars: ReactElement[] = [];

  if (achievement.permissions?.canManage) {
    headerToolbars.push(
      <AchievementManagementButtons
        key={achievement.id}
        achievement={achievement}
        navigateToIndex
      />,
    );
  }

  return (
    <>
      <PageHeader
        title={`Achievement - ${achievement.title}`}
        returnLink={`/courses/${courseId}/achievements/`}
        toolbars={headerToolbars}
      />
      <Grid container>
        <Grid
          item
          xs={12}
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ marginBottom: 8 }}
        >
          <Tooltip
            title={
              achievement.achievementStatus ? achievement.achievementStatus : ''
            }
          >
            <img
              src={achievement.badge.url}
              alt={achievement.badge.name}
              style={styles.badge}
            />
          </Tooltip>
          <div style={styles.description}>
            <p
              style={{ whiteSpace: 'normal' }}
              dangerouslySetInnerHTML={{ __html: achievement.description }}
            />
          </div>
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="center">
          <Typography variant="h5">
            {intl.formatMessage(translations.studentsWithAchievement)}
          </Typography>
        </Grid>
        {achievement.achievementUsers.map((courseUser) => (
          <>
            {courseUser.obtainedAt !== null && (
              <Grid item key={courseUser.id} xs={1} justifyContent="center">
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={courseUser.imageUrl}
                    alt={courseUser.name}
                    style={styles.courseUserImage}
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <a href={getCourseUserURL(courseId, courseUser.id)}>
                    {courseUser.name}
                  </a>
                </div>
              </Grid>
            )}
          </>
        ))}
      </Grid>
    </>
  );
};

export default injectIntl(AchievementShow);
