import React from 'react';
import { shallow } from 'enzyme';
import ErrorText from '../ErrorText';

describe('<ErrorText />', () => {
  describe('when input is a string', () => {
    const errors = 'An error.';

    it('displays it', () => {
      expect(shallow(<ErrorText errors={errors} />)).toMatchSnapshot();
    });
  });

  describe('when input is an array', () => {
    const errors = ['An error.', 'Another error.'];

    it('displays each error', () => {
      expect(shallow(<ErrorText errors={errors} />)).toMatchSnapshot();
    });
  });
});
