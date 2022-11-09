import MockAdapter from 'axios-mock-adapter';
import { mount } from 'enzyme';

import CourseAPI from 'api/course';
import storeCreator from 'course/lesson-plan/store';

import MilestoneRow from '../MilestoneRow';

const client = CourseAPI.lessonPlan.getClient();
const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
  // add window.matchMedia
  // this is necessary for the date picker to be rendered in desktop mode.
  // if this is not provided, the mobile mode is rendered, which might lead to unexpected behavior
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      media: query,
      // this is the media query that @material-ui/pickers uses to determine if a device is a desktop device
      matches: query === '(pointer: fine)',
      onchange: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

afterEach(() => {
  delete window.matchMedia;
});

const milestoneData = {
  id: 6,
  title: 'Week 1',
  start_at: '2017-01-04T02:03:00.000+08:00',
};

describe('<MilestoneRow />', () => {
  it('allows milestone start_at to be updated', () => {
    mock
      .onPatch(
        `/courses/${courseId}/lesson_plan/milestones/${milestoneData.id}`,
      )
      .reply(200);
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateMilestone');
    const store = storeCreator({ lessonPlan: { milestones: [milestoneData] } });

    const table = mount(
      <table>
        <tbody>
          <MilestoneRow
            groupId="group-id"
            id={milestoneData.id}
            startAt={milestoneData.start_at}
            title={milestoneData.title}
          />
        </tbody>
      </table>,
      buildContextOptions(store),
    );

    const startAtDateInput = table.find('input[name="start_at"]').first();
    const newStartAt = '01-03-2017';
    startAtDateInput.simulate('change', { target: { value: newStartAt } });
    startAtDateInput.simulate('blur');

    expect(spy).toHaveBeenCalledWith(milestoneData.id, {
      lesson_plan_milestone: { start_at: new Date('2017-02-28T18:03:00.000Z') },
    });
  });
});
