/* eslint-disable camelcase */
import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Element } from 'react-scroll';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import { grey50 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

import moment, { longDate } from 'lib/moment';

import LessonPlanItem from './LessonPlanItem';
import MilestoneAdminTools from './MilestoneAdminTools';

const translations = defineMessages({
  ungroupedItems: {
    id: 'course.lessonPlan.LessonPlanGroup.ungroupedItems',
    defaultMessage: 'Ungrouped Items',
  },
  noItems: {
    id: 'course.lessonPlan.LessonPlanGroup.noItems',
    defaultMessage: 'No items for this milestone.',
  },
});

const styles = {
  card: {
    marginTop: 20,
  },
  cardContainer: {
    paddingBottom: 0,
  },
  milestoneTitle: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  items: {
    padding: 0,
  },
  divider: {
    height: 2,
  },
};

class LessonPlanGroup extends Component {
  static renderMilestoneCardTitle(milestone) {
    const { title, description, start_at } = milestone;

    return (
      <CardTitle
        actAsExpander={true}
        showExpandableButton={true}
        style={{ backgroundColor: grey50 }}
        subtitle={
          <span>
            {moment(start_at).format(longDate)}
            <br />
            <span dangerouslySetInnerHTML={{ __html: description }} />
          </span>
        }
        title={
          <div style={styles.milestoneTitle}>
            {title}
            <MilestoneAdminTools milestone={milestone} />
          </div>
        }
      />
    );
  }

  static renderNoItemsMessage() {
    return (
      <>
        <Divider style={styles.divider} />
        <CardText>
          <FormattedMessage {...translations.noItems} />
        </CardText>
      </>
    );
  }

  renderDefaultMilestone() {
    const {
      group: { items },
    } = this.props;
    return LessonPlanGroup.renderMilestoneCardTitle({
      id: null,
      title: <FormattedMessage {...translations.ungroupedItems} />,
      description: null,
      start_at: items[0].start_at,
    });
  }

  render() {
    const {
      initiallyExpanded,
      group: { id, milestone, items },
    } = this.props;
    if (!milestone && items.length < 1) {
      return null;
    }

    return (
      <Element name={id}>
        <Card
          containerStyle={styles.cardContainer}
          initiallyExpanded={initiallyExpanded}
          style={styles.card}
        >
          {milestone
            ? LessonPlanGroup.renderMilestoneCardTitle(milestone)
            : this.renderDefaultMilestone()}
          <CardText expandable={true} style={styles.items}>
            {items.length > 0
              ? items.map((item) => (
                  <LessonPlanItem key={item.id} {...{ item }} />
                ))
              : LessonPlanGroup.renderNoItemsMessage()}
          </CardText>
        </Card>
      </Element>
    );
  }
}

LessonPlanGroup.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string,
    milestone: PropTypes.object,
    items: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  initiallyExpanded: PropTypes.bool,
};

export default LessonPlanGroup;
