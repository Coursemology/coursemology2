import { createSelector } from 'reselect';

const topicsSelector = state => state.discussion.topics;

/**
 * A memoized selector that returns topic objects containing at least one post.
 *
 * Selector returns an Immutable Map from topic ids to topic objects.
 */
const nonEmptyTopicsSelector = createSelector(
  topicsSelector,
  topics => topics.filter(topic => topic.topLevelPostIds.length > 0)
);

/**
 * A memoized selector that returns the topic ids ordered according to topic timestamp, then createdAt time in ascending
 * order.
 *
 * Selector will only return an array of topic ids.
 */
export const orderedTopicIdsSelector = createSelector(
  nonEmptyTopicsSelector,
  topics => topics
    .sort((topic1, topic2) => {
      if (topic1.timestamp === topic2.timestamp) {
        return topic1.createdTimestamp - topic2.createdTimestamp;
      }
      return topic1.timestamp - topic2.timestamp;
    })
    .keySeq()
    .toArray()
);

/**
 * A memoized selector that return topic objects ordered in ascending order of timestamp, but descending order of
 * createdAt time within each unique timestamp group.
 *
 * Selector returns an Immutable OrderedMap from topic ids to topic objects.
 */
export const inverseCreatedAtOrderedTopicsSelector = createSelector(
  nonEmptyTopicsSelector,
  topics => topics
    .sort((topic1, topic2) => {
      if (topic1.timestamp === topic2.timestamp) {
        return topic2.createdTimestamp - topic1.createdTimestamp;
      }
      return topic1.timestamp - topic2.timestamp;
    })
);
