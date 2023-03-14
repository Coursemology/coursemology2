import { toast } from 'react-toastify';
import {
  TextResponseData,
  TextResponseFormData,
} from 'types/course/assessment/question/text-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';
import { qnFormCommonFieldsInitialValues } from '../components/QuestionFormCommonFields';

import { create, fetchNewTextResponse } from './operations';
import TextResponseForm from './TextResponseForm';

const NEW_TEXT_RESPONSE_TEMPLATE: TextResponseData['question'] =
  qnFormCommonFieldsInitialValues;

const NewTextResponsePage = (): JSX.Element => {
  const { t } = useTranslation();

  const fetchData = (): Promise<TextResponseFormData<'new'>> =>
    fetchNewTextResponse();

  const handleSubmit = (data: TextResponseData): Promise<void> =>
    create(data).then(({ redirectUrl }) => {
      toast.success(t(translations.questionCreated));
      window.location.href = redirectUrl;
    });

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        data.question = NEW_TEXT_RESPONSE_TEMPLATE;
        return <TextResponseForm onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

export default NewTextResponsePage;
