import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Grid, Tooltip, Typography } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';

import AvatarWithLabel from 'lib/components/core/AvatarWithLabel';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

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
        returnLink={`/courses/${courseId}/achievements/`}
        title={`Achievement - ${achievementMiniEntity.title}`}
        toolbars={headerToolbars}
      />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        achievement && (
          <Grid container>
            <Grid className="flex justify-center" item xs={12}>
              <div className="flex max-w-7xl items-center space-x-8 p-8">
                <Tooltip title={achievement.achievementStatus ?? ''}>
                  <img
                    alt={achievement.badge.name}
                    className="h-32"
                    src={achievement.badge.url}
                  />
                </Tooltip>

                <Typography
                  className="whitespace-normal"
                  dangerouslySetInnerHTML={{
                    __html: achievement.description,
                  }}
                  variant="body1"
                />
              </div>
            </Grid>

            <Grid display="flex" item justifyContent="center" xs={12}>
              <Typography variant="h5">
                {intl.formatMessage(translations.studentsWithAchievement)}
              </Typography>
            </Grid>

            {achievement.achievementUsers.map((courseUser) => {
              if (courseUser.obtainedAt !== null)
                return (
                  <Grid key={courseUser.id} item lg={1} sm={3} xs={4}>
                    <a href={getCourseUserURL(courseId, courseUser.id)}>
                      <AvatarWithLabel
                        imageUrl={courseUser.imageUrl!}
                        label={courseUser.name}
                        size="sm"
                      />
                    </a>
                  </Grid>
                );
              return null;
            })}
          </Grid>
        )
      )}
    </>
  );
};

export default injectIntl(AchievementShow);
