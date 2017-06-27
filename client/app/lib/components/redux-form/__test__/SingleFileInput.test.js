import React from 'react';
import InsertDriveFileIcon from 'material-ui/svg-icons/editor/insert-drive-file';
import shallowUntil from 'utils/shallowUntil';
import SingleFileInput from '../SingleFileInput';


describe('<SingleFileInput />', () => {
  const options = {
    context: { intl },
    childContextTypes: { intl: intlShape },
  };

  it('renders with url and name when provided', () => {
    const singleFileInput = shallowUntil(
      <SingleFileInput
        input={{
          value: {
            url: 'foo',
            name: 'bar',
          },
          onChange: jest.fn(),
        }}
      />,
      options,
      'div'
    );
    const avatar = singleFileInput.find('Avatar').first();

    expect(singleFileInput.find('.file-name').text().includes('bar')).toBeTruthy();
    expect(avatar.prop('src')).toEqual('foo');
    expect(avatar.prop('icon')).toBeUndefined();
  });

  it('renders a placeholder when no url is provided', () => {
    const singleFileInput = shallowUntil(
      <SingleFileInput
        input={{
          value: {},
          onChange: jest.fn(),
        }}
      />,
      options,
      'div'
    );

    const avatar = singleFileInput.find('Avatar').first();
    expect(avatar.prop('icon')).toEqual(<InsertDriveFileIcon />);
    expect(avatar.prop('src')).toBeUndefined();
  });
});
