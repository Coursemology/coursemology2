import { defineMessages } from 'react-intl';

const suggestionsTranslations = defineMessages({
  iAmStuck: {
    id: 'course.assessment.submission.suggestions.iAmStuck',
    defaultMessage: 'I am stuck',
  },
  howDoIFixThis: {
    id: 'course.assessment.submission.suggestions.howDoIFixThis',
    defaultMessage: 'How do I fix this?',
  },
  questionUnclear: {
    id: 'course.assessment.submission.suggestions.questionUnclear',
    defaultMessage: 'Explain the question',
  },
  optimizeThisCode: {
    id: 'course.assessment.submission.suggestions.optimizeThisCode',
    defaultMessage: 'Review my code',
  },
  whereAmIWrong: {
    id: 'course.assessment.submission.suggestions.whereAmIWrong',
    defaultMessage: 'Where am I wrong?',
  },
});

const suggestionFixesTranslations = defineMessages({
  looksWrong: {
    id: 'course.assessment.submission.suggestions.looksWrong',
    defaultMessage: 'This looks wrong',
  },
});

// NOTE: the index key in suggestionsMapping follow the assigned index in DB table live_feedback_options
export const suggestionMapping = {
  1: suggestionsTranslations.iAmStuck,
  2: suggestionsTranslations.howDoIFixThis,
  3: suggestionsTranslations.questionUnclear,
  4: suggestionsTranslations.optimizeThisCode,
  5: suggestionsTranslations.whereAmIWrong,
};

export const suggestionFixesMapping = {
  6: suggestionFixesTranslations.looksWrong,
};
