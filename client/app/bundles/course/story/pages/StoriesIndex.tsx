import { defineMessages } from 'react-intl';
import { Create, Inventory } from '@mui/icons-material';
import { IconButton, Paper, Tooltip, Typography } from '@mui/material';
import moment from 'moment';
import { StoriesIndexData } from 'types/course/story/stories';

import CourseAPI from 'api/course';
import AddButton from 'lib/components/core/buttons/AddButton';
import Expandable from 'lib/components/core/Expandable';
import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PersonalStartEndTime from 'lib/components/extensions/PersonalStartEndTime';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import RoomActionButton from '../component/RoomActionButton';

const translations = defineMessages({
  stories: {
    id: 'course.story.stories',
    defaultMessage: 'Stories',
  },
  newStory: {
    id: 'course.story.newStory',
    defaultMessage: 'New Story',
  },
  rooms: {
    id: 'course.story.show.rooms',
    defaultMessage: 'Rooms',
  },
  editStory: {
    id: 'course.story.edit.editStory',
    defaultMessage: 'Edit Story',
  },
  startsOn: {
    id: 'course.story.startsOn',
    defaultMessage:
      '<span>{tense, select, past {Started} other {Starts}} on </span>{date}',
  },
});

const StoriesIndexPage = ({
  data: { stories, gamified, canManageStories },
}: {
  data: StoriesIndexData;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Page
      actions={
        canManageStories && (
          <Link to="new">
            <AddButton>{t(translations.newStory)}</AddButton>
          </Link>
        )
      }
      title={t(translations.stories)}
    >
      {stories.map((story) => (
        <Paper key={story.id} className="p-5 space-y-2" variant="outlined">
          <Typography>{story.title}</Typography>

          {story.description && (
            <Expandable over={40}>
              <Typography
                color="text.secondary"
                dangerouslySetInnerHTML={{ __html: story.description }}
                variant="body2"
              />
            </Expandable>
          )}

          <Typography
            className="flex space-x-2"
            color="text.secondary"
            variant="body2"
          >
            {t(translations.startsOn, {
              tense: moment(story.startAt.effectiveTime).isBefore(moment())
                ? 'past'
                : 'other',
              date: <PersonalStartEndTime timeInfo={story.startAt} />,
              span: (chunks) => <span>{chunks}</span>,
            })}
          </Typography>

          <div className="flex items-center justify-end space-x-2">
            <Tooltip disableInteractive title={t(translations.editStory)}>
              <Link to={story.id.toString()}>
                <IconButton aria-label={t(translations.editStory)}>
                  <Create />
                </IconButton>
              </Link>
            </Tooltip>

            <Tooltip disableInteractive title={t(translations.rooms)}>
              <Link to="rooms">
                <IconButton aria-label={t(translations.rooms)}>
                  <Inventory />
                </IconButton>
              </Link>
            </Tooltip>

            <RoomActionButton action="start" className="!ml-6" path="rooms/1" />
          </div>
        </Paper>
      ))}
    </Page>
  );
};

const StoriesIndex = (): JSX.Element => (
  <Preload
    render={<LoadingIndicator />}
    while={() =>
      CourseAPI.stories.stories.index().then((response) => response.data)
    }
  >
    {(data): JSX.Element => <StoriesIndexPage data={data} />}
  </Preload>
);

export default Object.assign(StoriesIndex, { handle: translations.stories });
