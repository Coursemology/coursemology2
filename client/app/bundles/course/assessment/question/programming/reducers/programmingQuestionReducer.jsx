import Immutable from 'immutable';

import actionTypes from '../constants/programmingQuestionConstants';

export const $$initialState = Immutable.fromJS({
  // this is the default state that would be used if one were not passed into the store
  question: {
    assessment_id: null,
    id: null,
    title: '',
    description: '',
    staff_only_comments: '',
    maximum_grade: 0,
    weight: 0,
    language_id: null,
    languages: [],
    skill_ids: [],
    skills: [],
    memory_limit: null,
    time_limit: null,
    show_attempt_limit: false,
    attempt_limit: null,
    import_job_id: null,
    package: null,
  },
  package_ui: {
    templates: [],
    selected: null,
    test_cases: {
      evaluation: [],
      private: [],
      public: [],
    }
  },
  alert: null,
  form_data: {
    path: null,
    auth_token: null
  },
});

function questionReducer($$state, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.PROGRAMMING_QUESTION_UPDATE:
      const { field, newValue } = action;
      return $$state.set(field, newValue);

    case actionTypes.SKILLS_UPDATE:
      const { skills } = action;
      return $$state.set('skill_ids', Immutable.fromJS(skills));

    default:
      return $$state;
  }
}

export default function programmingQuestionReducer($$state = $$initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.SKILLS_UPDATE:
    case actionTypes.PROGRAMMING_QUESTION_UPDATE:
      return $$state.set('question', questionReducer($$state.get('question'), action));

    default:
      return $$state;
  }
}
