import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ForumPostResponseData,
  ForumPostResponseFormData,
} from 'types/course/assessment/question/forum-post-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import ForumPostResponseForm from './components/ForumPostResponseForm';
import {
  fetchEditForumPostResponse,
  updateForumPostResponse,
} from './operation';

const EditForumPostResponsePage = (): JSX.Element => {
  const { t } = useTranslation();

  const params = useParams();
  const id = parseInt(params?.questionId ?? '', 10) || undefined;
  if (!id)
    throw new Error(`EditForumPostResponseForm was loaded with ID: ${id}.`);

  const fetchData = (): Promise<ForumPostResponseFormData<'edit'>> =>
    fetchEditForumPostResponse(id);

  const handleSubmit = (data: ForumPostResponseData): Promise<void> =>
    updateForumPostResponse(id, data).then(({ redirectUrl }) => {
      toast.success(t(formTranslations.changesSaved));
      window.location.href = redirectUrl;
    });

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        return <ForumPostResponseForm onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

export default EditForumPostResponsePage;
