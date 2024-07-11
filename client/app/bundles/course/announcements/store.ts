import { produce } from 'immer';
import {
  AnnouncementData,
  AnnouncementPermissions,
} from 'types/course/announcements';
import {
  createEntityStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

import {
  AnnouncementsActionType,
  AnnouncementsState,
  DELETE_ANNOUNCEMENT,
  DeleteAnnouncementAction,
  SAVE_ANNOUNCEMENT,
  SAVE_ANNOUNCEMENT_LIST,
  SaveAnnouncementAction,
  SaveAnnouncementListAction,
} from './types';

const initialState: AnnouncementsState = {
  announcementTitle: '',
  announcements: createEntityStore(),
  permissions: { canCreate: false },
};

const reducer = produce(
  (draft: AnnouncementsState, action: AnnouncementsActionType) => {
    switch (action.type) {
      case SAVE_ANNOUNCEMENT_LIST: {
        const announcementList = action.announcementList;
        const entityList = announcementList.map((data) => ({ ...data }));

        saveListToStore(draft.announcements, entityList);
        draft.announcementTitle = action.announcementTitle;
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

export const actions = {
  saveAnnouncementList: (
    announcementTitle: string,
    announcementList: AnnouncementData[],
    announcementPermissions: AnnouncementPermissions,
  ): SaveAnnouncementListAction => {
    return {
      type: SAVE_ANNOUNCEMENT_LIST,
      announcementTitle,
      announcementList,
      announcementPermissions,
    };
  },
  saveAnnouncement: (
    announcement: AnnouncementData,
  ): SaveAnnouncementAction => {
    return { type: SAVE_ANNOUNCEMENT, announcement };
  },
  deleteAnnouncement: (announcementId: number): DeleteAnnouncementAction => {
    return {
      type: DELETE_ANNOUNCEMENT,
      id: announcementId,
    };
  },
};

export default reducer;
