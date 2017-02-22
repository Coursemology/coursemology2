import { defineMessages } from 'react-intl';

const translations = defineMessages({
  title: {
    id: 'course.conditions.title',
    defaultMessage: 'Conditions',
  },
  type: {
    id: 'course.conditions.type',
    defaultMessage: 'Type',
  },
  description: {
    id: 'course.conditions.description',
    defaultMessage: 'Description',
  },
  empty: {
    id: 'course.conditions.empty',
    defaultMessage: 'No conditions added',
  },
  deleteConfirm: {
    id: 'course.conditions.deleteConfirm',
    defaultMessage: 'Are you sure that you want to delete the condition?',
  },
});

export default translations;
