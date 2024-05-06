import { defineMessage } from 'react-intl';

import CourseAPI from 'api/course';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useSetFooter } from 'lib/components/wrappers/FooterProvider';
import Preload from 'lib/components/wrappers/Preload';

import CikgoChatsPage from '../components/CikgoChatsPage';
import CikgoNoChatsPage from '../components/CikgoNoChatsPage';

const LearnPage = (): JSX.Element => {
  useSetFooter(false);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={async () => {
        const response = await CourseAPI.stories.learn();
        return response.data.redirectUrl;
      }}
    >
      {(url) => (url ? <CikgoChatsPage url={url} /> : <CikgoNoChatsPage />)}
    </Preload>
  );
};

export default Object.assign(LearnPage, {
  handle: defineMessage({
    id: 'course.stories.pages.LearnPage',
    defaultMessage: 'Learn',
  }),
});
