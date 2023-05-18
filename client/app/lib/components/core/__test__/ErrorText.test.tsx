import { render } from 'test-utils';

import ErrorText from '../ErrorText';

describe('<ErrorText />', () => {
  describe('when input is a string', () => {
    const errors = 'An error.';

    it('displays it', () => {
      expect(render(<ErrorText errors={errors} />)).toMatchSnapshot();
    });
  });

  describe('when input is an array', () => {
    const errors = ['An error.', 'Another error.'];

    it('displays each error', () => {
      expect(render(<ErrorText errors={errors} />)).toMatchSnapshot();
    });
  });
});
