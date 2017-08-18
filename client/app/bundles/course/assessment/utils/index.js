/**
 * Formats form label for selecting tabs in assessments. Handles labels differently for default
 * tabs.
 *
 * @param {String} categoryTitle Title of the tab.
 * @param {String} categoryTitle Title of the category which the tab is in.
 * @param {Boolean} onlyTab Whether the given tab is the only tab of the given category.
 * @return {String} The form label to use for the specific tab.
 */
export const categoryAndTabTitle = (category, tab, onlyTab) =>
                                   (onlyTab ? category : `${category} > ${tab}`);

/**
 * Maps the received Category APIs for rendering in the AssessmentForm.
 * Assumes that the response sorts categories and tabs by weight.
 *
 * Sample API Response:
 *  [
 *    { id: 1, title: 'Missions', weight: 0,
 *      tabs: [ { id: 1, title: 'Easy', weight: 1 }, { id: 2, title: 'Dangerous', weight: 4 } ]
 *    },
 *    { id: 3, title: 'Trainings', weight: 2,
 *      tabs: [ { id: 6, title: 'Lectures', weight: 2 }, { id: 7, title: 'Practice', weight: 3 } ]
 *    },
 *    { id: 7, title: 'Myths', weight: 3,
 *      tabs: [ { id: 20, title: 'Default', weight: 0 } ]
 *    },
 *  ]
 *
 * Sample Output (Ordered by Category weights, then Tab weights):
 *  [
 *    { tab_id: 1, title: 'Missions > Easy' },
 *    { tab_id: 2, title: 'Missions > Dangerous' },
 *    { tab_id: 6, title: 'Trainings > Lectures' },
 *    { tab_id: 7, title: 'Trainings > Practice' },
 *    { tab_id: 20, title: 'Myths' }
 *  ]
 *
 * @param {Object} API Response
 * @return {Object} The updated item
 */
export const mapCategoriesData = (response) => {
  const tabs = [];
  response.forEach((category) => {
    const onlyTab = !(category.tabs.length > 1);
    category.tabs.forEach((tab) => {
      const title = categoryAndTabTitle(category.title, tab.title, onlyTab);
      tabs.push({ tab_id: tab.id, title });
    });
  });

  return tabs;
};
