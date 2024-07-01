import { FC } from 'react';

import { Assessment, Tab } from 'course/duplication/types';

import AssessmentRow from './AssessmentRow';
import TabRow from './TabRow';

interface TabTreeProps {
  tab?: Tab;
  assessments: Assessment[];
}

const TabTree: FC<TabTreeProps> = (props) => {
  const { tab, assessments } = props;

  return (
    <div key={tab ? `tab_assessment_${tab.id}` : 'tab_assessment_default'}>
      <TabRow tab={tab} />
      {assessments &&
        assessments.length > 0 &&
        assessments.map((assessment) => (
          <AssessmentRow key={assessment.id} assessment={assessment} />
        ))}
    </div>
  );
};

export default TabTree;
