import { mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import CourseAPI from 'api/course';
import storeCreator from 'course/lesson-plan/store';
import ItemRow from '../ItemRow';

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

const itemData = {
  id: 9,
  published: false,
  itemTypeKey: 'Other',
  title: 'Other Event',
  start_at: '2017-01-04T02:03:00.000+08:00',
  bonus_end_at: '2017-01-06T02:03:00.000+08:00',
  end_at: '2017-01-08T02:03:00.000+08:00',
};

describe('<ItemRow />', () => {
  it('shifts end dates when start date is shifted', () => {
    mock
      .onPatch(`/courses/${courseId}/lesson_plan/items/${itemData.id}`)
      .reply(200);
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateItem');
    const store = storeCreator({
      lessonPlan: {
        visibilityByType: { [itemData.itemTypeKey]: true },
        items: [itemData],
      },
    });

    const table = mount(
      <table>
        <tbody>
          <ItemRow
            id={itemData.id}
            type={itemData.itemTypeKey}
            title={itemData.title}
            startAt={itemData.start_at}
            bonusEndAt={itemData.bonus_end_at}
            endAt={itemData.end_at}
            published={itemData.published}
          />
        </tbody>
      </table>,
      buildContextOptions(store),
    );

    const startAtDateInput = table.find('input[name="start_at"]').first();
    const newStartAt = '01-02-2017';
    startAtDateInput.simulate('change', { target: { value: newStartAt } });
    startAtDateInput.simulate('blur');

    expect(spy).toHaveBeenCalledWith(itemData.id, {
      item: {
        start_at: '2017-01-31T18:03:00.000Z',
        bonus_end_at: '2017-02-02T18:03:00.000Z',
        end_at: '2017-02-04T18:03:00.000Z',
      },
    });
  });

  it('clears end date', () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateItem');
    const store = storeCreator({
      lessonPlan: {
        visibilityByType: { [itemData.itemTypeKey]: true },
        items: [itemData],
      },
    });

    const table = mount(
      <table>
        <tbody>
          <ItemRow
            id={itemData.id}
            type={itemData.itemTypeKey}
            title={itemData.title}
            startAt={itemData.start_at}
            bonusEndAt={itemData.bonus_end_at}
            endAt={itemData.end_at}
            published={itemData.published}
          />
        </tbody>
      </table>,
      buildContextOptions(store),
    );

    const endAtDateInput = table.find('input[name="end_at"]').first();
    endAtDateInput.simulate('change', { target: { value: '' } });
    endAtDateInput.simulate('blur');

    expect(spy).toHaveBeenCalledWith(itemData.id, {
      item: {
        end_at: null,
      },
    });
  });
});
