import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardText } from 'material-ui/Card';
import Thumbnail from './Thumbnail';

const styles = {
  option: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
  },
  image: {
    maxHeight: 150,
    maxWidth: 400,
  },
  imageContainer: {
    height: 150,
  },
  gridCard: {
    margin: 10,
    padding: 10,
    display: 'flex',
  },
  gridOption: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  gridOptionBody: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tiledImage: {
    maxHeight: 150,
    maxWidth: 150,
  },
  tiledImageContainer: {
    height: 150,
    width: 150,
  },
};

class OptionsListItem extends React.PureComponent {
  static propTypes = {
    optionText: PropTypes.string,
    imageUrl: PropTypes.string,
    widget: PropTypes.element,
    grid: PropTypes.bool,
  };

  renderGridCard() {
    const { optionText, imageUrl, widget } = this.props;
    return (
      <Card
        style={styles.gridCard}
        containerStyle={styles.gridOption}
      >
        { imageUrl ?
          <Thumbnail
            src={imageUrl}
            style={styles.tiledImage}
            containerStyle={styles.tiledImageContainer}
          /> : [] }
        <div style={styles.gridOptionBody}>
          { optionText ? <CardText>{optionText}</CardText> : null }
          { widget }
        </div>
      </Card>
    );
  }

  renderListItem() {
    const { optionText, imageUrl, widget } = this.props;
    return (
      <div style={styles.option}>
        { widget }
        <div>
          { imageUrl ?
            <Thumbnail
              src={imageUrl}
              style={styles.image}
              containerStyle={styles.imageContainer}
            /> : [] }
          { optionText || null }
        </div>
      </div>
    );
  }

  render() {
    if (this.props.grid) { return this.renderGridCard(); }
    return this.renderListItem();
  }
}

export default OptionsListItem;
