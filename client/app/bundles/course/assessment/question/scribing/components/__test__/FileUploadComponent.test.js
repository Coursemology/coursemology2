import React from 'react';
import shallowUntil from 'utils/shallowUntil';
import FileUploadComponent from '../FileUploadComponent';


describe('<FileUploadComponent />', () => {
  const options = {
    context: { intl },
    childContextTypes: { intl: intlShape },
  };

  it('renders with file name when provided', () => {
    const fileUploadComponent = shallowUntil(
      <FileUploadComponent
        input={{
          value: {
            0: {
              name: 'floor-plan-grid.png',
            },
          },
          onChange: jest.fn(),
        }}
        field="attachment"
        label="Choose File"
      />,
      options,
      'div'
    );

    expect(fileUploadComponent.find('.fileLabel').text().includes('floor-plan-grid.png')).toBeTruthy();
  });
});
