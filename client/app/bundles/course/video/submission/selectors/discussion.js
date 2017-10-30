import { createSelector } from 'reselect';

const topicsSelector = state => state.discussion.topics;

export const orderedTopicsSelector = createSelector(
  topicsSelector,
  topics => topics
    .filter(topic => topic.topLevelPostIds.length > 0)
    .sort((topic1, topic2) => {
      if (topic1.timestamp === topic2.timestamp) {
        return topic1.createdTimestamp - topic2.createdTimestamp;
      }
      return topic1.timestamp - topic2.timestamp;
    })
);

export const orderedTopicIdsSelector = createSelector(
  orderedTopicsSelector,
  orderedTopics => orderedTopics.keySeq().toArray()
);
