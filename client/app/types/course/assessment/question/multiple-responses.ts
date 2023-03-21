import {
  AvailableSkills,
  OptionalIfNew,
  QuestionData,
  QuestionFormData,
} from '../questions';

interface OptionListData {
  id: number | string;
  option: string;
  correct: boolean;
}

export interface OptionData extends OptionListData {
  explanation: string;
  weight: number;
  ignoreRandomization: boolean;
}

export interface OptionEntity extends OptionData {
  toBeDeleted?: boolean;
  draft?: boolean;
}

export interface McqMrqSwitchData {
  type: string;
  mcqMrqType: 'mcq' | 'mrq';
  convertUrl: string;
  hasAnswers?: boolean;
  unsubmitAndConvertUrl?: string;
}

export type McqMrqListData = QuestionData &
  McqMrqSwitchData & {
    options: OptionListData[];
  };

export interface McqMrqData<T extends 'new' | 'edit' = 'edit'> {
  gradingScheme: 'any_correct' | 'all_correct';
  options: OptionEntity[] | null | OptionalIfNew<T>;
  question:
    | (QuestionFormData & {
        skipGrading: boolean;
        randomizeOptions?: boolean;
      })
    | OptionalIfNew<T>;
}

export interface McqMrqFormData<T extends 'new' | 'edit' = 'edit'>
  extends McqMrqSwitchData,
    McqMrqData<T>,
    AvailableSkills {
  allowRandomization: boolean;
}

type McqMrqFormDataQuestion = McqMrqFormData['question'];

export interface McqMrqPostData {
  question_multiple_response: {
    grading_scheme: McqMrqFormData['gradingScheme'];
    title?: McqMrqFormDataQuestion['title'];
    description?: McqMrqFormDataQuestion['description'];
    staff_only_comments?: McqMrqFormDataQuestion['staffOnlyComments'];
    maximum_grade: McqMrqFormDataQuestion['maximumGrade'];
    randomize_options?: McqMrqFormDataQuestion['randomizeOptions'];
    skip_grading?: McqMrqFormDataQuestion['skipGrading'];
    question_assessment?: { skill_ids: McqMrqFormDataQuestion['skillIds'] };
    options_attributes?: {
      id?: OptionEntity['id'];
      correct?: OptionEntity['correct'];
      option?: OptionEntity['option'];
      explanation?: OptionEntity['explanation'];
      weight?: OptionEntity['weight'];
      ignore_randomization?: OptionEntity['ignoreRandomization'];
      _destroy?: OptionEntity['toBeDeleted'];
    }[];
  };
}
