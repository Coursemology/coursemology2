import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Grid, Tooltip, Typography } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { AppDispatch, AppState } from 'types/store';
import AvatarWithLabel from 'lib/components/AvatarWithLabel';
import AchievementManagementButtons from '../../components/buttons/AchievementManagementButtons';
import { loadAchievement } from '../../operations';
import {
  getAchievementEntity,
  getAchievementMiniEntity,
} from '../../selectors';

type Props = WrappedComponentProps;

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
  const achievementMiniEntity = useSelector((state: AppState) =>
    getAchievementMiniEntity(state, +achievementId!),
  );
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

  if (!achievementMiniEntity && isLoading) {
    return <LoadingIndicator />;
  }
  if (!achievementMiniEntity) {
    return null;
  }

  const headerToolbars: ReactElement[] = [];

  if (achievementMiniEntity.permissions?.canManage) {
    headerToolbars.push(
      <AchievementManagementButtons
        key={achievementMiniEntity.id}
        achievement={achievementMiniEntity}
        navigateToIndex
      />,
    );
  }

  return (
    <>
      <PageHeader
        title={`Achievement - ${achievementMiniEntity.title}`}
        returnLink={`/courses/${courseId}/achievements/`}
        toolbars={headerToolbars}
      />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        achievement && (
          <Grid container>
            <Grid item xs={12} className="flex justify-center">
              <div className="flex max-w-7xl items-center space-x-8 p-8">
                <Tooltip title={achievement.achievementStatus ?? ''}>
                  <img
                    src={achievement.badge.url}
                    alt={achievement.badge.name}
                    className="h-32"
                  />
                </Tooltip>

                <Typography
                  variant="body1"
                  className="whitespace-normal"
                  dangerouslySetInnerHTML={{
                    __html: achievement.description,
                  }}
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
                  <Grid item key={courseUser.id} xs={4} sm={3} lg={1}>
                    <a href={getCourseUserURL(courseId, courseUser.id)}>
                      <AvatarWithLabel
                        label={courseUser.name}
                        imageUrl={courseUser.imageUrl!}
                        size="sm"
                      />
                    </a>
                  </Grid>
                )}
              </>
            ))}
          </Grid>
        )
      )}
    </>
  );
};

export default injectIntl(AchievementShow);
