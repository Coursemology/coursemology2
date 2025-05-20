import { defineMessage } from 'react-intl';

import CourseAPI from 'api/course';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useSetFooter } from 'lib/components/wrappers/FooterProvider';
import Preload from 'lib/components/wrappers/Preload';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';

import CikgoChatsPage from '../components/CikgoChatsPage';
import CikgoErrorPage from '../components/CikgoErrorPage';

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
      {(url) => (url ? <CikgoChatsPage url={url} /> : <CikgoErrorPage />)}
    </Preload>
  );
};

export const learnHandle: DataHandle = (match) => {
  const courseId = match.params.courseId;
  return {
    getData: async (): Promise<CrumbPath> => {
      const { data } = await CourseAPI.admin.stories.index();
      return {
        activePath: `/courses/${courseId}/learn`,
        content: { title: data.title || 'Learn' },
      };
    },
  };
};

export default Object.assign(LearnPage, { handle: learnHandle });
