import { updateOrAppend, deleteIfFound } from 'lib/helpers/reducer-helpers';
import actionTypes from '../constants';
import sectionReducer from './section';
import { sortSurveyElements } from '../utils';

const initialState = {
  sections: [],
  draggedQuestion: {
    index: null,
    sectionIndex: null,
    sectionId: null,
  },
};

export default function (survey = initialState, action) {
  if (String(survey.id) !== String(action.surveyId)) {
    return survey;
  }

  switch (action.type) {
    case actionTypes.DELETE_SURVEY_QUESTION_SUCCESS:
    case actionTypes.UPDATE_SURVEY_QUESTION_SUCCESS:
    case actionTypes.CREATE_SURVEY_QUESTION_SUCCESS: {
      const sections = survey.sections.map(section => sectionReducer(section, action));
      return { ...survey, sections };
    }
    case actionTypes.UPDATE_SURVEY_SECTION_SUCCESS:
    case actionTypes.CREATE_SURVEY_SECTION_SUCCESS: {
      const sections = updateOrAppend(survey.sections, action.section);
      return sortSurveyElements({ ...survey, sections });
    }
    case actionTypes.DELETE_SURVEY_SECTION_SUCCESS: {
      const sections = deleteIfFound(survey.sections, action.sectionId);
      return { ...survey, sections };
    }
    case actionTypes.SET_DRAGGED_QUESTION: {
      return {
        ...survey,
        draggedQuestion: {
          index: action.index,
          sectionIndex: action.sectionIndex,
          sectionId: action.sectionId,
        },
      };
    }
    case actionTypes.REORDER_QUESTION: {
      const section = survey.sections[action.sectionIndex];
      const questions = [...section.questions];
      const sourceQuestion = questions.splice(action.sourceIndex, 1)[0];
      questions.splice(action.targetIndex, 0, sourceQuestion);

      const sections = [...survey.sections];
      sections[action.sectionIndex] = { ...section, questions };

      return {
        ...survey,
        sections,
        draggedQuestion: {
          index: action.targetIndex,
          sectionIndex: action.sectionIndex,
          sectionId: section.id,
        },
      };
    }
    case actionTypes.CHANGE_QUESTION_SECTION: {
      const sourceSection = survey.sections[action.sourceSectionIndex];
      const targetSection = survey.sections[action.targetSectionIndex];
      const sourceSectionQuestions = [...sourceSection.questions];
      const sourceQuestion = {
        ...sourceSectionQuestions.splice(action.sourceIndex, 1)[0],
        section_id: targetSection.id,
      };
      const targetSectionQuestions = action.prepend ?
        [sourceQuestion, ...targetSection.questions] : [...targetSection.questions, sourceQuestion];

      const sections = [...survey.sections];
      sections[action.sourceSectionIndex] = { ...sourceSection, questions: sourceSectionQuestions };
      sections[action.targetSectionIndex] = { ...targetSection, questions: targetSectionQuestions };

      return {
        ...survey,
        sections,
        draggedQuestion: {
          index: action.prepend ? 0 : targetSectionQuestions.length - 1,
          sectionIndex: action.targetSectionIndex,
          sectionId: targetSection.id,
        },
      };
    }
    default:
      return survey;
  }
}
