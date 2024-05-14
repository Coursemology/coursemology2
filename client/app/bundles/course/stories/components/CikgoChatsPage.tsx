import { useEffect } from 'react';

import CourseAPI from 'api/course';

import CikgoFramePage from './CikgoFramePage';

const CikgoChatsPage = ({ url }: { url: string }): JSX.Element => {
  useEffect(() => {
    const handleMessage = ({ origin, data }: MessageEvent): void => {
      if (origin !== new URL(url).origin) return;

      if (data.type === 'openThreadsCountChange') {
        CourseAPI.stories.learn();
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return <CikgoFramePage url={url} />;
};

export default CikgoChatsPage;
