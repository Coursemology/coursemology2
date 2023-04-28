import { useFormContext } from 'react-hook-form';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import CommonQuestionFields from '../../../components/CommonQuestionFields';
import { useProgrammingFormDataContext } from '../../hooks/ProgrammingFormDataContext';

interface QuestionFieldsProps {
  disabled?: boolean;
}

const QuestionFields = (props: QuestionFieldsProps): JSX.Element => {
  const { control } = useFormContext<ProgrammingFormData>();

  const { availableSkills, skillsUrl } = useProgrammingFormDataContext();

  return (
    <CommonQuestionFields
      availableSkills={availableSkills}
      control={control}
      disabled={props.disabled}
      name="question"
      skillsUrl={skillsUrl}
    />
  );
};

export default QuestionFields;
