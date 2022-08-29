import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import CourseAPI from 'api/course';
import storeCreator from '../../../store';
import AssessmentEdit from '../index';

describe('<AssessmentEdit />', () => {
  const store = storeCreator({});
  const id = 1;
  const initialValues = {
    id,
    title: 'Assessement',
    description: 'Awesome assessment',
    autograded: false,
    start_at: new Date(),
    base_exp: 0,
    time_bonus_exp: 0,
    use_public: true,
    use_private: true,
    use_evaluation: true,
    tabs: [{ tab_id: 0, tab_title: 'test' }],
  };

  it('renders the edit page', async () => {
    const editPage = mount(
      <ProviderWrapper store={store}>
        <AssessmentEdit id={id} modeSwitching initialValues={initialValues} />
      </ProviderWrapper>,
    );

    const autogradedInput = editPage.find('input[name="autograded"]');
    expect(autogradedInput.props().value).toBeFalsy();

    // Select field for Tab and Layout
    expect(editPage.find('FormSelectField')).toHaveLength(2);
    expect(editPage.find('input[name="password_protected"]')).toHaveLength(1);
    expect(editPage.find('input[name="skippable"]')).toHaveLength(0);

    // Enable autograded field
    autogradedInput.simulate('change', { target: { value: true } });
    await sleep(0.01);
    expect(editPage.find('FormSelectField')).toHaveLength(1); // Only Tab, no more Layout Field
    expect(editPage.find('input[name="password_protected"]')).toHaveLength(0);
    expect(editPage.find('input[name="skippable"]')).toHaveLength(1);

    // Change title
    const newTitle = 'New Title';
    const titleInput = editPage.find('input[name="title"]');
    titleInput.simulate('change', { target: { value: newTitle } });
    await sleep(0.01);

    const spy = jest.spyOn(CourseAPI.assessment.assessments, 'update');
    const form = editPage.find('form');
    await act(async () => {
      form.simulate('submit');
    });
    expect(spy).toHaveBeenCalledWith(id, {
      assessment: {
        ...initialValues,
        title: newTitle,
        autograded: true,
        view_password: null,
        session_password: null,
      },
    });
  });
});
