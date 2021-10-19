import React from 'react';
import PropTypes from 'prop-types';

import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import Divider from 'material-ui/Divider';

import { forumTopicPostPackShape } from 'course/assessment/submission/propTypes';
import { getForumURL } from 'lib/helpers/url-builders';
import Topic from './Topic';
import Chip from './Chip';

const styles = {
  card: {
    border: '1px solid #888',
    boxShadow: 'none',
    marginBottom: 12,
  },
  container: {
    display: 'table',
    width: '100%',
  },
  topicTitle: {
    backgroundColor: '#BBDEFB',
    paddingTop: 3,
    paddingBottom: 3,
  },
  topicTitleText: {
    fontSize: 15,
    margin: 0,
  },
};

export default class Forum extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: this.props.isExpanded,
    };
  }

  handleIsExpandedChange = (isExpanded) => {
    this.setState({ isExpanded });
  };

  isExpanded(topicPostPack) {
    let matched = false;
    topicPostPack.postPacks.forEach((postPack) => {
      if (this.props.selectedPostIds.includes(postPack.corePost.id)) {
        matched = true;
      }
    });
    return matched;
  }

  renderTitle() {
    return (
      <div>
        <Chip text="Forum" />
        {this.props.forumTopicPostPack.forum.name}
      </div>
    );
  }

  render() {
    const { forumTopicPostPack } = this.props;
    return (
      <div>
        <Card
          expanded={this.state.isExpanded}
          onExpandChange={this.handleIsExpandedChange}
          style={styles.card}
        >
          <CardTitle
            title={this.renderTitle()}
            actAsExpander
            showExpandableButton
            style={styles.topicTitle}
            titleStyle={styles.topicTitleText}
          />
          <Divider />
          <CardActions expandable>
            <FlatButton
              label="View all topics in forum"
              href={getForumURL(
                forumTopicPostPack.course.id,
                forumTopicPostPack.forum.id,
              )}
              target="_blank"
              backgroundColor="#FFF8E1"
              labelPosition="before"
              primary
              icon={<FontIcon className="fa fa-external-link" />}
            />
          </CardActions>
          <Divider />
          <CardText expandable>
            <div style={styles.container}>
              {forumTopicPostPack?.topicPostPacks.map((topicPostPack) => (
                <Topic
                  topicPostPack={topicPostPack}
                  selectedPostIds={this.props.selectedPostIds}
                  courseId={this.props.forumTopicPostPack.course.id}
                  forumId={this.props.forumTopicPostPack.forum.id}
                  onSelectPostPack={(postPackSelected, isSelected) =>
                    this.props.onSelectPostPack(postPackSelected, isSelected)
                  }
                  isExpanded={this.isExpanded(topicPostPack)}
                  key={topicPostPack.topic.id}
                />
              ))}
            </div>
          </CardText>
        </Card>
      </div>
    );
  }
}

Forum.propTypes = {
  forumTopicPostPack: forumTopicPostPackShape,
  selectedPostIds: PropTypes.arrayOf(PropTypes.number),
  onSelectPostPack: PropTypes.func,
  isExpanded: PropTypes.bool,
};
