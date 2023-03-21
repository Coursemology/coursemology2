import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  VoiceResponseData,
  VoiceResponseFormData,
} from 'types/course/assessment/question/voice-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import VoiceForm from './components/VoiceForm';
import { fetchEditVoiceResponse, updateVoiceQuestion } from './operations';

const EditVoicePage = (): JSX.Element => {
  const { t } = useTranslation();

  const params = useParams();
  const id = parseInt(params?.questionId ?? '', 10) || undefined;
  if (!id) throw new Error(`EditVoiceForm was loaded with ID: ${id}.`);

  const fetchData = (): Promise<VoiceResponseFormData<'edit'>> =>
    fetchEditVoiceResponse(id);

  const handleSubmit = (data: VoiceResponseData): Promise<void> =>
    updateVoiceQuestion(id, data).then(({ redirectUrl }) => {
      toast.success(t(formTranslations.changesSaved));
      window.location.href = redirectUrl;
    });

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        return <VoiceForm onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

export default EditVoicePage;
