import { toast } from 'react-toastify';
import {
  VoiceResponseData,
  VoiceResponseFormData,
} from 'types/course/assessment/question/voice-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';
import { qnFormCommonFieldsInitialValues } from '../components/QuestionFormCommonFields';

import { createVoiceQuestion, fetchNewVoiceResponse } from './operations';
import VoiceForm from './VoiceForm';

const NEW_VOICE_TEMPLATE: VoiceResponseData['question'] =
  qnFormCommonFieldsInitialValues;

const NewVoicePage = (): JSX.Element => {
  const { t } = useTranslation();

  const fetchData = (): Promise<VoiceResponseFormData<'new'>> =>
    fetchNewVoiceResponse();

  const handleSubmit = (data: VoiceResponseData): Promise<void> =>
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
