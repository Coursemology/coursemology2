import { AxiosError } from 'axios';
import { Operation } from 'store';
import {
  ItemWithTimeData,
  TimeData,
  TimelineData,
  TimelinePostData,
  TimePostData,
} from 'types/course/referenceTimelines';

import CourseAPI from 'api/course';

import { actions } from './store';

export const fetchTimelines = (): Operation => async (dispatch) => {
  const response = await CourseAPI.referenceTimelines.index();
  dispatch(actions.updateAll(response.data));
};

export const createTimeline =
  (title: TimelineData['title']): Operation =>
  async (dispatch) => {
    const adaptedData: TimelinePostData = { reference_timeline: { title } };

    try {
      const response = await CourseAPI.referenceTimelines.create(adaptedData);
      dispatch(actions.addEmptyTimeline(response.data));
    } catch (error) {
      if (error instanceof AxiosError) throw error.response?.data?.errors;
      throw error;
    }
  };

export const deleteTimeline =
  (
    id: TimelineData['id'],
    alternativeTimelineId?: TimelineData['id'],
  ): Operation =>
  async (dispatch) => {
    try {
      await CourseAPI.referenceTimelines.delete(id, alternativeTimelineId);
      dispatch(actions.removeTimeline(id));
    } catch (error) {
      if (error instanceof AxiosError) throw error.response?.data?.errors;
      throw error;
    }
  };

export const updateTimeline =
  (
    id: TimelineData['id'],
    changes: Partial<Pick<TimelineData, 'title' | 'weight'>>,
  ): Operation =>
  async (dispatch) => {
    const adaptedData: TimelinePostData = {
      reference_timeline: { title: changes.title, weight: changes.weight },
    };

    try {
      await CourseAPI.referenceTimelines.update(id, adaptedData);

      dispatch(
        actions.updateTimeline({
          id,
          title: changes.title,
          weight: changes.weight,
        }),
      );
    } catch (error) {
      if (error instanceof AxiosError) throw error.response?.data?.errors;
      throw error;
    }
  };

export const createTime =
  (
    timelineId: TimelineData['id'],
    itemId: ItemWithTimeData['id'],
    time: {
      startAt: string;
      bonusEndAt?: string;
      endAt?: string;
    },
  ): Operation =>
  async (dispatch) => {
    const adaptedData: TimePostData = {
      reference_time: {
        lesson_plan_item_id: itemId,
        start_at: time.startAt,
        bonus_end_at: time.bonusEndAt,
        end_at: time.endAt,
      },
    };

    try {
      const response = await CourseAPI.referenceTimelines.createTime(
        timelineId,
        adaptedData,
      );

      const newTimeId = response.data.id;

      dispatch(
        actions.addTimeToItem({
          timelineId,
          itemId,
          time: {
            id: newTimeId,
            ...time,
          },
        }),
      );
    } catch (error) {
      if (error instanceof AxiosError) throw error.response?.data?.errors;
      throw error;
    }
  };

export const deleteTime =
  (
    timelineId: TimelineData['id'],
    itemId: ItemWithTimeData['id'],
    timeId: TimeData['id'],
  ): Operation =>
  async (dispatch) => {
    try {
      await CourseAPI.referenceTimelines.deleteTime(timelineId, timeId);
      dispatch(actions.removeTimeFromItem({ timelineId, itemId }));
    } catch (error) {
      if (error instanceof AxiosError) throw error.response?.data?.errors;
      throw error;
    }
  };

export const updateTime =
  (
    timelineId: TimelineData['id'],
    itemId: ItemWithTimeData['id'],
    timeId: TimeData['id'],
    time: {
      startAt?: string;
      bonusEndAt?: string | null;
      endAt?: string | null;
    },
  ): Operation =>
  async (dispatch) => {
    const adaptedData: TimePostData = {
      reference_time: {
        start_at: time.startAt,
        bonus_end_at: time.bonusEndAt,
        end_at: time.endAt,
      },
    };

    try {
      await CourseAPI.referenceTimelines.updateTime(
        timelineId,
        timeId,
        adaptedData,
      );

      dispatch(
        actions.updateTimeInItem({
          timelineId,
          itemId,
          time: {
            startAt: time.startAt,
            bonusEndAt: time.bonusEndAt,
            endAt: time.endAt,
          },
        }),
      );
    } catch (error) {
      if (error instanceof AxiosError) throw error.response?.data?.errors;
      throw error;
    }
  };
