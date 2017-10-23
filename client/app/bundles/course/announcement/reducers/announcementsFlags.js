import actionTypes from '../constants';

const initialState = {
  isLoadingAnnouncements: false,
  canCreate: false,
  disableAnnouncementShow: false,
  totalPageCount: 0,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_ANNOUNCEMENTS_REQUEST: {
      return { ...state, isLoadingAnnouncements: true };
    }
    case actionTypes.LOAD_ANNOUNCEMENTS_SUCCESS: {
      return { ...state, isLoadingAnnouncements: false, canCreate: action.canCreate, totalPageCount: action.totalPageCount };
    }
    case actionTypes.LOAD_ANNOUNCEMENTS_FAILURE: {
      return { ...state, isLoadingAnnouncements: false };
    }
    default:
      return state;
  }
}
