import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import ColorPickerField from 'course/assessment/submission/components/ScribingView/fields/ColorPickerField';

const props = {
  onClickColorPicker: jest.fn(),
  colorPickerPopoverOpen: true,
  colorPickerPopoverAnchorEl: {
    getBoundingClientRect: jest.fn(),
  },
  onRequestCloseColorPickerPopover: jest.fn(),
  colorPickerColor: 'rgba(0,0,0,0)',
  onChangeCompleteColorPicker: jest.fn(),
  noFillValue: true,
  noFillOnCheck: jest.fn(),
};

props.colorPickerPopoverAnchorEl.getBoundingClientRect.mockReturnValue({
  top: 0,
  left: 0,
  width: 100,
  height: 100,
});

describe('ColorPickerField', () => {
  it('checks no fill checkbox when noFillValue is true', async () => {
    const colorPickerField = mount(
      <ColorPickerField {...props} />,
      {
        context: { intl, muiTheme }, // eslint-disable-line no-undef
        childContextTypes: {
          intl: intlShape,
          muiTheme: PropTypes.object,
        },
      });

    expect(colorPickerField.find('Checkbox').prop('checked')).toEqual(true);
  });
});
