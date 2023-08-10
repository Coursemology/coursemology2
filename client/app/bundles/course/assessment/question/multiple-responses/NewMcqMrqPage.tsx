import { ElementType } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  McqMrqData,
  McqMrqFormData,
} from 'types/course/assessment/question/multiple-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { DataHandle } from 'lib/hooks/router/dynamicNest';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';
import { commonQuestionFieldsInitialValues } from '../components/CommonQuestionFields';

import AdaptedForm from './components/AdaptedForm';
import { AdaptedFormProps } from './components/McqMrqForm';
import { create, fetchNewMcq, fetchNewMrq } from './operations';

type Fetcher = () => Promise<McqMrqFormData<'new'>>;
type Form = ElementType<AdaptedFormProps<'new'>>;

type Adapter = [Fetcher, Form];

const newMcqMrqAdapters: Record<McqMrqFormData['mcqMrqType'], Adapter> = {
  mcq: [fetchNewMcq, AdaptedForm.Mcq],
  mrq: [fetchNewMrq, AdaptedForm.Mrq],
};

const NEW_MCQ_MRQ_TEMPLATE: McqMrqData['question'] = {
  ...commonQuestionFieldsInitialValues,
  skipGrading: false,
  randomizeOptions: false,
};

const getMcqMrqType = (
  params: URLSearchParams,
): McqMrqFormData['mcqMrqType'] =>
  params.get('multiple_choice') === 'true' ? 'mcq' : 'mrq';

const NewMcqMrqPage = (): JSX.Element => {
  const { t } = useTranslation();

  const [params] = useSearchParams();
  const type = getMcqMrqType(params);

  const [fetchData, FormComponent] = newMcqMrqAdapters[type];

  const handleSubmit = (data: McqMrqData): Promise<void> =>
    create(data).then(({ redirectUrl }) => {
      toast.success(t(translations.questionCreated));
      window.location.href = redirectUrl;
    });

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        data.question = NEW_MCQ_MRQ_TEMPLATE;
        return <FormComponent new onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

const handle: DataHandle = (_, location) => {
  const searchParams = new URLSearchParams(location.search);

  return getMcqMrqType(searchParams) === 'mcq'
    ? translations.newMultipleChoice
    : translations.newMultipleResponse;
};

export default Object.assign(NewMcqMrqPage, { handle });
