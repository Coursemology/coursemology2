import { fireEvent, render } from 'test-utils';

import CourseAPI from 'api/course';
import { CourseUserType } from 'lib/components/core/CourseUserTypeTabs';

import RemindButton from '../RemindButton';

describe('<RemindButton />', () => {
  it('renders confirmation dialog that triggers the reminder', async () => {
    const spyRemind = jest.spyOn(CourseAPI.survey.surveys, 'remind');
    const page = render(<RemindButton userType={CourseUserType.STUDENTS} />);

    const button = await page.findByRole('button');
    fireEvent.click(button);
    fireEvent.click(page.getByText('Cancel'));

    fireEvent.click(button);
    fireEvent.click(page.getByText('Continue'));

    expect(spyRemind).toHaveBeenCalled();
  });
});
