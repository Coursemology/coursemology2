import { memo } from 'react';
import PropTypes from 'prop-types';
import { Radio } from '@mui/material';
import { red } from '@mui/material/colors';
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

const MultipleChoiceOptionsField = (props) => {
  const {
    disabled,
    field: { onChange, value },
    fieldState: { error },
    question: { grid_view: grid, options },
  } = props;
  const selectedOption = value && value.length > 0 && value[0];

  return (
    <>
      {error ? <p style={styles.errorText}>{error.message}</p> : null}
      <div style={grid ? styles.grid : {}}>
        {options.map((option) => {
          const { option: optionText, image_url: imageUrl } = option;
          const id = option.id;
          const widget = (
            <Radio
              value={id}
              style={grid ? styles.gridOptionWidget : styles.listOptionWidget}
              onChange={(event) => onChange([parseInt(event.target.value, 10)])}
              checked={id === selectedOption}
              disabled={disabled}
            />
          );
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

MultipleChoiceOptionsField.propTypes = {
  disabled: PropTypes.bool,
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  question: PropTypes.object.isRequired,
};

export default memo(MultipleChoiceOptionsField, propsAreEqual);
