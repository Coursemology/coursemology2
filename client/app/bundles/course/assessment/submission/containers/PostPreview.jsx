import { connect } from 'react-redux';
import { ChevronRight } from '@mui/icons-material';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

import stripHtmlTags from 'lib/helpers/htmlFormatHelpers';

import { annotationShape } from '../propTypes';

const styles = {
  expand: {
    marginRight: 5,
    transform: 'rotate(-90deg)',
  },
  postPreview: {
    alignItems: 'center',
    display: 'flex',
    paddingLeft: 5,
    width: '100%',
  },
};

const VisiblePostPreview = (props) => {
  const { style, creator, text } = props;
  return (
    <div style={{ ...styles.postPreview, ...style }}>
      <ChevronRight className="mr-2" fontSize="small" />

      <Typography variant="body2">
        {`${creator}: ${stripHtmlTags(text)}`}
      </Typography>
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

function mapStateToProps({ assessments: { submission } }, ownProps) {
  const { annotation } = ownProps;
  if (annotation.postIds.length > 0) {
    return {
      creator: submission.posts[annotation.postIds[0]].creator.name,
      text: submission.posts[annotation.postIds[0]].text,
    };
  }
  return {
    creator: '',
    text: '',
  };
}

const PostPreview = connect(mapStateToProps)(VisiblePostPreview);
export default PostPreview;
