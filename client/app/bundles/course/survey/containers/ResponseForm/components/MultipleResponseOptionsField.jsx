import { memo } from 'react';
import { Checkbox } from '@mui/material';
import { red } from '@mui/material/colors';
import PropTypes from 'prop-types';

import OptionsListItem from 'course/survey/components/OptionsListItem';
import propsAreEqual from 'lib/components/form/fields/utils/propsAreEqual';

const styles = {
  errorText: {
    color: red[500],
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  listOptionWidget: {
    width: 'auto',
    padding: 0,
  },
  gridOptionWidget: {
    marginTop: 5,
    width: 'auto',
    padding: 0,
  },
};

const MultipleResponseOptionsField = (props) => {
  const {
    disabled,
    field: { onChange, value },
    fieldState: { error },
    question: { grid_view: grid, options },
  } = props;
  return (
    <>
      {error ? <p style={styles.errorText}>{error.message}</p> : null}
      <div style={grid ? styles.grid : {}}>
        {options.map((option) => {
          const widget = (
            <Checkbox
              checked={value.indexOf(option.id) !== -1}
              disabled={disabled}
              onChange={(event, checked) => {
                const newValue = [...value];
                if (checked) {
                  newValue.push(option.id);
                } else {
                  newValue.splice(newValue.indexOf(option.id), 1);
                }
                return onChange(newValue);
              }}
              style={grid ? styles.gridOptionWidget : styles.listOptionWidget}
            />
          );
          const { option: optionText, image_url: imageUrl } = option;
          return (
            <OptionsListItem
              key={option.id}
              {...{ optionText, imageUrl, widget, grid }}
            />
          );
        })}
      </div>
    </>
  );
};

MultipleResponseOptionsField.propTypes = {
  disabled: PropTypes.bool,
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  question: PropTypes.object.isRequired,
};

export default memo(MultipleResponseOptionsField, propsAreEqual);
