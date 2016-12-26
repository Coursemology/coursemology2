/**
 * This method transforms a lesson plan item type into a standard string that is used as
 * a key when applying the filter
 *
 * @param {Array<String>}
 * @return {String}
 */
const lessonPlanItemTypeKey = type => type.reverse().join(' - ');

export default lessonPlanItemTypeKey;
