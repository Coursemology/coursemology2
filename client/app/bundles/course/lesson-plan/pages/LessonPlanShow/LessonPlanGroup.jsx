/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Element } from 'react-scroll';
import Divider from 'material-ui/Divider';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import { grey50 } from 'material-ui/styles/colors';
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

class LessonPlanGroup extends React.Component {
  static propTypes = {
    group: PropTypes.shape({
      id: PropTypes.string,
      milestone: PropTypes.object,
      items: PropTypes.arrayOf({}),
    }).isRequired,
    initiallyExpanded: PropTypes.bool,
  }

  static renderMilestoneCardTitle(milestone) {
    const { title, description, start_at } = milestone;

    return (
      <CardTitle
        actAsExpander
        showExpandableButton
        title={(
          <div style={styles.milestoneTitle}>
            { title }
            <MilestoneAdminTools milestone={milestone} />
          </div>
)}
        subtitle={(
          <span>
            { moment(start_at).format(longDate) }
            <br />
            <span dangerouslySetInnerHTML={{ __html: description }} />
          </span>
)}
        style={{ backgroundColor: grey50 }}
      />
    );
  }

  static renderNoItemsMessage() {
    return (
      <>
        <Divider style={styles.divider} />
        <CardText><FormattedMessage {...translations.noItems} /></CardText>
      </>
    );
  }

  renderDefaultMilestone() {
    const { group: { items } } = this.props;
    return LessonPlanGroup.renderMilestoneCardTitle({
      id: null,
      title: <FormattedMessage {...translations.ungroupedItems} />,
      description: null,
      start_at: items[0].start_at,
    });
  }

  render() {
    const { initiallyExpanded, group: { id, milestone, items } } = this.props;
    if (!milestone && items.length < 1) { return null; }

    return (
      <Element name={id}>
        <Card
          initiallyExpanded={initiallyExpanded}
          style={styles.card}
          containerStyle={styles.cardContainer}
        >
          {
            milestone
              ? LessonPlanGroup.renderMilestoneCardTitle(milestone)
              : this.renderDefaultMilestone()
          }
          <CardText expandable style={styles.items}>
            {
              items.length > 0
                ? items.map(item => <LessonPlanItem key={item.id} {...{ item }} />)
                : LessonPlanGroup.renderNoItemsMessage()
            }
          </CardText>
        </Card>
      </Element>
    );
  }
}

export default LessonPlanGroup;
