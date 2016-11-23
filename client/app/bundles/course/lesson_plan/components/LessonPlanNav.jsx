import React, { PropTypes } from 'react';
import { Affix } from 'react-overlays';
import Immutable from 'immutable';
import './LessonPlanNav.scss';

const propTypes = {
  milestones: PropTypes.instanceOf(Immutable.List).isRequired,
};

// Need `data-turbolinks="false"` because of this issue:
//     https://github.com/turbolinks/turbolinks/issues/75
const LessonPlanNav = ({ milestones }) => (
  <Affix offsetTop={173} affixStyle={{ top: '70px' }} >
    <ul className="nav nav-pills nav-stacked">
      { milestones.map(milestone => (
        <li key={milestone.get('id')}>
          <a
            href={`#lesson-plan-milestone-${milestone.get('id')}`}
            className="lesson-plan-nav-link"
            data-turbolinks="false"
          >
            { milestone.get('title') }
          </a>
        </li>
      )) }
    </ul>
  </Affix>
);

LessonPlanNav.propTypes = propTypes;

export default LessonPlanNav;
