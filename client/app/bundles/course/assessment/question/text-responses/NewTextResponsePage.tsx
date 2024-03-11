import { ElementType } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AttachmentType,
  TextResponseData,
  TextResponseFormData,
} from 'types/course/assessment/question/text-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { DataHandle } from 'lib/hooks/router/dynamicNest';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';
import { commonQuestionFieldsInitialValues } from '../components/CommonQuestionFields';

import TextResponseForm, {
  TextResponseFormProps,
} from './components/TextResponseForm';
import { create, fetchNewFileUpload, fetchNewTextResponse } from './operations';

const INITIAL_MAX_ATTACHMENTS = 3;

const NEW_TEXT_RESPONSE_VALUE = {
  ...commonQuestionFieldsInitialValues,
  hideText: false,
  attachmentType: AttachmentType.NO_ATTACHMENT,
  maxAttachments: INITIAL_MAX_ATTACHMENTS,
  isAttachmentRequired: false,
};

const NEW_FILE_UPLOAD_RESPONSE_VALUE = {
  ...commonQuestionFieldsInitialValues,
  hideText: true,
  attachmentType: AttachmentType.SINGLE_FILE_ATTACHMENT,
  maxAttachments: INITIAL_MAX_ATTACHMENTS,
  isAttachmentRequired: true,
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

const getQuestionType = (
  params: URLSearchParams,
): TextResponseFormData['questionType'] =>
  params.get('file_upload') === 'true' ? 'file_upload' : 'text_response';

const NewTextResponsePage = (): JSX.Element => {
  const { t } = useTranslation();

  const [params] = useSearchParams();
  const type = getQuestionType(params);

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

const handle: DataHandle = (_, location) => {
  const searchParams = new URLSearchParams(location.search);

  return getQuestionType(searchParams) === 'file_upload'
    ? translations.newFileUpload
    : translations.newTextResponse;
};

export default Object.assign(NewTextResponsePage, { handle });
