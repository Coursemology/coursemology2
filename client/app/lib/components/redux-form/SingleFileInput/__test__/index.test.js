import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import SingleFileInput from '../index';

const reduxFormFieldMetaDefaults = {
  touched: false,
  active: false,
  autofilled: false,
  asyncValidating: false,
  dirty: false,
  dispatch: () => {},
  error: undefined,
  form: '',
  invalid: false,
  pristine: true,
  submitting: false,
  submitFailed: false,
  valid: true,
  visited: true,
};

describe('<SingleFileInput />', () => {
  it('renders when no previewComponent is provided', () => {
    const singleFileInput = mount(
      <SingleFileInput
        input={{
          value: {},
          onChange: jest.fn(),
        }}
        meta={reduxFormFieldMetaDefaults}
      />,
      {
        context: { intl, muiTheme }, // eslint-disable-line no-undef
        childContextTypes: {
          intl: intlShape,
          muiTheme: PropTypes.object,
        },
      },
    );

    expect(singleFileInput.find('.file-name').exists()).toEqual(true);
  });

  it('renders the provided previewComponent', () => {
    const singleFileInput = mount(
      <SingleFileInput
        input={{
          value: {},
          onChange: jest.fn(),
        }}
        meta={reduxFormFieldMetaDefaults}
        previewComponent={() => <span>Preview</span>}
      />,
      {
        context: { intl, muiTheme }, // eslint-disable-line no-undef
        childContextTypes: {
          intl: intlShape,
          muiTheme: PropTypes.object,
        },
      },
    );

    expect(singleFileInput.find('span').exists()).toEqual(true);
  });

  it('renders required error message', () => {
    const singleFileInput = mount(
      <SingleFileInput
        isNotBadge
        required
        meta={{
          ...reduxFormFieldMetaDefaults,
          touched: true,
          error: {
            id:
              'course.assessment.question.scribing.scribingQuestionForm.fileAttachmentRequired',
            defaultMessage: 'File attachment required.',
          },
        }}
        input={{
          value: {},
          onChange: jest.fn(),
        }}
      />,
      {
        context: { intl, muiTheme }, // eslint-disable-line no-undef
        childContextTypes: {
          intl: intlShape,
          muiTheme: PropTypes.object,
        },
      },
    );

    expect(singleFileInput.find('.error-message').length).toBe(1);
  });
});
