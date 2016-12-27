import actionTypes from '../constants/programmingQuestionConstants';

export function changeTemplateTab(selected) {
  return {
    type: actionTypes.TEMPLATE_TAB_UPDATE,
    selected,
  };
}

export default changeTemplateTab;
