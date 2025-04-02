import { useFormContext } from 'react-hook-form';
import { RubricBasedResponseFormData } from 'types/course/assessment/question/rubric-based-responses';

import CommonQuestionFields from '../../components/CommonQuestionFields';
import { useRubricBasedResponseFormDataContext } from '../hooks/RubricBasedResponseFormDataContext';

interface QuestionFieldsProps {
  disabled?: boolean;
  disableSettingMaxGrade?: boolean;
}

const QuestionFields = (props: QuestionFieldsProps): JSX.Element => {
  const { control } = useFormContext<RubricBasedResponseFormData>();

  const { availableSkills, skillsUrl } =
    useRubricBasedResponseFormDataContext();

  return (
    <CommonQuestionFields
      availableSkills={availableSkills}
      control={control}
      disabled={props.disabled}
      disableSettingMaxGrade={props.disableSettingMaxGrade}
      name="question"
      skillsUrl={skillsUrl}
    />
  );
};

export default QuestionFields;
