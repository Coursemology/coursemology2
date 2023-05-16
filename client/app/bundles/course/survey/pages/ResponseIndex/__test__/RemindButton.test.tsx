import { fireEvent, render } from 'test-utils';

import CourseAPI from 'api/course';

import RemindButton from '../RemindButton';

describe('<RemindButton />', () => {
  it('renders confirmation dialog that triggers the reminder', () => {
    const spyRemind = jest.spyOn(CourseAPI.survey.surveys, 'remind');
    const page = render(<RemindButton includePhantom />);

    const button = page.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(page.getByText('Cancel'));

    fireEvent.click(button);
    fireEvent.click(page.getByText('Continue'));

    expect(spyRemind).toHaveBeenCalled();
  });
});
