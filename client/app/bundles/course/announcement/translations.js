import { defineMessages } from 'react-intl';

const translations = defineMessages({
  announcements: {
    id: 'course.announcements',
    defaultMessage: 'Announcements',
  },
  title: {
    id: 'course.announcements.fields.title',
    defaultMessage: 'Title',
  },
  content: {
    id: 'course.announcements.fields.content',
    defaultMessage: 'Content',
  },
  sticky: {
    id: 'course.announcements.fields.sticky',
    defaultMessage: 'Sticky',
  },
  start_at: {
    id: 'course.announcements.fields.start_at',
    defaultMessage: 'Start At',
  },
  end_at: {
    id: 'course.announcements.fields.end_at',
    defaultMessage: 'End At',
  },
  newButton: {
    id: 'course.announcements.newAnnouncement.label',
    defaultMessage: 'New',
  },
});

export default translations;
