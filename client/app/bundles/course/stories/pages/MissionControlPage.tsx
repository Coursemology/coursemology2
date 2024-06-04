import { defineMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import CourseAPI from 'api/course';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useSetFooter } from 'lib/components/wrappers/FooterProvider';
import Preload from 'lib/components/wrappers/Preload';

import CikgoErrorPage from '../components/CikgoErrorPage';
import CikgoFramePage from '../components/CikgoFramePage';

const MissionControlPage = (): JSX.Element => {
  useSetFooter(false);

  const [searchParams] = useSearchParams();
  const courseUserId = searchParams.get('for') ?? undefined;

  return (
    <Preload
      render={<LoadingIndicator />}
      while={async () => {
        const response = await CourseAPI.stories.missionControl(courseUserId);
        return response.data.redirectUrl;
      }}
    >
      {(url) => (url ? <CikgoFramePage url={url} /> : <CikgoErrorPage />)}
    </Preload>
  );
};

export default Object.assign(MissionControlPage, {
  handle: defineMessage({
    id: 'course.stories.pages.MissionControlPage',
    defaultMessage: 'Mission Control',
  }),
});
