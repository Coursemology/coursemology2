import { defineMessages } from 'react-intl';

const translations = defineMessages({
  deleteSuccess: {
    id: 'course.assessment.FileManager.deleteSuccess',
    defaultMessage: '"{name}" was deleted.',
  },
  deleteFail: {
    id: 'course.assessment.FileManager.deleteFail',
    defaultMessage: 'Failed to delete "{name}", please try again.',
  },
  uploadFail: {
    id: 'course.assessment.FileManager.uploadFail',
    defaultMessage: 'Failed to upload materials.',
  },
  addFiles: {
    id: 'course.assessment.FileManager.addFiles',
    defaultMessage: 'Add Files',
  },
  deleteSelected: {
    id: 'course.assessment.FileManager.deleteSelected',
    defaultMessage: 'Delete Selected',
  },
  fileName: {
    id: 'course.assessment.FileManager.fileName',
    defaultMessage: 'File name',
  },
  dateAdded: {
    id: 'course.assessment.FileManager.dateAdded',
    defaultMessage: 'Date added',
  },
  uploadingFile: {
    id: 'course.assessment.FileManager.uploadingFile',
    defaultMessage: 'Uploading file...',
  },
  disableNewFile: {
    id: 'course.assessment.FileManager.disableNewFile',
    defaultMessage:
      'You cannot add new files because the Materials component is disabled in Course Settings.',
  },
  studentCannotSeeFiles: {
    id: 'course.assessment.FileManager.studentCannotSeeFiles',
    defaultMessage:
      'Students cannot see these files because the Materials component is disabled in Course Settings.',
  },
});

export default translations;
