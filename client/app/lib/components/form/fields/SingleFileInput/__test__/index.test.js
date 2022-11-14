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
      buildContextOptions(),
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
      buildContextOptions(),
    );

    expect(singleFileInput.find('span').exists()).toBe(true);
  });

  it('renders required error message', () => {
    const singleFileInput = mount(
      <SingleFileInput
        field={{
          value: {},
          onChange: jest.fn(),
        }}
        fieldState={{
          ...reactHookFormControllerFieldStateDefaults,
          error: {
            id: 'course.assessment.question.scribing.scribingQuestionForm.fileAttachmentRequired',
            defaultMessage: 'File attachment required.',
          },
        }}
        isNotBadge
        required
      />,
      buildContextOptions(),
    );

    expect(singleFileInput.find('.error-message')).toHaveLength(1);
  });
});
