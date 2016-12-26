import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { scroller } from 'react-scroll';
import styles from './LessonPlan.scss';
import LessonPlanNav from '../components/LessonPlanNav';
import LessonPlanFilter from '../components/LessonPlanFilter';
import LessonPlanGroup from '../components/LessonPlanGroup';
import LessonPlanEmpty from '../components/LessonPlanEmpty';

const propTypes = {
  milestones: PropTypes.instanceOf(Immutable.List).isRequired,
  items: PropTypes.instanceOf(Immutable.List).isRequired,
  hiddenItemTypes: PropTypes.instanceOf(Immutable.List).isRequired,
  toggleItemTypeVisibility: PropTypes.func.isRequired,
  milestoneGroups: PropTypes.array.isRequired,
};

class LessonPlan extends React.Component {
  componentDidMount() {
    const lastMilestone = this.lastPastMilestone();
    if (lastMilestone) {
      scroller.scrollTo(`milestone-group-${lastMilestone.get('id')}`, {
        duration: 200,
        delay: 100,
        smooth: true,
        offset: -100,
      });
    }
  }

  /**
   * Returns the last milestone that has passed.
   */
  lastPastMilestone() {
    const { milestones } = this.props;
    const dateNow = Date.now();
    return milestones.takeUntil(milestone => Date.parse(milestone.get('start_at')) > dateNow).last();
  }

  renderLessonPlan() {
    const {
      milestones,
      items,
      milestoneGroups,
      hiddenItemTypes,
      toggleItemTypeVisibility,
    } = this.props;

    return (
      <div className={styles.mainPanel}>
        {
          milestoneGroups.map(group =>
            <LessonPlanGroup
              key={group.milestone.get('id')}
              milestone={group.milestone}
              items={group.items}
            />
          )
        }
        <div className={styles.navContainer}>
          <LessonPlanNav {...{ milestones }} />
          <LessonPlanFilter
            {...{
              toggleItemTypeVisibility,
              hiddenItemTypes,
              items,
            }}
          />
        </div>
      </div>
    );
  }

  render() {
    const { milestones, items } = this.props;

    return (
      milestones.size > 0 || items.size > 0 ?
      this.renderLessonPlan() :
      <LessonPlanEmpty />
    );
  }
}

LessonPlan.propTypes = propTypes;

export default LessonPlan;
