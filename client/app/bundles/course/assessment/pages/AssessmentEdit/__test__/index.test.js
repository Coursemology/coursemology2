import React from 'react';
import { mount } from 'enzyme';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import CourseAPI from 'api/course';
import storeCreator from '../../../store';
import AssessmentEdit from '../index';

describe('<AssessmentEdit />', () => {
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

  it('renders the edit page', async () => {
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

    const spy = jest.spyOn(CourseAPI.assessment.assessments, 'update');
    const form = editPage.find('form');
    form.simulate('submit');
    expect(spy).toHaveBeenCalledWith(id,
      { assessment: { ...intitialValues, title: newTitle, autograded: true, password: null } });
  });

  it('renders the gamified fields by default', () => {
    const editPage = mount(
      <ProviderWrapper store={store}>
        <AssessmentEdit
          id={id}
          modeSwitching
          initialValues={intitialValues}
        />
      </ProviderWrapper>
    );

    expect(editPage.find('input[name="bonus_end_at"]').length).toBeGreaterThan(0);
    expect(editPage.find('input[name="base_exp"]').length).toBeGreaterThan(0);
    expect(editPage.find('input[name="time_bonus_exp"]').length).toBeGreaterThan(0);
  });

  it('does not render the gamified fields', () => {
    const editPage = mount(
      <ProviderWrapper store={store}>
        <AssessmentEdit
          id={id}
          gamified={false}
          modeSwitching
          initialValues={intitialValues}
        />
      </ProviderWrapper>
    );

    expect(editPage.find('input[name="bonus_end_at"]')).toHaveLength(0);
    expect(editPage.find('input[name="base_exp"]')).toHaveLength(0);
    expect(editPage.find('input[name="time_bonus_exp"]')).toHaveLength(0);
  });
});
