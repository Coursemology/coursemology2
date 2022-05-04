import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import SingleFileInput from '../index';

const reactHookFormControllerFieldStateDefaults = {
  invalid: false,
  isTouched: false,
  isDirty: false,
  error: undefined,
};

describe('<SingleFileInput />', () => {
  it('renders when no previewComponent is provided', () => {
    const singleFileInput = mount(
      <SingleFileInput
        field={{
          value: {},
          onChange: jest.fn(),
        }}
        fieldState={reactHookFormControllerFieldStateDefaults}
      />,
      {
        context: { intl, muiTheme }, // eslint-disable-line no-undef
        childContextTypes: {
          intl: intlShape,
          muiTheme: PropTypes.object,
        },
      },
    );

    expect(singleFileInput.find('.file-name').exists()).toBe(true);
  });

  it('renders the provided previewComponent', () => {
    const singleFileInput = mount(
      <SingleFileInput
        field={{
          value: {},
          onChange: jest.fn(),
        }}
        fieldState={reactHookFormControllerFieldStateDefaults}
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

    expect(singleFileInput.find('span').exists()).toBe(true);
  });

  it('renders required error message', () => {
    const singleFileInput = mount(
      <SingleFileInput
        isNotBadge
        required
        fieldState={{
          ...reactHookFormControllerFieldStateDefaults,
          error: {
            id: 'course.assessment.question.scribing.scribingQuestionForm.fileAttachmentRequired',
            defaultMessage: 'File attachment required.',
          },
        }}
        field={{
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

    expect(singleFileInput.find('.error-message')).toHaveLength(1);
  });
});
