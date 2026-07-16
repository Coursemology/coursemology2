import { FC } from 'react';
import {
  Card,
  CardContent,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

import TypeBadge from 'course/duplication/components/TypeBadge';

import { DestinationTab } from '../types';

interface Group {
  categoryId: number;
  categoryTitle: string;
  tabs: DestinationTab[];
}

interface DestinationTabPickerProps {
  tabs: DestinationTab[];
  value: number | null;
  onChange: (tabId: number) => void;
}

// Group tabs by category in first-seen order (the controller already emits categories then their
// tabs in display order, so this preserves that without re-sorting). Robust to a category's tabs
// arriving non-contiguously.
const groupByCategory = (tabs: DestinationTab[]): Group[] => {
  const groups: Group[] = [];
  const indexByCategory = new Map<number, number>();
  tabs.forEach((tab) => {
    const existing = indexByCategory.get(tab.categoryId);
    if (existing === undefined) {
      indexByCategory.set(tab.categoryId, groups.length);
      groups.push({
        categoryId: tab.categoryId,
        categoryTitle: tab.categoryTitle,
        tabs: [tab],
      });
    } else {
      groups[existing].tabs.push(tab);
    }
  });
  return groups;
};

const DestinationTabPicker: FC<DestinationTabPickerProps> = ({
  tabs,
  value,
  onChange,
}) => {
  const groups = groupByCategory(tabs);

  return (
    <Card>
      <CardContent className="overflow-y-auto" style={{ maxHeight: 320 }}>
        <RadioGroup
          onChange={(e): void => onChange(Number(e.target.value))}
          value={value != null ? String(value) : ''}
        >
          {groups.map((group) => (
            <div
              key={`category_${group.categoryId}`}
              className="flex flex-col items-start"
            >
              <div className="flex items-center py-2 text-xl font-bold">
                <TypeBadge dense itemType="CATEGORY" />
                {group.categoryTitle}
              </div>
              {group.tabs.map((tab) => (
                <FormControlLabel
                  key={`tab_${tab.id}`}
                  className="ml-4 text-xl"
                  control={<Radio className="py-0 px-2" />}
                  label={
                    <span className="flex items-center text-xl font-bold">
                      <TypeBadge dense itemType="TAB" />
                      {tab.title}
                    </span>
                  }
                  value={String(tab.id)}
                />
              ))}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default DestinationTabPicker;
