import React from 'react';
import { Router, createMemoryHistory } from 'react-router';
import { mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';
import routes from 'course/survey/routes';

// Mock axios
const client = CourseAPI.survey.surveys.getClient();
const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
});

describe('Surveys', () => {
  it('renders the index page and survey form', async () => {
    mock.onGet(`/courses/${courseId}/surveys`)
      .reply(200, {
        surveys: [{
          id: 1,
          base_exp: 20,
          canViewResults: true,
          title: 'First Survey',
          published: true,
          start_at: '2017-02-27T00:00:00.000+08:00',
          end_at: '2017-03-12T23:59:00.000+08:00',
          response: null,
        }],
        canCreate: true,
      });
    // Set the route to index page
    const history = createMemoryHistory(`/courses/${courseId}/surveys`);

    const spyIndex = jest.spyOn(CourseAPI.survey.surveys, 'index');
    const store = storeCreator({ surveys: {} });

    const indexPage = mount(
      <ProviderWrapper store={store}>
        <Router routes={routes} history={history} />
      </ProviderWrapper>
    );

    // Wait for api call
    await sleep(1);
    expect(spyIndex).toHaveBeenCalled();
    expect(indexPage.find('AddButton').length).toBe(1);
    expect(indexPage.find('Table')).toHaveLength(1);
  });
});
