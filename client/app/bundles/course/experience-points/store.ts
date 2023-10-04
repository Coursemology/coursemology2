import { produce } from 'immer';
import {
  ExperiencePointsFilterData,
  ExperiencePointsRecordListData,
} from 'types/course/experiencePointsRecords';
import {
  createEntityStore,
  removeAllFromStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

import {
  DELETE_EXPERIENCE_POINTS_RECORD,
  DeleteExperiencePointsRecordAction,
  DOWNLOAD_EXPERIENCE_POINTS_FAILURE,
  DOWNLOAD_EXPERIENCE_POINTS_REQUEST,
  DOWNLOAD_EXPERIENCE_POINTS_SUCCESS,
  DownloadExperiencePointsFailureAction,
  DownloadExperiencePointsRequestAction,
  DownloadExperiencePointsSuccessAction,
  ExperiencePointsActionType,
  ExperiencePointsState,
  SAVE_EXPERIENCE_POINTS_RECORD_LIST,
  SaveExperiencePointsRecordListAction,
  UPDATE_EXPERIENCE_POINTS_RECORD,
  UpdateExperiencePointsRecordAction,
} from './types';

const initialState: ExperiencePointsState = {
  records: createEntityStore(),
  setting: { rowCount: 0, filters: { names: [] }, studentName: '' },
};

const reducer = produce(
  (draft: ExperiencePointsState, action: ExperiencePointsActionType) => {
    switch (action.type) {
      case SAVE_EXPERIENCE_POINTS_RECORD_LIST: {
        removeAllFromStore(draft.records);
        saveListToStore(draft.records, action.records);

        draft.setting.rowCount = action.rowCount;
        draft.setting.filters = action.filters ?? { names: [] };
        draft.setting.studentName = action.studentName ?? '';
        break;
      }

      case UPDATE_EXPERIENCE_POINTS_RECORD: {
        const recordId = action.data.id;
        if (draft.records.byId[recordId]) {
          const prevEntity = draft.records.byId[recordId]!;
          const nextEntity = {
            ...prevEntity,
            reason: {
              ...prevEntity.reason,
              text: action.data.reason.text,
            },
            pointsAwarded: action.data.pointsAwarded,
            updatedAt: action.data.updatedAt,
            updated: action.data.updater,
          };

          saveEntityToStore(draft.records, nextEntity);
        }
        break;
      }

      case DELETE_EXPERIENCE_POINTS_RECORD: {
        const recordId = action.id;
        if (draft.records.byId[recordId]) {
          removeFromStore(draft.records, recordId);
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
  saveExperiencePointsRecordList: (
    rowCount: number,
    records: ExperiencePointsRecordListData[],
    filters?: ExperiencePointsFilterData,
    studentName?: string,
  ): SaveExperiencePointsRecordListAction => {
    return {
      type: SAVE_EXPERIENCE_POINTS_RECORD_LIST,
      rowCount,
      records,
      filters,
      studentName,
    };
  },

  updateExperiencePointsRecord: (
    data: ExperiencePointsRecordListData,
  ): UpdateExperiencePointsRecordAction => {
    return {
      type: UPDATE_EXPERIENCE_POINTS_RECORD,
      data,
    };
  },

  deleteExperiencePointsRecord: (
    id: number,
  ): DeleteExperiencePointsRecordAction => {
    return {
      type: DELETE_EXPERIENCE_POINTS_RECORD,
      id,
    };
  },

  downloadExperiencePointsRequest:
    (): DownloadExperiencePointsRequestAction => {
      return {
        type: DOWNLOAD_EXPERIENCE_POINTS_REQUEST,
      };
    },

  downloadExperiencePointsSuccess:
    (): DownloadExperiencePointsSuccessAction => {
      return {
        type: DOWNLOAD_EXPERIENCE_POINTS_SUCCESS,
      };
    },

  downloadExperiencePointsFailure:
    (): DownloadExperiencePointsFailureAction => {
      return {
        type: DOWNLOAD_EXPERIENCE_POINTS_FAILURE,
      };
    },
};

export default reducer;
