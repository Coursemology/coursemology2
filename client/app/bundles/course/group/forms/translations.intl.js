import { defineMessages } from 'react-intl';

const translations = defineMessages({
  name: {
    id: 'course.group.form.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'course.group.form.description',
    defaultMessage: 'Description (Optional)',
  },
  nameLength: {
    id: 'course.group.form.nameLength',
    defaultMessage: 'The name is too long!',
  },
  prefix: {
    id: 'course.group.form.prefix',
    defaultMessage: 'Prefix',
  },
  numToCreate: {
    id: 'course.group.form.numToCreate',
    defaultMessage: 'Number to Create',
  },
  numToCreateMin: {
    id: 'course.group.form.numToCreateMin',
    defaultMessage: 'Minimum 2',
  },
  numToCreateMax: {
    id: 'course.group.form.numToCreateMax',
    defaultMessage: 'Maximum 50',
  },
});

export default translations;
