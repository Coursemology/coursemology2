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
import { commonQuestionFieldsInitialValues } from '../components/CommonQuestionFields';

import TextResponseForm, {
  TextResponseFormProps,
} from './components/TextResponseForm';
import { create, fetchNewFileUpload, fetchNewTextResponse } from './operations';

const NEW_TEXT_RESPONSE_VALUE = {
  ...commonQuestionFieldsInitialValues,
  hideText: false,
  allowAttachment: false,
};

const NEW_FILE_UPLOAD_RESPONSE_VALUE = {
  ...commonQuestionFieldsInitialValues,
  hideText: true,
  allowAttachment: true,
};

type Fetcher = () => Promise<TextResponseFormData<'new'>>;
type Form = ElementType<TextResponseFormProps<'new'>>;
type FormInitialValue = TextResponseData['question'];

type Adapter = [Fetcher, Form, FormInitialValue];

const newTextResponseAdapter: Record<
  TextResponseFormData['questionType'],
  Adapter
> = {
  file_upload: [
    fetchNewFileUpload,
    TextResponseForm,
    NEW_FILE_UPLOAD_RESPONSE_VALUE,
  ],
  text_response: [
    fetchNewTextResponse,
    TextResponseForm,
    NEW_TEXT_RESPONSE_VALUE,
  ],
};

const NewTextResponsePage = (): JSX.Element => {
  const { t } = useTranslation();

  const [params] = useSearchParams();
  const isFileUpload = params.get('file_upload') === 'true';

  const type: TextResponseFormData['questionType'] = isFileUpload
    ? 'file_upload'
    : 'text_response';

  const [fetchData, FormComponent, initialFormValue] =
    newTextResponseAdapter[type];

  const handleSubmit = async (data: TextResponseData): Promise<void> => {
    const { redirectUrl } = await create(data);
    toast.success(t(translations.questionCreated));
    window.location.href = redirectUrl;
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        data.question = initialFormValue;
        return <FormComponent onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

export default NewTextResponsePage;
