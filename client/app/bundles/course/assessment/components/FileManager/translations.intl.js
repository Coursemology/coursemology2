import { defineMessages } from 'react-intl';

const translations = defineMessages({
  deleteSuccess: {
    id: 'course.assessment.fileManager.deleteSuccess',
    defaultMessage: '"{name}" was deleted.',
  },
  deleteFail: {
    id: 'course.assessment.fileManager.deleteFail',
    defaultMessage: 'Failed to delete "{name}", please try again.',
  },
  uploadFail: {
    id: 'course.assessment.fileManager.uploadFail',
    defaultMessage: 'Failed to upload materials.',
  },
  addFiles: {
    id: 'course.assessment.fileManager.addFiles',
    defaultMessage: 'Add Files',
  },
  deleteSelected: {
    id: 'course.assessment.fileManager.deleteSelected',
    defaultMessage: 'Delete Selected',
  },
  fileName: {
    id: 'course.assessment.fileManager.fileName',
    defaultMessage: 'File name',
  },
  dateAdded: {
    id: 'course.assessment.fileManager.dateAdded',
    defaultMessage: 'Date added',
  },
  uploadingFile: {
    id: 'course.assessment.fileManager.uploadingFile',
    defaultMessage: 'Uploading file...',
  },
  disableNewFile: {
    id: 'course.assessment.fileManager.disableNewFile',
    defaultMessage:
      'You cannot add new files because the Materials component is disabled in Course Settings.',
  },
});

export default translations;
