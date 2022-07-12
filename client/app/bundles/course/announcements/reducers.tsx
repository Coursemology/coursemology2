import produce from 'immer';
import {
  createEntityStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';
import {
  SAVE_ANNOUNCEMENT_LIST,
  AnnouncementsActionType,
  AnnouncementsState,
  SAVE_ANNOUNCEMENT,
  DELETE_ANNOUNCEMENT,
} from './types';

const initialState: AnnouncementsState = {
  announcements: createEntityStore(),
  permissions: { canCreate: false },
};

const reducer = produce(
  (draft: AnnouncementsState, action: AnnouncementsActionType) => {
    switch (action.type) {
      case SAVE_ANNOUNCEMENT_LIST: {
        const announcementList = action.announcementList;
        const entityList = announcementList.map((data) => ({ ...data }));

        // Need to refresh the entire store for creating new announcement for ordering to be correct
        draft.announcements = createEntityStore();

        saveListToStore(draft.announcements, entityList);
        draft.permissions = action.announcementPermissions;
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
      default: {
        break;
      }
    }
  },
  initialState,
);

export default reducer;
