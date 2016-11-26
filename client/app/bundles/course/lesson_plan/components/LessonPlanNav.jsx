import React, { PropTypes } from 'react';
import { Affix } from 'react-overlays';
import Immutable from 'immutable';
import './LessonPlanNav.scss';

const propTypes = {
  milestones: PropTypes.instanceOf(Immutable.List).isRequired,
};

const LessonPlanNav = ({ milestones }) => (
  <Affix offsetTop={173} affixStyle={{ top: '70px' }} >
    <ul className="nav nav-pills nav-stacked">
      { milestones.map(milestone => (
        <li key={milestone.get('id')}>
          <a
            href={`#lesson-plan-milestone-${milestone.get('id')}`}
            className="lesson-plan-nav-link"
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
