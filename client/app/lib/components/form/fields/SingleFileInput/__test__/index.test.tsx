import { ComponentType, useEffect } from 'react';
import { Controller, FieldError, useForm } from 'react-hook-form';
import { mount } from 'enzyme';

import SingleFileInput, { PreviewComponentProps } from '../index';

interface TestFormValues {
  file: {
    file?: File | null;
    url?: string;
    name?: string;
  };
}

const TestForm = ({
  previewComponent,
}: {
  previewComponent?: ComponentType<PreviewComponentProps>;
}): JSX.Element => {
  const { control } = useForm<TestFormValues>({
    defaultValues: { file: {} },
  });
  return (
    <Controller
      control={control}
      name="file"
      render={({ field, fieldState }): JSX.Element => (
        <SingleFileInput
          field={field}
          fieldState={fieldState}
          previewComponent={previewComponent}
        />
      )}
    />
  );
};

const TestFormWithError = ({ error }: { error: FieldError }): JSX.Element => {
  const { control, setError } = useForm<TestFormValues>({
    defaultValues: { file: {} },
  });

  useEffect(() => {
    setError('file', error);
  }, []);

  return (
    <Controller
      control={control}
      name="file"
      render={({ field, fieldState }): JSX.Element => (
        <SingleFileInput field={field} fieldState={fieldState} />
      )}
    />
  );
};

describe('<SingleFileInput />', () => {
  it('renders when no previewComponent is provided', () => {
    const wrapper = mount(<TestForm />, buildContextOptions());

    expect(wrapper.find('.file-name').exists()).toBe(true);
  });

  it('renders the provided previewComponent', () => {
    const wrapper = mount(
      <TestForm previewComponent={() => <span>Preview</span>} />,
      buildContextOptions(),
    );

    expect(wrapper.find('span').exists()).toBe(true);
  });

  it('renders required error message', () => {
    const error: FieldError = {
      type: 'required',
      message: 'File attachment required.',
    };
    const wrapper = mount(
      <TestFormWithError error={error} />,
      buildContextOptions(),
    );
    wrapper.update();

    expect(wrapper.find('.error-message')).toHaveLength(1);
  });
});
