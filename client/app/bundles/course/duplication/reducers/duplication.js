import actionTypes, { duplicableItemTypes } from 'course/duplication/constants';
import { nestFolders } from 'course/duplication/utils';

const initialState = {
  confirmationOpen: false,
  selectedItems: {
    ...Object.keys(duplicableItemTypes).reduce((hash, type) => {
      hash[type] = {}; // eslint-disable-line no-param-reassign
      return hash;
    }, {}),
  },
  targetCourseId: null,
  targetCourses: [],
  duplicationMode: 'course',

  currentHost: '',
  currentCourse: {
    title: '',
    start_at: null,
  },

  assessmentsComponent: [],
  surveyComponent: [],
  achievementsComponent: [],
  materialsComponent: [],
  videosComponent: [],

  isLoading: false,
  isDuplicating: false,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_OBJECTS_LIST_REQUEST: {
      return { ...state, isLoading: true };
    }
    case actionTypes.LOAD_OBJECTS_LIST_SUCCESS: {
      const { targetCourses, materialsComponent, ...data } = action.duplicationData;
      const sortedTargetCourses = targetCourses.sort(
        (a, b) => a.title.localeCompare(b.title)
      );
      const nestedFolders = nestFolders(materialsComponent);
      return {
        ...state,
        ...data,
        isLoading: false,
        targetCourses: sortedTargetCourses,
        materialsComponent: nestedFolders,
      };
    }
    case actionTypes.LOAD_OBJECTS_LIST_FAILURE: {
      return { ...state, isLoading: false };
    }

    case actionTypes.SET_TARGET_COURSE_ID: {
      return { ...state, targetCourseId: action.targetCourseId };
    }
    case actionTypes.SET_ITEM_SELECTED_BOOLEAN: {
      const selectedItems = { ...state.selectedItems };
      selectedItems[action.itemType][action.id] = action.value;
      return { ...state, selectedItems };
    }
    case actionTypes.SET_DUPLICATION_MODE: {
      return { ...state, duplicationMode: action.duplicationMode };
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
