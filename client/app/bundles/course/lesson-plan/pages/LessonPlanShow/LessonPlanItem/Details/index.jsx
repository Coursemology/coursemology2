import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { CardText, CardTitle } from 'material-ui/Card';
import Chips from './Chips';

class Details extends PureComponent {
  renderDescription() {
    const { description } = this.props;
    if (!description) {
      return null;
    }
    return <CardText dangerouslySetInnerHTML={{ __html: description }} />;
  }

  renderTitle() {
    const { title, itemPath } = this.props;
    return (
      <CardTitle title={itemPath ? <a href={itemPath}>{title}</a> : title} />
    );
  }

  render() {
    const { published, itemType, startAt, endAt, location } = this.props;
    return (
      <>
        {this.renderTitle()}
        <Chips {...{ published, itemType, startAt, endAt, location }} />
        {this.renderDescription()}
      </>
    );
  }
}

Details.propTypes = {
  title: PropTypes.string.isRequired,
  itemPath: PropTypes.string,
  description: PropTypes.string,
  published: PropTypes.bool,
  itemType: PropTypes.string.isRequired,
  startAt: PropTypes.string.isRequired,
  endAt: PropTypes.string,
  location: PropTypes.string,
};

export default Details;
