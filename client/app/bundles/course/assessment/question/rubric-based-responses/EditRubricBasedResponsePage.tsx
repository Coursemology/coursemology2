import { useParams } from 'react-router-dom';
import {
  RubricBasedResponseData,
  RubricBasedResponseFormData,
} from 'types/course/assessment/question/rubric-based-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import RubricBasedResponseForm from './components/RubricBasedResponseForm';
import { fetchEditRubricBasedResponse, update } from './operations';

const EditRubricBasedResponsePage = (): JSX.Element => {
  const { t } = useTranslation();

  const params = useParams();
  const id = parseInt(params?.questionId ?? '', 10) || undefined;

  if (!id)
    throw new Error(`EditRubricBasedResponsePage was loaded with ID: ${id}.`);

  const fetchData = (): Promise<RubricBasedResponseFormData> =>
    fetchEditRubricBasedResponse(id);

  const handleSubmit = (data: RubricBasedResponseData): Promise<void> =>
    update(id, data).then(({ redirectUrl }) => {
      toast.success(t(formTranslations.changesSaved));
      window.location.href = redirectUrl;
    });

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        return <RubricBasedResponseForm onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

export default EditRubricBasedResponsePage;
