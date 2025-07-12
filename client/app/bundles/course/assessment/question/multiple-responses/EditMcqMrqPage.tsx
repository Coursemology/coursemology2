import { ElementType } from 'react';
import { useParams } from 'react-router-dom';
import {
  McqMrqData,
  McqMrqFormData,
} from 'types/course/assessment/question/multiple-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import AdaptedForm from './components/AdaptedForm';
import { AdaptedFormProps } from './components/McqMrqForm';
import { fetchEditMrq, updateMcqMrq } from './operations';

const editMcqMrqComponent: Record<
  McqMrqFormData['mcqMrqType'],
  ElementType<AdaptedFormProps<'edit'>>
> = {
  mcq: AdaptedForm.Mcq,
  mrq: AdaptedForm.Mrq,
};

const EditMcqMrqPage = (): JSX.Element => {
  const { t } = useTranslation();

  const params = useParams();
  const id = parseInt(params?.questionId ?? '', 10) || undefined;
  if (!id) throw new Error(`EditMcqMrqForm was loaded with ID: ${id}.`);

  const fetchData = (): Promise<McqMrqFormData<'edit'>> => fetchEditMrq(id);

  const handleSubmit = (data: McqMrqData): Promise<void> =>
    updateMcqMrq(id, data).then(({ redirectUrl }) => {
      toast.success(t(formTranslations.changesSaved));
      window.location.href = redirectUrl;
    });

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        const FormComponent = editMcqMrqComponent[data.mcqMrqType];
        return <FormComponent onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

export default EditMcqMrqPage;
