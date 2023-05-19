import { combineReducers, Reducer } from 'redux';

import groupsDialogReducer from './reducers/groupsDialog';
import groupsFetchReducer from './reducers/groupsFetch';
import groupsManageReducer from './reducers/groupsManage';
import {
  GroupsDialogState,
  GroupsFetchState,
  GroupsManageState,
} from './types';

const reducer = combineReducers({
  groupsFetch: groupsFetchReducer as Reducer<GroupsFetchState>,
  groupsDialog: groupsDialogReducer as Reducer<GroupsDialogState>,
  groupsManage: groupsManageReducer as Reducer<GroupsManageState>,
});

export default reducer;
