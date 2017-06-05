import moment from 'lib/moment';

/**
 * Adds a new attribute itemTypeKey to the lesson plan item.
 * itemTypeKey has two functions:
 * 1. It serves as key for the visibilityByType hash
 * 2. It is used as the display string for the 'type' of the item.
 */
export function generateTypeKey(item) {
  return {
    ...item,
    itemTypeKey: item.lesson_plan_item_type.join(': '),
  };
}

function sortByStartAt(a, b) {
  const aStartAt = moment(a.start_at);
  if (aStartAt.isAfter(b.start_at)) {
    return 1;
  } else if (aStartAt.isBefore(b.start_at)) {
    return -1;
  }
  return 0;
}

/**
 * Groups lesson plan items under their respective milestones.
 * An item falls under a milestone if the milestone is the latest milestone
 * to have an earlier start_at date-time than the item.
 * Items that precedes all milestones are grouped with an empty milestone.
 *
 * @param {Array} items
 * @param {Array} milestones
 * @return {Array.<{ milestone: Object, items: Array }>}
 */
export function groupItemsUnderMilestones(items, milestones) {
  const sortedItems = [...items].sort(sortByStartAt);
  const sortedMilestones = [...milestones].sort(sortByStartAt);

  const groups = [];
  const group = { id: null, milestone: null, items: [] };

  // Adds current group to groups and resets group
  const addGroup = () => {
    if (group.items.length > 0 || group.milestone) {
      const milestoneId = group.milestone ? group.milestone.id : 'ungrouped';
      group.id = `milestone-group-${milestoneId}`;
      groups.push({ ...group });

      group.id = null;
      group.milestone = null;
      group.items = [];
    }
  };

  sortedMilestones.forEach((milestone) => {
    // Group items that come before the current milestone under the previous milestone
    while (
      sortedItems.length > 0 &&
      moment(sortedItems[0].start_at).isBefore(milestone.start_at)
    ) {
      group.items.push(sortedItems.shift());
    }
    // Finalize the group, then start a new group with the current milestone
    addGroup();
    group.milestone = milestone;
  });
  // The remaining items belong with the last milestone
  group.items = group.items.concat(sortedItems);
  addGroup();

  return groups;
}

/**
 * Generates a hash that indicates the visibility of each item type, e.g. :
 *   { "Training: Extra": false, "Recitation": true }
 * All items are visible by default.
 *
 * @param {Array} items
 * @return {Object}
 */
export function initializeVisibility(items) {
  const itemTypes = new Set(items.map(item => item.itemTypeKey));
  const visibility = {};
  itemTypes.forEach(itemType => (visibility[itemType] = true));
  return visibility;
}
