import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import ImagePreview from '../ImagePreview';

const onCancel = jest.fn();
const imageFile = { name: 'foo', type: 'image/jpeg' };

describe('<SingleFileInput />', () => {
  it('renders with url and name', () => {
    const imagePreview = mount(
      <ImagePreview originalName="bar" originalUrl="foo" />,
      {
        context: { intl, muiTheme }, // eslint-disable-line no-undef
        childContextTypes: {
          intl: intlShape,
          muiTheme: PropTypes.object,
        },
      }
    );

    const img = imagePreview.find('img').first();
    expect(
      imagePreview
        .find('.file-name')
        .text()
        .includes('bar')
    ).toEqual(true);
    expect(img.prop('src')).toEqual('foo');
    expect(img.prop('icon')).toBeUndefined();
  });

  it('renders a placeholder when no url is provided', () => {
    const imagePreview = mount(<ImagePreview />, {
      context: { intl, muiTheme }, // eslint-disable-line no-undef
      childContextTypes: {
        intl: intlShape,
        muiTheme: PropTypes.object,
      },
    });

    // SvgIcon is the element of the placeholder 'InsertDriveFileIcon'
    expect(imagePreview.find('SvgIcon').length).toBe(1);
    // No img element is rendered
    expect(imagePreview.find('img').length).toBe(0);
  });

  it('renders a fallback preview when a non-image file is uploaded', () => {
    const imagePreview = mount(
      <ImagePreview
        file={{ name: 'non-image file', type: 'blah' }}
        originalName="bar"
        originalUrl="foo"
      />,
      {
        context: { intl, muiTheme }, // eslint-disable-line no-undef
        childContextTypes: {
          intl: intlShape,
          muiTheme: PropTypes.object,
        },
      }
    );

    const img = imagePreview.find('img').first();
    expect(
      imagePreview
        .find('.file-name')
        .text()
        .includes('non-image file')
    ).toEqual(true);
    expect(img.prop('src')).toEqual('foo');
  });

  it('does not render the delete button when no image is selected', () => {
    const imagePreview = mount(<ImagePreview />, {
      context: { intl, muiTheme }, // eslint-disable-line no-undef
      childContextTypes: {
        intl: intlShape,
        muiTheme: PropTypes.object,
      },
    });

    expect(imagePreview.find('Badge').exists()).toEqual(false);
  });

  it('calls the cancel function when delete button is clicked', () => {
    const imagePreview = mount(
      <ImagePreview file={imageFile} handleCancel={onCancel} />,
      {
        context: { intl, muiTheme }, // eslint-disable-line no-undef
        childContextTypes: {
          intl: intlShape,
          muiTheme: PropTypes.object,
        },
      }
    );

    expect(imagePreview.find('Badge').exists()).toEqual(true);
    imagePreview.find('IconButton').simulate('click');
    expect(onCancel).toHaveBeenCalled();
  });
});
