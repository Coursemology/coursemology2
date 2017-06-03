import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { Element } from 'react-scroll';
import Paper from 'material-ui/Paper';
import LessonPlanItem from './LessonPlanItem';
import LessonPlanMilestone from './LessonPlanMilestone';

const translations = defineMessages({
  ungroupedItems: {
    id: 'course.lessonPlan.LessonPlanGroup.ungroupedItems',
    defaultMessage: 'Ungrouped Items',
  },
});

class LessonPlanGroup extends React.Component {
  static propTypes = {
    group: PropTypes.shape({
      id: PropTypes.string,
      milestone: PropTypes.object,
      items: PropTypes.array,
    }).isRequired,

    intl: intlShape.isRequired,
  }

  static renderMilestone(milestone) {
    return (
      <LessonPlanMilestone
        id={milestone.id}
        title={milestone.title}
        description={milestone.description}
        startAt={milestone.start_at}
        editPath={milestone.edit_path}
        deletePath={milestone.delete_path}
      />
    );
  }

  renderDefaultMilestone() {
    const { intl, group: { items } } = this.props;
    return (
      <LessonPlanMilestone
        title={intl.formatMessage(translations.ungroupedItems)}
        startAt={items[0].start_at}
      />
    );
  }

  render() {
    const { group: { id, milestone, items } } = this.props;
    return (
      <Element name={id}>
        { milestone ? LessonPlanGroup.renderMilestone(milestone) : this.renderDefaultMilestone() }
        <Paper>
          { items.map(item => <LessonPlanItem key={item.id} {...{ item }} />) }
        </Paper>
      </Element>
    );
  }
}

export default injectIntl(LessonPlanGroup);
