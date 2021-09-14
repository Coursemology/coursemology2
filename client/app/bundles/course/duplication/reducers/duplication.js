import actionTypes, {
  duplicableItemTypes,
  duplicationModes,
} from 'course/duplication/constants';
import { nestFolders } from 'course/duplication/utils';

const emptySelectedItemsHash = () =>
  Object.keys(duplicableItemTypes).reduce((hash, type) => {
    hash[type] = {}; // eslint-disable-line no-param-reassign
    return hash;
  }, {});

const initialState = {
  confirmationOpen: false,
  selectedItems: emptySelectedItemsHash(),
  destinationCourseId: null,
  destinationCourses: [],
  duplicationMode: duplicationModes.COURSE,
  currentItemSelectorPanel: null,

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
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_OBJECTS_LIST_REQUEST: {
      return { ...state, isLoading: true };
    }
    case actionTypes.LOAD_OBJECTS_LIST_SUCCESS: {
      const { destinationCourses, materialsComponent, ...data } =
        action.duplicationData;
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
        materialsComponent: nestedFolders,
      };
    }
    case actionTypes.LOAD_OBJECTS_LIST_FAILURE: {
      return { ...state, isLoading: false };
    }

    case actionTypes.CHANGE_SOURCE_COURSE_REQUEST: {
      return { ...state, isChangingCourse: true };
    }
    case actionTypes.CHANGE_SOURCE_COURSE_SUCCESS: {
      const { materialsComponent, ...data } = action.courseData;
      const nestedFolders = nestFolders(materialsComponent);
      return {
        ...state,
        ...data,
        materialsComponent: nestedFolders,
        selectedItems: emptySelectedItemsHash(),
        currentItemSelectorPanel: null,
        isChangingCourse: false,
      };
    }
    case actionTypes.CHANGE_SOURCE_COURSE_FAILURE: {
      return { ...state, isChangingCourse: false };
    }

    case actionTypes.SET_DESTINATION_COURSE_ID: {
      return {
        ...state,
        destinationCourseId: action.destinationCourseId,
        selectedItems: emptySelectedItemsHash(),
      };
    }
    case actionTypes.SET_ITEM_SELECTED_BOOLEAN: {
      const selectedItems = { ...state.selectedItems };
      selectedItems[action.itemType][action.id] = action.value;
      return { ...state, selectedItems };
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

    case actionTypes.DUPLICATE_COURSE_REQUEST:
    case actionTypes.DUPLICATE_ITEMS_REQUEST: {
      return { ...state, isDuplicating: true };
    }
    case actionTypes.DUPLICATE_COURSE_SUCCESS:
    case actionTypes.DUPLICATE_COURSE_FAILURE:
    case actionTypes.DUPLICATE_ITEMS_FAILURE:
    case actionTypes.DUPLICATE_ITEMS_SUCCESS: {
      return { ...state, isDuplicating: false };
    }

    default:
      return state;
  }
}
