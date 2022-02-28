import React from 'react';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import moment from 'lib/moment';
import { defineMessages, FormattedMessage } from 'react-intl';

const MAX_POST_HEIGHT = 60;

export const translations = defineMessages({
  showMore: {
    id: 'course.forum.forumPost.showMore',
    defaultMessage: 'SHOW MORE',
  },
  showLess: {
    id: 'course.forum.forumPost.showLess',
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

export default class ForumPost extends React.Component {
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
          title={this.props.post.userName}
          subheader={moment(this.props.post.updatedAt).format(
            'MMM DD, YYYY h:mma',
          )}
        />
        <Divider />
        <CardContent>
          <div
            dangerouslySetInnerHTML={{ __html: this.props.post.text }}
            ref={(divElement) => {
              this.divElement = divElement;
            }}
            style={{
              height:
                this.state.isExpanded || !this.state.isExpandable
                  ? 'auto'
                  : MAX_POST_HEIGHT,
              overflow: 'hidden',
            }}
          />
          {this.state.isExpandable && (
            <>
              <Button
                color="primary"
                className="forum-post-expand-button"
                id="add-level"
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
            </>
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
