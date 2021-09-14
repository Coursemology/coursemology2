import { defineMessages } from 'react-intl';
import { questionTypes } from '../../constants';

const translations = defineMessages({
  pleaseRecordYourVoice: {
    id:
      'course.assessment.submission.pages.SubmissionEditIndex.submissionFormValidate.pleaseRecordYourVoice',
    defaultMessage: 'Please record your voice',
  },
});

const validateDefaultQuestion = () => {};

const validateVoiceResponse = (values) => {
  const { file: fileValue } = values;
  const { file, url } = fileValue;
  if (url || file instanceof File) {
    return undefined;
  }
  return { file: translations.pleaseRecordYourVoice };
};

const validateQuestion = (question) => (values) => {
  const { VoiceResponse } = questionTypes;
  switch (question.type) {
    case VoiceResponse:
      return validateVoiceResponse(values);
    default:
      return validateDefaultQuestion(values);
  }
};

const submissionFormValidate = (values, props) => {
  const { questions } = props;
  const errors = {};
  Object.keys(values || {}).forEach((key) => {
    const value = values[key];
    const { questionId } = value;
    const question = questions[questionId];
    const error = validateQuestion(question)(value);
    if (error) {
      errors[key] = error;
    }
  });
  return errors;
};

export default submissionFormValidate;
