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
      },
    );

    const img = imagePreview.find('img').first();
    expect(imagePreview.find('.file-name').text()).toContain('bar');
    expect(img.prop('src')).toBe('foo');
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
    expect(imagePreview.find('WithStyles(ForwardRef(SvgIcon))')).toHaveLength(
      1,
    );
    // No img element is rendered
    expect(imagePreview.find('img')).toHaveLength(0);
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
      },
    );

    const img = imagePreview.find('img').first();
    expect(imagePreview.find('.file-name').text()).toContain('non-image file');
    expect(img.prop('src')).toBe('foo');
  });

  it('does not render the delete button when no image is selected', () => {
    const imagePreview = mount(<ImagePreview />, {
      context: { intl, muiTheme }, // eslint-disable-line no-undef
      childContextTypes: {
        intl: intlShape,
        muiTheme: PropTypes.object,
      },
    });

    expect(imagePreview.find('Badge').exists()).toBe(false);
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
      },
    );

    expect(imagePreview.find('ForwardRef(Badge)').exists()).toBe(true);
    imagePreview.find('ForwardRef(IconButton)').simulate('click');
    expect(onCancel).toHaveBeenCalled();
  });
});
