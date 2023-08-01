import { PureComponent } from 'react';
import { CardContent, CardHeader, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import Link from 'lib/components/core/Link';

import Chips from './Chips';

class Details extends PureComponent {
  renderDescription() {
    const { description } = this.props;
    if (!description) {
      return null;
    }
    return (
      <CardContent>
        <Typography
          dangerouslySetInnerHTML={{ __html: description }}
          variant="body2"
        />
      </CardContent>
    );
  }

  renderTitle() {
    const { title, itemPath } = this.props;
    return (
      <CardHeader
        title={
          <Link to={itemPath} underline="hover" variant="h6">
            {title}
          </Link>
        }
      />
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
