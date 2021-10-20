import React from 'react';
import PropTypes from 'prop-types';
import {
  RaisedButton,
  FontIcon,
  Card,
  CardText,
  CardActions,
  CardHeader,
  Divider,
} from 'material-ui';
import { cyan50 } from 'material-ui/styles/colors';

import {
  forumTopicPostPackShape,
  postPackShape,
} from 'course/assessment/submission/propTypes';
import { getForumURL } from 'lib/helpers/url-builders';

import TopicCard from './TopicCard';
import CardTitle from './CardTitle';

const styles = {
  card: {},
  cardHeader: {
    backgroundColor: cyan50,
    padding: '8px 16px',
  },
  cardActions: {
    padding: 16,
  },
  container: {
    paddingBottom: 8, // As there is already some bottom padding from the last topic card
  },
  nonLastTopicCard: {
    marginBottom: 16,
  },
};

export default class ForumCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: this.props.isExpandedOnLoad,
    };
  }

  handleIsExpandedChange = (isExpanded) => {
    this.setState({ isExpanded });
  };

  isTopicExpandedOnFirstLoad(topicPostPack) {
    const postPackIds = new Set(
      this.props.selectedPostPacks.map((pack) => pack.corePost.id),
    );
    return topicPostPack.postPacks.some((postPack) =>
      postPackIds.has(postPack.corePost.id),
    );
  }

  render() {
    const { forumTopicPostPack } = this.props;
    const postPackIds = new Set(
      this.props.selectedPostPacks.map((pack) => pack.corePost.id),
    );
    const numPostsSelectedInForum = forumTopicPostPack.topicPostPacks
      .flatMap((topicPostPack) => topicPostPack.postPacks)
      .filter((pack) => postPackIds.has(pack.corePost.id)).length;

    return (
      <Card
        expanded={this.state.isExpanded}
        onExpandChange={this.handleIsExpandedChange}
        style={{ ...styles.card, ...this.props.style }}
      >
        <CardHeader
          title={
            <CardTitle
              title={this.props.forumTopicPostPack.forum.name}
              type={`Forum${
                numPostsSelectedInForum > 0
                  ? ` (${numPostsSelectedInForum} selected)`
                  : ''
              }`}
            />
          }
          actAsExpander
          showExpandableButton
          style={styles.cardHeader}
        />
        <Divider />
        <CardActions expandable style={styles.cardActions}>
          <RaisedButton
            label="View forum"
            href={getForumURL(
              forumTopicPostPack.course.id,
              forumTopicPostPack.forum.id,
            )}
            target="_blank"
            labelPosition="before"
            icon={<FontIcon className="fa fa-external-link" />}
          />
        </CardActions>
        <Divider />
        <CardText expandable style={styles.container}>
          {forumTopicPostPack.topicPostPacks.map((topicPostPack, index) => (
            <TopicCard
              topicPostPack={topicPostPack}
              selectedPostPacks={this.props.selectedPostPacks}
              courseId={this.props.forumTopicPostPack.course.id}
              forumId={this.props.forumTopicPostPack.forum.id}
              onSelectPostPack={(postPackSelected, isSelected) =>
                this.props.onSelectPostPack(postPackSelected, isSelected)
              }
              isExpandedOnLoad={this.isTopicExpandedOnFirstLoad(topicPostPack)}
              key={`forum-topic-${topicPostPack.topic.id}`}
              style={
                index < forumTopicPostPack.topicPostPacks.length - 1
                  ? styles.nonLastTopicCard
                  : {}
              }
            />
          ))}
        </CardText>
      </Card>
    );
  }
}

ForumCard.propTypes = {
  forumTopicPostPack: forumTopicPostPackShape.isRequired,
  selectedPostPacks: PropTypes.arrayOf(postPackShape).isRequired,
  onSelectPostPack: PropTypes.func.isRequired,
  isExpandedOnLoad: PropTypes.bool.isRequired,
  style: PropTypes.object,
};
