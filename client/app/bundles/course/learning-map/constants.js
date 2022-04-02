import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'FETCH_LEARNING_MAP_SUCCESS',
  'FETCH_LEARNING_MAP_FAILURE',
  'ADD_PARENT_NODE_SUCCESS',
  'ADD_PARENT_NODE_FAILURE',
  'REMOVE_PARENT_NODE_SUCCESS',
  'REMOVE_PARENT_NODE_FAILURE',
  'SELECT_ARROW',
  'SELECT_GATE',
  'TOGGLE_SATISFIABILITY_TYPE_SUCCESS',
  'TOGGLE_SATISFIABILITY_TYPE_FAILURE',
  'RESET_SELECTION',
  'LOADING',
]);

const elementTypes = {
  arrow: 'arrow',
  gate: 'gate',
};

const satisfiabilityTypes = {
  allConditions: 'all_conditions',
  atLeastOneCondition: 'at_least_one_condition',
}

export { actionTypes, elementTypes, satisfiabilityTypes };
