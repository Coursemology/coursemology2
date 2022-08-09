import produce from 'immer';
import {
  createEntityStore,
  removeAllFromStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';
import {
  DELETE_ANNOUNCEMENT,
  GlobalActionType,
  GlobalState,
  SAVE_ANNOUNCEMENT,
  SAVE_ANNOUNCEMENTS_LIST,
} from './types';

const initialState: GlobalState = {
  announcements: createEntityStore(),
};

const reducer = produce((draft: GlobalState, action: GlobalActionType) => {
  switch (action.type) {
    case SAVE_ANNOUNCEMENTS_LIST: {
      const announcementList = action.announcements;
      const entityList = announcementList.map((data) => ({ ...data }));
      removeAllFromStore(draft.announcements);
      saveListToStore(draft.announcements, entityList);
      break;
    }
    case SAVE_ANNOUNCEMENT: {
      const announcementData = action.announcement;
      const announcementEntity = { ...announcementData };
      saveEntityToStore(draft.announcements, announcementEntity);
      break;
    }
    case DELETE_ANNOUNCEMENT: {
      const announcementId = action.id;
      if (draft.announcements.byId[announcementId]) {
        removeFromStore(draft.announcements, announcementId);
      }
      break;
    }
    default:
      break;
  }
}, initialState);

export default reducer;
