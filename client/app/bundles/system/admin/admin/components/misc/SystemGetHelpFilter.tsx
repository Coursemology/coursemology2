import { FC } from 'react';
import { MessageDescriptor } from 'react-intl';

import GetHelpFilter, {
  GetHelpFilterFields,
} from 'lib/components/core/GetHelpFilter';
import translations from 'lib/translations/getHelp';

export interface SystemGetHelpFilterFields extends GetHelpFilterFields {
  course: { title: string } | null;
}

interface SystemGetHelpFilterProps {
  courseOptions: { title: string }[];
  userOptions: { name: string }[];
  selectedFilter: SystemGetHelpFilterFields;
  setSelectedFilter: (newFilter: SystemGetHelpFilterFields) => void;
  onFilterChange: (filter: SystemGetHelpFilterFields) => void;
  getDateValidationError: (
    filter: SystemGetHelpFilterFields,
    t: (msg: MessageDescriptor) => string,
  ) => string;
}

const SystemGetHelpFilter: FC<SystemGetHelpFilterProps> = ({
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

export default SystemGetHelpFilter;
