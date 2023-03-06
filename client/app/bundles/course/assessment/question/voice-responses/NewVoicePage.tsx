import { toast } from 'react-toastify';
import {
  VoiceData,
  VoiceFormData,
} from 'types/course/assessment/question/voice-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import { createVoiceQuestion, fetchNewVoiceQuestion } from './operations';
import VoiceForm from './VoiceForm';

const NEW_VOICE_TEMPLATE: VoiceData['question'] = {
  title: '',
  description: '',
  staffOnlyComments: '',
  maximumGrade: '',
  skillIds: [],
};

const NewVoicePage = (): JSX.Element => {
  const { t } = useTranslation();

  const fetchData = (): Promise<VoiceFormData<'new'>> =>
    fetchNewVoiceQuestion();

  const handleSubmit = (data: VoiceData): Promise<void> =>
    createVoiceQuestion(data).then(({ redirectUrl }) => {
      toast.success(t(translations.questionCreated));
      window.location.href = redirectUrl;
    });

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        data.question = NEW_VOICE_TEMPLATE;
        return <VoiceForm onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

export default NewVoicePage;
