import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import SingleFileInput from '../SingleFileInput';

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
  it('renders with url and name when provided in badge/avatar style', () => {
    const singleFileInput = mount(
      <SingleFileInput
        input={{
          value: {
            url: 'foo',
            name: 'bar',
          },
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
      }
    );

    const avatar = singleFileInput.find('Avatar').first();
    expect(singleFileInput.find('.file-name').text().includes('bar')).toBeTruthy();
    expect(avatar.prop('src')).toEqual('foo');
    expect(avatar.prop('icon')).toBeUndefined();
  });

  it('renders a placeholder when no url is provided in badge/avatar style', () => {
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
      }
    );

    const avatar = singleFileInput.find('Avatar').first();
    // SvgIcon is the element of the placeholder 'InsertDriveFileIcon'
    expect(avatar.find('SvgIcon').length).toBe(1);
    // No img element is rendered
    expect(avatar.find('img').length).toBe(0);
  });

  it('renders with url and name when provided in "isNotBadge" style', () => {
    const singleFileInput = mount(
      <SingleFileInput
        isNotBadge
        input={{
          value: {
            url: 'foo',
            name: 'bar',
          },
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
      }
    );
    const imageSrc = singleFileInput.find('img').first();

    expect(singleFileInput.find('.file-name').text().includes('bar')).toBeTruthy();
    expect(imageSrc.prop('src')).toEqual('foo');
  });

  it('renders a placeholder when no url is provided in "isNotBadge" style', () => {
    const singleFileInput = mount(
      <SingleFileInput
        isNotBadge
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
      }
    );

    // SvgIcon is the element of the placeholder 'InsertDriveFileIcon'
    expect(singleFileInput.find('SvgIcon').length).toBe(1);
    // No img element is rendered
    expect(singleFileInput.find('img').length).toBe(0);
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
            id: 'course.assessment.question.scribing.scribingQuestionForm.fileAttachmentRequired',
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
      }
    );

    expect(singleFileInput.find('.error-message').length).toBe(1);
  });
});
