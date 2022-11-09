import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import stripHtmlTags from 'lib/helpers/htmlFormatHelpers';

import { annotationShape } from '../propTypes';

const styles = {
  chevron: {
    fontSize: 10,
    marginRight: 5,
    transform: 'rotate(-90deg)',
  },
  postPreview: {
    paddingLeft: 5,
    width: '100%',
  },
};

const VisiblePostPreview = (props) => {
  const { style, creator, text } = props;
  return (
    <div style={{ ...styles.postPreview, ...style }}>
      <span className="fa fa-chevron-down" style={styles.chevron} />
      {`${creator}: ${stripHtmlTags(text)}`}
    </div>
  );
};

VisiblePostPreview.propTypes = {
  style: PropTypes.object,
  annotation: annotationShape.isRequired, // eslint-disable-line react/no-unused-prop-types
  creator: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

VisiblePostPreview.defaultProps = {
  style: {},
};

function mapStateToProps(state, ownProps) {
  const { annotation } = ownProps;
  if (annotation.postIds.length > 0) {
    return {
      creator: state.posts[annotation.postIds[0]].creator.name,
      text: state.posts[annotation.postIds[0]].text,
    };
  }
  return {
    creator: '',
    text: '',
  };
}

const PostPreview = connect(mapStateToProps)(VisiblePostPreview);
export default PostPreview;
