import { ElementType } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  McqMrqData,
  McqMrqFormData,
} from 'types/course/assessment/question/multiple-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

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
  title: '',
  description: '',
  staffOnlyComments: '',
  maximumGrade: '',
  skillIds: [],
  skipGrading: false,
  randomizeOptions: false,
};

const NewMcqMrqPage = (): JSX.Element => {
  const { t } = useTranslation();

  const [params] = useSearchParams();
  const isMcq = params.get('multiple_choice') === 'true';

  const type: McqMrqFormData['mcqMrqType'] = isMcq ? 'mcq' : 'mrq';
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

export default NewMcqMrqPage;
