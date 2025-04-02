import {
  RubricBasedResponseData,
  RubricBasedResponseFormData,
} from 'types/course/assessment/question/rubric-based-responses';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';
import { commonQuestionFieldsInitialValues } from '../components/CommonQuestionFields';

import RubricBasedResponseForm from './components/RubricBasedResponseForm';
import { create, fetchNewRubricBasedResponse } from './operations';

const NEW_RUBRIC_BASED_RESPONSE_TEMPLATE: RubricBasedResponseData['question'] =
  commonQuestionFieldsInitialValues;

const NewRubricBasedResponsePage = (): JSX.Element => {
  const { t } = useTranslation();

  const fetchData = (): Promise<RubricBasedResponseFormData> =>
    fetchNewRubricBasedResponse();

  const handleSubmit = (data: RubricBasedResponseData): Promise<void> =>
    create(data).then(({ redirectUrl }) => {
      toast.success(t(translations.questionCreated));
      window.location.href = redirectUrl;
    });

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        data.question = NEW_RUBRIC_BASED_RESPONSE_TEMPLATE;
        return <RubricBasedResponseForm onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

const handle = translations.newRubricBasedResponse;

export default Object.assign(NewRubricBasedResponsePage, { handle });
