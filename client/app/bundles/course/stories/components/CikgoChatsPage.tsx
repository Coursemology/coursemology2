import { useEffect } from 'react';

import CourseAPI from 'api/course';
import Page from 'lib/components/core/layouts/Page';

const getCikgoEmbedURL = (rawURL: string): string => {
  const url = new URL(rawURL);
  url.searchParams.set('embedOrigin', window.location.origin);
  return url.toString();
};

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

  return (
    <Page className="leading-[0px]" unpadded>
      <iframe
        className="border-none w-full h-[calc(100vh_-_4rem)] flex"
        src={getCikgoEmbedURL(url)}
        title="embed"
      />
    </Page>
  );
};

export default CikgoChatsPage;
