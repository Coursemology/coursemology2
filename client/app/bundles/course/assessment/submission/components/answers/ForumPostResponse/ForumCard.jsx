import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  Button,
  Accordion,
  AccordionActions,
  AccordionSummary,
  Icon,
} from '@material-ui/core';
import { Divider } from '@mui/material';
import { cyan } from '@mui/material/colors';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
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
  AccordionSummary: {
    backgroundColor: cyan[50],
    padding: '8px 16px',
  },
  AccordionActions: {
    padding: 16,
  },
  container: {
    padding: 16,
  },
  icon: {
    marginLeft: 12,
  },
  nonLastTopicCard: {
    marginBottom: 16,
  },
};

export default class ForumCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: this.props.isExpandedOnLoad,
    };
  }

  handleIsExpandedChange = (event, isExpanded) => {
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
      <Accordion
        expanded={this.state.isExpanded}
        onChange={this.handleIsExpandedChange}
        style={this.props.style}
        className="forum-card"
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={styles.AccordionSummary}
        >
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
        </AccordionSummary>
        <Divider />
        <AccordionActions style={styles.AccordionActions}>
          <Button
            variant="contained"
            href={getForumURL(
              forumTopicPostPack.course.id,
              forumTopicPostPack.forum.id,
            )}
            style={{ marginBottom: 16 }}
            target="_blank"
          >
            <FormattedMessage {...translations.viewForumInNewTab} />
            <Icon className="fa fa-external-link" style={styles.icon} />
          </Button>
        </AccordionActions>
        <Divider />
        <div style={styles.container}>
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
        </div>
      </Accordion>
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
