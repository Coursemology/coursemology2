import { produce } from 'immer';
import { arrayToObjectWithKey } from 'utilities/array';

import actionTypes, { duplicationModes } from 'course/duplication/constants';
import { getEmptySelectedItems, nestFolders } from 'course/duplication/utils';

const initialState = {
  confirmationOpen: false,
  selectedItems: getEmptySelectedItems(),
  destinationInstanceId: null,
  destinationCourseId: null,
  destinationCourseTitle: null,
  destinationCourseStartAt: null,
  destinationCourses: [],
  destinationInstances: {},
  duplicationMode: duplicationModes.COURSE,
  currentItemSelectorPanel: null,

  metadata: {
    canDuplicateToAnotherInstance: false,
    currentInstanceId: 0,
  },

  currentHost: '',
  currentCourseId: null,
  sourceCourse: {
    title: '',
    start_at: null,
    duplicationModesAllowed: [],
    enabledComponents: [],
    unduplicableObjectTypes: [],
  },

  assessmentsComponent: [],
  surveyComponent: [],
  achievementsComponent: [],
  materialsComponent: [],
  videosComponent: [],

  isLoading: false,
  isChangingCourse: false,
  isDuplicating: false,
  isDuplicationSuccess: false,
};

const reducer = produce((state, action) => {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_OBJECTS_LIST_REQUEST: {
      return { ...state, isLoading: true };
    }
    case actionTypes.LOAD_OBJECTS_LIST_SUCCESS: {
      const {
        destinationCourses,
        destinationInstances,
        materialsComponent,
        ...data
      } = action.duplicationData;
      const sortedDestinationCourses = destinationCourses.sort((a, b) =>
        a.title.localeCompare(b.title),
      );
      const nestedFolders = nestFolders(materialsComponent);
      return {
        ...state,
        ...data,
        isLoading: false,
        currentCourseId: data.sourceCourse.id,
        destinationCourses: sortedDestinationCourses,
        destinationInstances: arrayToObjectWithKey(destinationInstances, 'id'),
        materialsComponent: nestedFolders,
      };
    }
    case actionTypes.LOAD_OBJECTS_LIST_FAILURE: {
      return { ...state, isLoading: false };
    }

    case actionTypes.SET_DESTINATION_COURSE_ID: {
      return {
        ...state,
        destinationCourseId: action.destinationCourseId,
        selectedItems: getEmptySelectedItems(),
      };
    }
    case actionTypes.SET_ITEM_SELECTED_BOOLEAN: {
      return produce(state, (draft) => {
        draft.selectedItems[action.itemType][action.id] = action.value;
      });
    }
    case actionTypes.SET_DUPLICATION_MODE: {
      return { ...state, duplicationMode: action.duplicationMode };
    }
    case actionTypes.SET_ITEM_SELECTOR_PANEL: {
      return { ...state, currentItemSelectorPanel: action.panel };
    }

    case actionTypes.SHOW_DUPLICATE_ITEMS_CONFIRMATION: {
      return { ...state, confirmationOpen: true };
    }
    case actionTypes.HIDE_DUPLICATE_ITEMS_CONFIRMATION: {
      return { ...state, confirmationOpen: false };
    }

    case actionTypes.DUPLICATE_COURSE_REQUEST: {
      return produce(state, (draft) => {
        draft.isDuplicating = true;
        draft.destinationInstanceId =
          action.payload.duplication.destination_instance_id;
        draft.destinationCourseTitle = action.payload.duplication.new_title;
        draft.destinationCourseStartAt =
          action.payload.duplication.new_start_at;
      });
    }
    case actionTypes.DUPLICATE_ITEMS_REQUEST: {
      return { ...state, isDuplicating: true };
    }
    case actionTypes.DUPLICATE_COURSE_FAILURE:
    case actionTypes.DUPLICATE_ITEMS_FAILURE:
    case actionTypes.DUPLICATE_ITEMS_SUCCESS: {
      return { ...state, isDuplicating: false };
    }
    case actionTypes.DUPLICATE_COURSE_SUCCESS: {
      return { ...state, isDuplicating: false, isDuplicationSuccess: true };
    }
    default:
      return state;
  }
}, initialState);

export const loadObjectsList = (data) => (dispatch) =>
  dispatch({
    type: actionTypes.LOAD_OBJECTS_LIST_SUCCESS,
    duplicationData: data,
  });

export const actions = {
  setItemSelectedBoolean: (itemType, id, value) => ({
    type: actionTypes.SET_ITEM_SELECTED_BOOLEAN,
    itemType,
    id,
    value,
  }),

  showDuplicateItemsConfirmation: () => ({
    type: actionTypes.SHOW_DUPLICATE_ITEMS_CONFIRMATION,
  }),

  hideDuplicateItemsConfirmation: () => ({
    type: actionTypes.HIDE_DUPLICATE_ITEMS_CONFIRMATION,
  }),

  setDestinationCourseId: (destinationCourseId) => ({
    type: actionTypes.SET_DESTINATION_COURSE_ID,
    destinationCourseId,
  }),

  setDuplicationMode: (duplicationMode) => ({
    type: actionTypes.SET_DUPLICATION_MODE,
    duplicationMode,
  }),

  setItemSelectorPanel: (panel) => ({
    type: actionTypes.SET_ITEM_SELECTOR_PANEL,
    panel,
  }),
};

export default reducer;
