import { mapCategoriesData, categoryAndTabTitle } from '../index';

describe('mapCategoriesData', () => {
  it('maps the categories accurately to tabs', () => {
    const inputCategories = [
      {
        id: 1,
        title: 'Missions',
        weight: 0,
        tabs: [
          { id: 1, title: 'Easy', weight: 1 },
          { id: 2, title: 'Dangerous', weight: 4 },
        ],
      },
      {
        id: 3,
        title: 'Trainings',
        weight: 2,
        tabs: [
          { id: 6, title: 'Lectures', weight: 2 },
          { id: 7, title: 'Practice', weight: 3 },
        ],
      },
      {
        id: 7,
        title: 'Myths',
        weight: 3,
        tabs: [{ id: 20, title: 'Default', weight: 0 }],
      },
    ];

    const outputTabs = [
      { tab_id: 1, title: 'Missions > Easy' },
      { tab_id: 2, title: 'Missions > Dangerous' },
      { tab_id: 6, title: 'Trainings > Lectures' },
      { tab_id: 7, title: 'Trainings > Practice' },
      { tab_id: 20, title: 'Myths' },
    ];

    expect(mapCategoriesData(inputCategories)).toEqual(outputTabs);
  });
});

describe('categoryAndTabTitle', () => {
  it('returns the correct combined tab title', () => {
    const title1 = 'Foo';
    const title2 = 'Bar';

    expect(categoryAndTabTitle(title1, title2, true)).toEqual(title1);
    expect(categoryAndTabTitle(title1, title2, false)).toEqual(
      `${title1} > ${title2}`
    );
  });
});
