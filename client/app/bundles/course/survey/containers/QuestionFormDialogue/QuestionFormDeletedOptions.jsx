import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';
import RadioButton from 'material-ui/RadioButton';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import { grey600 } from 'material-ui/styles/colors';
import Thumbnail from 'course/survey/components/Thumbnail';

const styles = {
  option: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  widget: {
    width: 'auto',
  },
  optionBody: {
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

class QuestionFormDeletedOptions extends React.Component {
  renderWidget() {
    const { multipleResponse, multipleChoice } = this.props;
    let widget = null;
    if (multipleChoice) {
      widget = <RadioButton disabled style={styles.widget} />;
    } else if (multipleResponse) {
      widget = <Checkbox disabled style={styles.widget} />;
    }
    return widget;
  }

  render() {
    const { fields, disabled, addToOptions } = this.props;


    if (!fields || fields.length < 1) {
      return null;
    }

    return (
      <div>
        {fields.map((member, index) => {
          const option = fields.get(index);
          const handleRestore = () => {
            fields.remove(index);
            addToOptions(option);
          };

          return (
            <div style={styles.option} key={option.id}>
              {this.renderWidget()}
              {
                option.image_url ?
                  <Thumbnail
                    src={option.image_url}
                    style={styles.image}
                    containerStyle={styles.imageContainer}
                  /> :
                  <div style={styles.imageSpacer} />
              }
              <span style={styles.optionBody}>{option.option}</span>
              <IconButton onTouchTap={handleRestore} {...{ disabled }}>
                <CloseIcon color={grey600} />
              </IconButton>
            </div>
          );
        })}
      </div>
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
