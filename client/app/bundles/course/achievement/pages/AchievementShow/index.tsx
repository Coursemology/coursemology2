import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Grid, Tooltip, Typography } from '@mui/material';

import AvatarWithLabel from 'lib/components/core/AvatarWithLabel';
import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import AchievementManagementButtons from '../../components/buttons/AchievementManagementButtons';
import { loadAchievement } from '../../operations';
import {
  getAchievementEntity,
  getAchievementMiniEntity,
} from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'course.achievement.AchievementShow.header',
    defaultMessage: 'Achievement - {title}',
  },
  studentsWithAchievement: {
    id: 'course.achievement.AchievementShow.studentsWithAchievement',
    defaultMessage: 'Students with this achievement',
  },
});

const AchievementShow: FC<Props> = (props) => {
  const { intl } = props;
  const courseId = getCourseId();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const { achievementId } = useParams();
  const achievementMiniEntity = useAppSelector((state) =>
    getAchievementMiniEntity(state, +achievementId!),
  );
  const achievement = useAppSelector((state) =>
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

  return (
    <Page
      actions={
        achievementMiniEntity.permissions?.canManage && (
          <AchievementManagementButtons
            key={achievementMiniEntity.id}
            achievement={achievementMiniEntity}
            navigateToIndex
          />
        )
      }
      backTo={`/courses/${courseId}/achievements/`}
      title={intl.formatMessage(translations.header, {
        title: achievementMiniEntity.title,
      })}
    >
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
                    <Link to={getCourseUserURL(courseId, courseUser.id)}>
                      <AvatarWithLabel
                        imageUrl={courseUser.imageUrl!}
                        label={courseUser.name}
                        size="sm"
                      />
                    </Link>
                  </Grid>
                );
              return null;
            })}
          </Grid>
        )
      )}
    </Page>
  );
};

export default injectIntl(AchievementShow);
