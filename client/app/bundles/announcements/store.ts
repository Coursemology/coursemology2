import produce from 'immer';
import { AnnouncementData } from 'types/course/announcements';
import {
  createEntityStore,
  removeAllFromStore,
  saveListToStore,
} from 'utilities/store';

import {
  GlobalActionType,
  GlobalAnnouncementState,
  SAVE_ANNOUNCEMENT_LIST,
  SaveAnnouncementListAction,
} from './types';

const initialState: GlobalAnnouncementState = {
  announcements: createEntityStore(),
};

const reducer = produce(
  (draft: GlobalAnnouncementState, action: GlobalActionType) => {
    switch (action.type) {
      case SAVE_ANNOUNCEMENT_LIST: {
        const announcementList = action.announcements;
        const entityList = announcementList.map((data) => ({ ...data }));
        removeAllFromStore(draft.announcements);
        saveListToStore(draft.announcements, entityList);
        break;
      }
      default:
        break;
    }
  },
  initialState,
);

export function saveAnnouncementsList(
  announcements: AnnouncementData[],
): SaveAnnouncementListAction {
  return {
    type: SAVE_ANNOUNCEMENT_LIST,
    announcements,
  };
}

export default reducer;
