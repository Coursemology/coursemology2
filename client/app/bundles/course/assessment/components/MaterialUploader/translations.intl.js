import { defineMessages } from 'react-intl';

const translations = defineMessages({
  deleteSuccess: {
    id: 'course.assessment.materialList.deleteSuccess',
    defaultMessage: '"{name}" was deleted.',
  },
  deleteFail: {
    id: 'course.assessment.materialList.deleteFail',
    defaultMessage: 'Failed to delete "{name}", please try again.',
  },
  uploadFail: {
    id: 'course.assessment.materialList.uploadFail',
    defaultMessage: 'Failed to upload materials.',
  },
});

export default translations;
