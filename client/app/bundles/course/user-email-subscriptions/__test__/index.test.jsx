import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import UserEmailSubscriptions from '../UserEmailSubscriptionsTable';

const state = {
  userEmailSubscriptions: {
    settings: [
      {
        component: 'sample_component',
        course_assessment_category_id: null,
        setting: 'email_for_some_event',
        enabled: false,
      },
    ],
    pageFilter: {
      show_all_settings: true,
      component: null,
      category_id: null,
      setting: null,
    },
  },
};

const expectedPayload = {
  show_all_settings: true,
  component: null,
  category_id: null,
  setting: null,
  user_email_subscriptions: {
    component: 'sample_component',
    course_assessment_category_id: null,
    setting: 'email_for_some_event',
    enabled: true,
  },
};

describe('<UserEmailSubscriptions />', () => {
  it('allow emails subscription settings to be set', async () => {
    const spy = jest.spyOn(CourseAPI.userEmailSubscriptions, 'update');

    const page = render(<UserEmailSubscriptions />, { state });

    const toggle = await page.findByRole('checkbox');
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(expectedPayload);
    });
  });
});
