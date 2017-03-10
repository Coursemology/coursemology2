import React from 'react';
import { mount } from 'enzyme';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import CourseAPI from 'api/course';
import storeCreator from '../../../store';
import AssessmentEdit from '../index';

// summernote does not work well with jsdom in tests, stub it to normal text field.
jest.mock('lib/components/redux-form/RichTextField', () => {
  const TextField = require.requireActual('lib/components/redux-form/TextField');
  return TextField;
});

describe('<AssessmentEdit />', () => {
  it('renders the edit page', async () => {
    const store = storeCreator({});
    const id = 1;
    const intitialValues = {
      id,
      title: 'Assessement',
      description: 'Awesome assessment',
      autograded: false,
      start_at: new Date(),
      base_exp: 0,
      time_bonus_exp: 0,
    };
    const editPage = mount(
      <ProviderWrapper store={store}>
        <AssessmentEdit
          id={id}
          modeSwitching
          initialValues={intitialValues}
        />
      </ProviderWrapper>
    );

    const autogradedInput = editPage.find('input[name="autograded"]');
    expect(autogradedInput.props().value).toBeFalsy();

    expect(editPage.find('SelectField')).toHaveLength(1); // layout select field
    expect(editPage.find('input[name="password_protected"]')).toHaveLength(1);
    expect(editPage.find('input[name="skippable"]')).toHaveLength(0);

    // Enable autograded field
    autogradedInput.simulate('change', { target: { value: true } });
    expect(editPage.find('input[name="password_protected"]')).toHaveLength(0);
    expect(editPage.find('SelectField')).toHaveLength(0);
    expect(editPage.find('input[name="skippable"]')).toHaveLength(1);

    // Change title
    const newTitle = 'New Title';
    const titleInput = editPage.find('input[name="title"]');
    titleInput.simulate('change', { target: { value: newTitle } });

    const spy = jest.spyOn(CourseAPI.assessments, 'update');
    const form = editPage.find('form');
    form.simulate('submit');
    expect(spy).toHaveBeenCalledWith(id,
      { assessment: { ...intitialValues, title: newTitle, autograded: true, password: null } });
  });
});
