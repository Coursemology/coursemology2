import { sortSurveyElements } from '../index';

describe('sortSurveyElements', () => {
  it('sorts survey elements by weight', () => {
    const inputSurvey = {
      title: 'Sample Survey',
      sections: [
        { id: 1, title: 'Later Section', weight: 1 },
        {
          id: 2,
          title: 'Earlier Section',
          weight: 0,
          questions: [
            { id: 4, description: 'Q3', weight: 2 },
            { id: 5, description: 'Q1', weight: 0 },
            {
              id: 1,
              description: 'Q2',
              weight: 1,
              options: [
                { option: 'Choice 2', weight: 1 },
                { option: 'Choice 1', weight: 0 },
              ],
            },
          ],
        },
      ],
    };

    const outputSurvey = {
      title: 'Sample Survey',
      sections: [
        {
          id: 2,
          title: 'Earlier Section',
          weight: 0,
          questions: [
            { id: 5, description: 'Q1', weight: 0 },
            {
              id: 1,
              description: 'Q2',
              weight: 1,
              options: [
                { option: 'Choice 1', weight: 0 },
                { option: 'Choice 2', weight: 1 },
              ],
            },
            { id: 4, description: 'Q3', weight: 2 },
          ],
        },
        { id: 1, title: 'Later Section', weight: 1 },
      ],
    };

    expect(sortSurveyElements(inputSurvey)).toEqual(outputSurvey);
  });
});
