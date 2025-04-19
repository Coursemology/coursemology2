import { render, waitForElementToBeRemoved } from 'test-utils';

import ErrorText from '../ErrorText';

describe('<ErrorText />', () => {
  describe('when input is a string', () => {
    const errors = 'An error.';

    it('displays it', async () => {
      const page = render(<ErrorText errors={errors} />);
      await waitForElementToBeRemoved(page.getByRole('progressbar'));

      expect(page).toMatchSnapshot();
    });
  });

  describe('when input is an array', () => {
    const errors = ['An error.', 'Another error.'];

    it('displays each error', async () => {
      const page = render(<ErrorText errors={errors} />);
      await waitForElementToBeRemoved(page.getByRole('progressbar'));

      expect(page).toMatchSnapshot();
    });
  });
});
