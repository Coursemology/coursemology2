import React from 'react';
import { mount } from 'enzyme';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import CourseAPI from 'api/course';
import storeCreator from '../../../store';
import AchievementEdit from '../index';

// summernote does not work well with jsdom in tests, stub it to normal text field.
jest.mock('lib/components/redux-form/RichTextField', () => {
  const TextField = require.requireActual('lib/components/redux-form/TextField');
  return TextField;
});

describe('<AchievementEdit />', () => {
  const store = storeCreator({});
  const id = 1;
  const intitialValues = {
    id,
    title: 'Achievmeent',
    description: 'Awesome achievmeent',
    published: false,
    badge: {
      name: 'Foo',
      url: 'fake.url/picture.jpg',
    },
  };

  it('renders the edit page', async () => {
    const editPage = mount(
      <ProviderWrapper store={store}>
        <AchievementEdit
          id={id}
          initialValues={intitialValues}
        />
      </ProviderWrapper>
    );

    const publishedInput = editPage.find('input[name="published"]');
    expect(publishedInput.props().value).toBeFalsy();

    // Change title
    const newTitle = 'New Title';
    const titleInput = editPage.find('input[name="title"]');
    titleInput.simulate('change', { target: { value: newTitle } });

    const spy = jest.spyOn(CourseAPI.achievements, 'update');
    const form = editPage.find('form');
    form.simulate('submit');

    // Check that API call is made.
    const formData = new FormData();
    formData.append('achievement[title]', newTitle);
    expect(spy).toHaveBeenCalledWith(id, formData);
  });
});
