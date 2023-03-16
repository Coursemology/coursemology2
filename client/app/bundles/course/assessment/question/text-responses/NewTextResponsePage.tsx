import { ElementType } from 'react';
import { useSearchParams } from 'react-router-dom';
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

import { create, fetchNewFileUpload, fetchNewTextResponse } from './operations';
import TextResponseForm, { TextResponseFormProps } from './TextResponseForm';

const NEW_TEXT_RESPONSE_TEMPLATE: TextResponseData['question'] =
  qnFormCommonFieldsInitialValues;

type Fetcher = () => Promise<TextResponseFormData<'new'>>;
type Form = ElementType<TextResponseFormProps<'new'>>;

type Adapter = [Fetcher, Form];

const newTextResponseAdapter: Record<
  TextResponseFormData['questionType'],
  Adapter
> = {
  file_upload: [fetchNewFileUpload, TextResponseForm],
  text_response: [fetchNewTextResponse, TextResponseForm],
};

const NewTextResponsePage = (): JSX.Element => {
  const { t } = useTranslation();

  const [params] = useSearchParams();
  const isFileUpload = params.get('file_upload') === 'true';

  const type: TextResponseFormData['questionType'] = isFileUpload
    ? 'file_upload'
    : 'text_response';

  const [fetchData, FormComponent] = newTextResponseAdapter[type];

  const handleSubmit = async (data: TextResponseData): Promise<void> => {
    if (type === 'file_upload') {
      data.question.allowAttachment = true;
      data.question.hideText = true;
    }
    const { redirectUrl } = await create(data);
    toast.success(t(translations.questionCreated));
    window.location.href = redirectUrl;
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        data.question = NEW_TEXT_RESPONSE_TEMPLATE;
        return <FormComponent onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

export default NewTextResponsePage;
