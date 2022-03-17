import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '@material-ui/core';
import Thumbnail from 'lib/components/Thumbnail';

const styles = {
  option: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  optionText: {
    margin: 0,
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

class OptionsListItem extends PureComponent {
  renderGridCard() {
    const { optionText, imageUrl, widget } = this.props;
    return (
      <Card style={styles.gridCard}>
        {imageUrl ? (
          <Thumbnail
            src={imageUrl}
            style={styles.tiledImage}
            containerStyle={styles.tiledImageContainer}
          />
        ) : (
          []
        )}
        <div style={styles.gridOptionBody}>
          {optionText ? (
            <CardContent>
              <p dangerouslySetInnerHTML={{ __html: optionText }} />
            </CardContent>
          ) : null}
          {widget}
        </div>
      </Card>
    );
  }

  renderListItem() {
    const { optionText, imageUrl, widget } = this.props;
    return (
      <div style={styles.option}>
        {widget}
        <>
          {imageUrl ? (
            <Thumbnail
              src={imageUrl}
              style={styles.image}
              containerStyle={styles.imageContainer}
            />
          ) : (
            []
          )}
          <p
            dangerouslySetInnerHTML={{ __html: optionText || null }}
            style={styles.optionText}
          />
        </>
      </div>
    );
  }

  render() {
    if (this.props.grid) {
      return this.renderGridCard();
    }
    return this.renderListItem();
  }
}

OptionsListItem.propTypes = {
  optionText: PropTypes.string,
  imageUrl: PropTypes.string,
  widget: PropTypes.element,
  grid: PropTypes.bool,
};

export default OptionsListItem;
