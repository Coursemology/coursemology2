import { FC } from 'react';

import { Tab } from 'course/duplication/types';

import TabTree from './TabTree';

interface TabTreesProps {
  tabs: Tab[];
}

const TabsTrees: FC<TabTreesProps> = (props) => {
  const { tabs } = props;
  if (tabs.length < 1) {
    return null;
  }

  return (
    <div>
      {tabs.map((tab) => (
        <TabTree key={tab.id} assessments={tab.assessments} tab={tab} />
      ))}
    </div>
  );
};

export default TabsTrees;
