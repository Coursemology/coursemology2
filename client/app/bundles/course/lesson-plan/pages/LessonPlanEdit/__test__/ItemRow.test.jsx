import React from 'react';
import { mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import CourseAPI from 'api/course';
import storeCreator from 'course/lesson-plan/store';
import ItemRow from '../ItemRow';

const client = CourseAPI.lessonPlan.getClient();
const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
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
    mock.onPatch(`/courses/${courseId}/lesson_plan/items/${itemData.id}`).reply(200);
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateItem');
    const store = storeCreator({
      visibilityByType: { [itemData.itemTypeKey]: true },
      items: [itemData],
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
      buildContextOptions(store)
    );

    const startAtDateInput = table.find('input[name="start_at"]').first();
    const newStartAt = '01-02-2017';
    startAtDateInput.simulate('change', { target: { value: newStartAt } });
    startAtDateInput.simulate('blur');

    expect(spy).toHaveBeenCalledWith(
      itemData.id,
      {
        item: {
          start_at: '2017-01-31T18:03:00.000Z',
          bonus_end_at: '2017-02-02T18:03:00.000Z',
          end_at: '2017-02-04T18:03:00.000Z',
        },
      }
    );
  });
});
