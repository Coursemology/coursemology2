import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionActions,
  AccordionSummary,
  Button,
  Divider,
} from '@mui/material';
import { cyan } from '@mui/material/colors';
import PropTypes from 'prop-types';

import {
  forumTopicPostPackShape,
  postPackShape,
} from 'course/assessment/submission/propTypes';
import Link from 'lib/components/core/Link';
import { getForumURL } from 'lib/helpers/url-builders';

import CardTitle from './CardTitle';
import TopicCard from './TopicCard';

const translations = defineMessages({
  forumCardTitleTypeNoneSelected: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumCard.forumCardTitleTypeNoneSelected',
    defaultMessage: 'Forum',
  },
  forumCardTitleTypeSelected: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumCard.forumCardTitleTypeSelected',
    defaultMessage: 'Forum ({numSelected} selected)',
  },
  viewForumInNewTab: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumCard.viewForumInNewTab',
    defaultMessage: 'View Forum',
  },
});

const styles = {
  AccordionSummary: {
    backgroundColor: cyan[50],
    padding: '8px 16px',
  },
  AccordionActions: {
    justifyContent: 'flex-start',
    padding: 16,
  },
  container: {
    padding: 16,
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
        className="forum-card"
        expanded={this.state.isExpanded}
        onChange={this.handleIsExpandedChange}
        style={this.props.style}
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
          <Link
            opensInNewTab
            to={getForumURL(
              forumTopicPostPack.course.id,
              forumTopicPostPack.forum.id,
            )}
          >
            <Button variant="contained">
              <FormattedMessage {...translations.viewForumInNewTab} />
            </Button>
          </Link>
        </AccordionActions>
        <Divider />
        <div style={styles.container}>
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
