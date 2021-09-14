import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import BadgePreview from '../BadgePreview';

describe('<SingleFileInput />', () => {
  it('renders with url and name', () => {
    const badgePreview = mount(
      <BadgePreview originalName="bar" originalUrl="foo" />,
      {
        context: { intl, muiTheme }, // eslint-disable-line no-undef
        childContextTypes: {
          intl: intlShape,
          muiTheme: PropTypes.object,
        },
      }
    );

    const avatar = badgePreview.find('Avatar').first();
    expect(badgePreview.find('.file-name').text().includes('bar')).toEqual(
      true
    );
    expect(avatar.prop('src')).toEqual('foo');
    expect(avatar.prop('icon')).toBeUndefined();
  });

  it('renders a placeholder when no url is provided', () => {
    const badgePreview = mount(<BadgePreview />, {
      context: { intl, muiTheme }, // eslint-disable-line no-undef
      childContextTypes: {
        intl: intlShape,
        muiTheme: PropTypes.object,
      },
    });

    const avatar = badgePreview.find('Avatar').first();
    // SvgIcon is the element of the placeholder 'InsertDriveFileIcon'
    expect(avatar.find('SvgIcon').length).toBe(1);
    // No img element is rendered
    expect(avatar.find('img').length).toBe(0);
  });
});
