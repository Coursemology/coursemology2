import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

import { formatLongDateTime } from 'lib/moment';

const MAX_POST_HEIGHT = 60;

export const translations = defineMessages({
  showMore: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumPost.showMore',
    defaultMessage: 'SHOW MORE',
  },
  showLess: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumPost.showLess',
    defaultMessage: 'SHOW LESS',
  },
});

const styles = {
  default: {
    boxShadow: 'none',
    border: '1px solid #B0BEC5',
  },
  expandButton: { marginTop: 8 },
};

export default class ForumPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpandable: false,
      isExpanded: true,
    };
  }

  componentDidMount() {
    const renderedTextHeight = this.divElement.clientHeight;
    this.setState({
      isExpandable:
        this.props.isExpandable && renderedTextHeight > MAX_POST_HEIGHT,
      isExpanded: !this.props.isExpandable,
    });
  }

  render() {
    return (
      <Card
        className="forum-post"
        style={{ ...styles.default, ...this.props.style }}
      >
        <CardHeader
          avatar={<Avatar src={this.props.post.avatar} />}
          subheader={formatLongDateTime(this.props.post.updatedAt)}
          title={this.props.post.userName}
        />
        <Divider />
        <CardContent>
          <Typography
            ref={(divElement) => {
              this.divElement = divElement;
            }}
            dangerouslySetInnerHTML={{ __html: this.props.post.text }}
            style={{
              height:
                this.state.isExpanded || !this.state.isExpandable
                  ? 'auto'
                  : MAX_POST_HEIGHT,
              overflow: 'hidden',
            }}
            variant="body2"
          />
          {this.state.isExpandable && (
            <Button
              className="forum-post-expand-button"
              color="primary"
              onClick={(event) => {
                event.persist();
                this.setState((oldState) => ({
                  isExpanded: !oldState.isExpanded,
                }));
              }}
              style={styles.expandButton}
            >
              {this.state.isExpanded ? (
                <FormattedMessage {...translations.showLess} />
              ) : (
                <FormattedMessage {...translations.showMore} />
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
}

ForumPost.propTypes = {
  post: PropTypes.shape({
    text: PropTypes.string,
    userName: PropTypes.string,
    avatar: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  isExpandable: PropTypes.bool,
  style: PropTypes.object,
};
