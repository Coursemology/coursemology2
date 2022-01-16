import { defineMessages } from 'react-intl';

const translations = defineMessages({
  newGroupCategory: {
    id: 'course.assessment.newGroupCategory',
    defaultMessage: 'New Category',
  },
  name: {
    id: 'course.assessment.form.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'course.assessment.form.description',
    defaultMessage: 'Description (Optional)',
  },
  nameLength: {
    id: 'course.group.form.nameLength',
    defaultMessage: 'The category name is too long!',
  },
});

export default translations;
