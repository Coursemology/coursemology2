import { createStore, combineReducers } from 'redux';
import { mount } from 'enzyme';
import { reduxForm, reducer as formReducer, submit } from 'redux-form';
import { SubmissionError } from 'lib/redux-form';

describe('SubmissionError', () => {
  describe('when no ActiveModel base errors are present', () => {
    const errors = { title: 'is absent' };

    it('makes no change', () => {
      expect(new SubmissionError(errors).errors).toEqual(errors);
    });
  });

  describe('when ActiveModel base errors are present', () => {
    const baseError = 'Whole form wrong!';
    const errors = { title: 'is absent', base: baseError };

    it('copies ActiveModel base errors to it', () => {
      expect(new SubmissionError(errors).errors).toEqual({
        ...errors,
        _error: baseError,
      });
    });

    it('is caught and displayed by redux-form', () => {
      const DummyForm = reduxForm({
        form: 'dummy',
      })(({ error, handleSubmit }) => (
        <form onSubmit={handleSubmit}>{error}</form>
      ));
      const dummyStore = createStore(
        combineReducers({ form: formReducer }),
        {},
      );
      const wrapper = mount(
        <DummyForm
          onSubmit={() => {
            throw new SubmissionError(errors);
          }}
        />,
        buildContextOptions(dummyStore),
      );

      dummyStore.dispatch(submit('dummy'));
      wrapper.update();
      expect(wrapper.text()).toEqual(baseError);
    });
  });
});
