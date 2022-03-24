import { defineMessages } from 'react-intl';

const translations = defineMessages({
  deleteFail: {
    id: 'course.assessment.materialList.deleteFail',
    defaultMessage: 'Failed to delete "{name}", please try again.',
  },
  deleteSuccess: {
    id: 'course.assessment.materialList.deleteSuccess',
    defaultMessage: '"{name}" was deleted.',
  },
  uploadFail: {
    id: 'course.assessment.materialList.uploadFail',
    defaultMessage: 'Failed to upload materials.',
  },
});

export default translations;
