import { FC } from 'react';
import { MessageDescriptor } from 'react-intl';

import GetHelpFilter, {
  GetHelpFilterFields,
} from 'lib/components/core/GetHelpFilter';
import translations from 'lib/translations/getHelp';

export interface CourseGetHelpFilterFields extends GetHelpFilterFields {
  assessment: { title: string } | null;
}

interface CourseGetHelpFilterProps {
  assessmentOptions: { title: string }[];
  userOptions: { name: string }[];
  selectedFilter: CourseGetHelpFilterFields;
  setSelectedFilter: (newFilter: CourseGetHelpFilterFields) => void;
  onFilterChange?: (filter: CourseGetHelpFilterFields) => void;
  getDateValidationError: (
    filter: CourseGetHelpFilterFields,
    t: (msg: MessageDescriptor) => string,
  ) => string;
}

const CourseGetHelpFilter: FC<CourseGetHelpFilterProps> = ({
  assessmentOptions,
  ...props
}) => (
  <GetHelpFilter
    {...props}
    primaryField={{
      label: translations.filterAssessmentLabel,
      options: assessmentOptions,
      value: props.selectedFilter.assessment,
      setValue: (filter, value) => ({ ...filter, assessment: value }),
    }}
  />
);

export default CourseGetHelpFilter;
