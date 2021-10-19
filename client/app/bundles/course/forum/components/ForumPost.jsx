import React from 'react';
import { blueGrey50 } from 'material-ui/styles/colors';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import PropTypes from 'prop-types';

const styles = {
  forSubmission: {
    boxShadow: 0,
    backgroundColor: blueGrey50,
    border: '1px solid #B0BEC5',
  },
  replyToAnotherPost: {
    boxShadow: 0,
    border: '1px dashed #ddd',
  },
  default: {
    boxShadow: 0,
    border: '1px solid #B0BEC5',
  },
  expandButton: { color: '#03A9F4' },
};

const maxHeight = 160;

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
      isExpandable: this.props.isExpandable && renderedTextHeight > maxHeight,
      isExpanded: !this.props.isExpandable,
    });
  }

  renderStyle() {
    if (this.props.isSelectedForSubmission) {
      return styles.forSubmission;
    }

    if (this.props.isReplyToParentPost) {
      return styles.replyToAnotherPost;
    }

    return styles.default;
  }

  render() {
    return (
      <div>
        <Card style={this.renderStyle()}>
          <CardHeader
            title={this.props.post.userName}
            subtitle={this.props.post.updatedAt}
            avatar={this.props.post.avatar}
          />
          <Divider />
          <CardText>
            <div
              dangerouslySetInnerHTML={{ __html: this.props.post.text }}
              ref={(divElement) => {
                this.divElement = divElement;
              }}
              style={{
                height: this.state.isExpanded ? 'auto' : maxHeight,
                overflow: 'hidden',
              }}
            />
            {this.state.isExpandable && (
              <div style={{ paddingTop: 8 }}>
                {!this.state.isExpanded && <div style={{ height: 10 }} />}
                <button
                  type="button"
                  onClick={() =>
                    this.setState((oldState) => ({
                      isExpanded: !oldState.isExpanded,
                    }))
                  }
                  style={styles.expandButton}
                >
                  {this.state.isExpanded ? 'SHOW LESS' : 'SHOW MORE'}
                </button>
              </div>
            )}
          </CardText>
        </Card>
      </div>
    );
  }
}

ForumPost.propTypes = {
  isSelectedForSubmission: PropTypes.bool,
  post: PropTypes.shape({
    text: PropTypes.string,
    userName: PropTypes.string,
    avatar: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  isReplyToParentPost: PropTypes.bool,
  isExpandable: PropTypes.bool,
};
