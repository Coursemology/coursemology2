import { useParams } from 'react-router-dom';
import {
  TextResponseData,
  TextResponseFormData,
} from 'types/course/assessment/question/text-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import TextResponseForm from './components/TextResponseForm';
import { fetchEdit, update } from './operations';

const EditTextResponsePage = (): JSX.Element => {
  const { t } = useTranslation();

  const params = useParams();
  const id = parseInt(params?.questionId ?? '', 10) || undefined;
  if (!id) throw new Error(`EditTextResponseForm was loaded with ID: ${id}.`);

  const fetchData = (): Promise<TextResponseFormData<'edit'>> => fetchEdit(id);
  const handleSubmit = (data: TextResponseData): Promise<void> =>
    update(id, data).then(({ redirectUrl }) => {
      toast.success(t(formTranslations.changesSaved));
      window.location.href = redirectUrl;
    });

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        return <TextResponseForm onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

export default EditTextResponsePage;
