import { useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

interface RoomShowPageProps {
  data: any;
}

const translations = defineMessages({
  yourRoom: {
    id: 'course.story.yourRoom',
    defaultMessage: 'Your room',
  },
});

const useStoryParams = (): { storyId: number; roomId: number } => {
  const params = useParams<{ storyId: string; roomId: string }>();
  const storyId = getIdFromUnknown(params.storyId);
  const roomId = getIdFromUnknown(params.roomId);
  if (!storyId || !roomId) throw new Error('Invalid params');

  return { storyId, roomId };
};

const getFrameUrl = (providedRoomId?: string): string => {
  const url = new URL(`http://localhost:3000/chats/${providedRoomId}`);
  url.searchParams.append('origin', window.location.origin);

  return url.toString();
};

const RoomShowPage = ({ data }: RoomShowPageProps): JSX.Element => {
  const { storyId, roomId } = useStoryParams();

  const { t } = useTranslation();

  useEffect(() => {
    const handleCompletionChange = ({ origin, data }: MessageEvent): void => {
      if (origin !== 'http://localhost:3000') return;

      if (data.type === 'completion-change')
        CourseAPI.stories.rooms.sync(storyId, roomId);

      if (data.type === 'authentication-change')
        console.log(data.payload.userId);
    };

    window.addEventListener('message', handleCompletionChange);

    return () => window.removeEventListener('message', handleCompletionChange);
  }, []);

  return (
    <Page className="leading-[0px]" unpadded>
      <iframe
        className="border-0 w-full h-[calc(100vh_-_4rem)]"
        src={getFrameUrl(data.room.providedRoomId)}
        title={data.story.title}
      />
    </Page>
  );
};

const RoomShow = (): JSX.Element => {
  const { storyId, roomId } = useStoryParams();

  return (
    <Preload
      render={<LoadingIndicator />}
      while={() =>
        CourseAPI.stories.rooms
          .fetch(storyId, roomId)
          .then((response) => response.data)
      }
    >
      {(data): JSX.Element => <RoomShowPage data={data} />}
    </Preload>
  );
};

const handle = translations.yourRoom;

export default Object.assign(RoomShow, { handle });
