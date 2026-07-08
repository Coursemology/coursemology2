import { FC } from 'react';
import { MessageDescriptor } from 'react-intl';

import GetHelpFilter, {
  GetHelpFilterFields,
} from 'lib/components/core/GetHelpFilter';
import translations from 'lib/translations/getHelp';

export interface InstanceGetHelpFilterFields extends GetHelpFilterFields {
  course: { title: string } | null;
}

interface InstanceGetHelpFilterProps {
  courseOptions: { title: string }[];
  userOptions: { name: string }[];
  selectedFilter: InstanceGetHelpFilterFields;
  setSelectedFilter: (newFilter: InstanceGetHelpFilterFields) => void;
  onFilterChange?: (filter: InstanceGetHelpFilterFields) => void;
  getDateValidationError: (
    filter: InstanceGetHelpFilterFields,
    t: (msg: MessageDescriptor) => string,
  ) => string;
}

const InstanceGetHelpFilter: FC<InstanceGetHelpFilterProps> = ({
  courseOptions,
  ...props
}) => (
  <GetHelpFilter
    {...props}
    primaryField={{
      label: translations.filterCourseLabel,
      options: courseOptions,
      value: props.selectedFilter.course,
      setValue: (filter, value) => ({ ...filter, course: value }),
    }}
  />
);

export default InstanceGetHelpFilter;
