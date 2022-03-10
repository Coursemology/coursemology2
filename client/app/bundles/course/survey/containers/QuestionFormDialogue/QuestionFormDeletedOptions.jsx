import { Component } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Radio } from '@material-ui/core';
import { Checkbox } from '@mui/material';
import { grey } from '@mui/material/colors';
import Close from '@material-ui/icons/Close';
import Thumbnail from 'lib/components/Thumbnail';

const styles = {
  option: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  widget: {
    padding: 0,
    width: 'auto',
  },
  optionBody: {
    color: grey[600],
    width: '60%',
  },
  image: {
    maxHeight: 48,
    maxWidth: 48,
  },
  imageContainer: {
    marginRight: 24,
    height: 48,
    width: 48,
  },
  imageSpacer: {
    width: 72,
  },
};

class QuestionFormDeletedOptions extends Component {
  renderWidget() {
    const { multipleResponse, multipleChoice } = this.props;
    let widget = null;
    if (multipleChoice) {
      widget = <Radio disabled style={styles.widget} />;
    } else if (multipleResponse) {
      widget = <Checkbox disabled style={styles.widget} />;
    }
    return widget;
  }

  render() {
    const { fields, disabled, addToOptions } = this.props;

    // eslint-disable-next-line react/prop-types
    if (!fields || fields.length < 1) {
      return null;
    }

    return (
      <>
        {fields.map((member, index) => {
          const option = fields.get(index);
          const handleRestore = () => {
            fields.remove(index);
            addToOptions(option);
          };

          return (
            <div style={styles.option} key={option.id}>
              {this.renderWidget()}
              {option.image_url ? (
                <Thumbnail
                  src={option.image_url}
                  style={styles.image}
                  containerStyle={styles.imageContainer}
                />
              ) : (
                <div style={styles.imageSpacer} />
              )}
              <span style={styles.optionBody}>{option.option}</span>
              <IconButton disabled={disabled} onClick={handleRestore}>
                <Close htmlColor={disabled ? undefined : grey[600]} />
              </IconButton>
            </div>
          );
        })}
      </>
    );
  }
}

QuestionFormDeletedOptions.propTypes = {
  multipleResponse: PropTypes.bool,
  multipleChoice: PropTypes.bool,
  disabled: PropTypes.bool,
  addToOptions: PropTypes.func.isRequired,
  fields: PropTypes.shape({
    map: PropTypes.func.isRequired,
    get: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
  }).isRequired,
};

export default QuestionFormDeletedOptions;
