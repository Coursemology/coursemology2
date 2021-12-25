import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  Card,
  CardActions,
  CardHeader,
  CardText,
  Divider,
  FontIcon,
  RaisedButton,
} from 'material-ui';
import { cyan50 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

import {
  forumTopicPostPackShape,
  postPackShape,
} from 'course/assessment/submission/propTypes';
import { getForumURL } from 'lib/helpers/url-builders';

import CardTitle from './CardTitle';
import TopicCard from './TopicCard';

const translations = defineMessages({
  forumCardTitleTypeNoneSelected: {
    id: 'course.assessment.submission.answer.forumPostResponse.forumCardTitleTypeNoneSelected',
    defaultMessage: 'Forum',
  },
  forumCardTitleTypeSelected: {
    id: 'course.assessment.submission.answer.forumPostResponse.forumCardTitleTypeSelected',
    defaultMessage: 'Forum ({numSelected} selected)',
  },
  viewForumInNewTab: {
    id: 'course.assessment.submission.answer.forumPostResponse.viewForumInNewTab',
    defaultMessage: 'View Forum',
  },
});

const styles = {
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
        className="forum-card"
        expanded={this.state.isExpanded}
        onExpandChange={this.handleIsExpandedChange}
        style={this.props.style}
      >
        <CardHeader
          actAsExpander={true}
          showExpandableButton={true}
          style={styles.cardHeader}
          title={
            <CardTitle
              title={this.props.forumTopicPostPack.forum.name}
              type={
                numPostsSelectedInForum > 0 ? (
                  <FormattedMessage
                    {...translations.forumCardTitleTypeSelected}
                    values={{
                      numSelected: numPostsSelectedInForum,
                    }}
                  />
                ) : (
                  <FormattedMessage
                    {...translations.forumCardTitleTypeNoneSelected}
                  />
                )
              }
            />
          }
        />
        <Divider />
        <CardActions expandable={true} style={styles.cardActions}>
          <RaisedButton
            href={getForumURL(
              forumTopicPostPack.course.id,
              forumTopicPostPack.forum.id,
            )}
            icon={<FontIcon className="fa fa-external-link" />}
            label={<FormattedMessage {...translations.viewForumInNewTab} />}
            labelPosition="before"
            target="_blank"
          />
        </CardActions>
        <Divider />
        <CardText expandable={true} style={styles.container}>
          {forumTopicPostPack.topicPostPacks.map((topicPostPack, index) => (
            <TopicCard
              key={`forum-topic-${topicPostPack.topic.id}`}
              courseId={this.props.forumTopicPostPack.course.id}
              forumId={this.props.forumTopicPostPack.forum.id}
              isExpandedOnLoad={this.isTopicExpandedOnFirstLoad(topicPostPack)}
              onSelectPostPack={(postPackSelected, isSelected) =>
                this.props.onSelectPostPack(postPackSelected, isSelected)
              }
              selectedPostPacks={this.props.selectedPostPacks}
              style={
                index < forumTopicPostPack.topicPostPacks.length - 1
                  ? styles.nonLastTopicCard
                  : {}
              }
              topicPostPack={topicPostPack}
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
