import actionTypes, { duplicableItemTypes } from 'course/duplication/constants';

const initialState = {
  confirmationOpen: false,
  selectedItems: {
    ...Object.keys(duplicableItemTypes).reduce((hash, type) => {
      hash[type] = {};  // eslint-disable-line no-param-reassign
      return hash;
    }, {}),
  },
  targetCourseId: null,
  targetCourses: [],
  assessmentsComponent: [],
  isLoading: false,
  isDuplicatingObjects: false,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_OBJECTS_LIST_REQUEST: {
      return { ...state, isLoading: true };
    }
    case actionTypes.LOAD_OBJECTS_LIST_SUCCESS: {
      const sortedTargetCourses = action.duplicationData.targetCourses.sort(
        (a, b) => a.title.localeCompare(b.title)
      );
      return {
        ...state,
        ...action.duplicationData,
        isLoading: false,
        targetCourses: sortedTargetCourses,
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

    case actionTypes.SHOW_DUPLICATE_ITEMS_CONFIRMATION: {
      return { ...state, confirmationOpen: true };
    }
    case actionTypes.HIDE_DUPLICATE_ITEMS_CONFIRMATION: {
      return { ...state, confirmationOpen: false };
    }

    case actionTypes.DUPLICATE_ITEMS_REQUEST: {
      return { ...state, isDuplicatingObjects: true };
    }
    case actionTypes.DUPLICATE_ITEMS_FAILURE:
    case actionTypes.DUPLICATE_ITEMS_SUCCESS: {
      return { ...state, isDuplicatingObjects: false };
    }

    default:
      return state;
  }
}
