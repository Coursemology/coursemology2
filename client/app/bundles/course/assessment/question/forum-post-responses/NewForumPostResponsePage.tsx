import { toast } from 'react-toastify';
import {
  ForumPostResponseData,
  ForumPostResponseFormData,
} from 'types/course/assessment/question/forum-post-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';
import { commonQuestionFieldsInitialValues } from '../components/CommonQuestionFields';

import ForumPostResponseForm from './components/ForumPostResponseForm';
import {
  createForumPostResponse,
  fetchNewForumPostResponse,
} from './operation';

const NEW_FORUM_POST_TEMPLATE: ForumPostResponseData['question'] = {
  ...commonQuestionFieldsInitialValues,
  maxPosts: '1',
  hasTextResponse: false,
};

const NewForumPostResponsePage = (): JSX.Element => {
  const { t } = useTranslation();

  const fetchData = (): Promise<ForumPostResponseFormData<'new'>> =>
    fetchNewForumPostResponse();

  const handleSubmit = (data: ForumPostResponseData): Promise<void> =>
    createForumPostResponse(data).then(({ redirectUrl }) => {
      toast.success(t(translations.questionCreated));
      window.location.href = redirectUrl;
    });

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        data.question = NEW_FORUM_POST_TEMPLATE;
        return <ForumPostResponseForm onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

const handle = translations.newForumPostResponse;

export default Object.assign(NewForumPostResponsePage, { handle });
