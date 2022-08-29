import { defineMessages } from 'react-intl';

const translations = defineMessages({
  newAssessment: {
    id: 'course.assessment.newAssessment',
    defaultMessage: 'New Assessment',
  },
  creationSuccess: {
    id: 'course.assessment.create.success',
    defaultMessage: 'Assessment was created.',
  },
  creationFailure: {
    id: 'course.assessment.create.fail',
    defaultMessage: 'Failed to create assessment.',
  },
  createAsDraft: {
    id: 'course.assessment.create.createAsDraft',
    defaultMessage: 'Create As Draft',
  },
});

export default translations;
