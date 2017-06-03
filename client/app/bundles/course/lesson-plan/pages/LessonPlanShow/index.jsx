import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { scroller } from 'react-scroll';
import moment from 'lib/moment';
import LessonPlanGroup from './LessonPlanGroup';

class LessonPlanShow extends React.Component {
  static propTypes = {
    groups: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      milestone: PropTypes.object,
      items: PropTypes.array,
    })).isRequired,
  }

  componentDidMount() {
    let currentGroupId = null;
    this.props.groups.some((group) => {
      if (!group.milestone || moment(group.milestone.start_at).isSameOrBefore()) {
        currentGroupId = group.id;
        return false;
      }
      return true;
    });

    if (currentGroupId) {
      scroller.scrollTo(currentGroupId, {
        duration: 200,
        delay: 100,
        smooth: true,
        offset: -100,
      });
    }
  }

  render() {
    return (
      <div>
        {this.props.groups.map(group => (
          <LessonPlanGroup
            key={group.id}
            group={group}
          />
        ))}
      </div>
    );
  }
}

export default connect(state => ({
  groups: state.groups,
}))(LessonPlanShow);
