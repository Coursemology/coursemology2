import { defineMessages } from 'react-intl';

const translations = defineMessages({
  zoomIn: {
    id: 'course.learningMap.zoomIn',
    defaultMessage: 'Zoom In',
  },
  zoomOut: {
    id: 'course.learningMap.zoomOut',
    defaultMessage: 'Zoom Out',
  },
  addCondition: {
    id: 'course.learningMap.addCondition',
    defaultMessage: 'Add condition to:',
  },
  summaryGateContent: {
    id: 'course.learningMap.summaryGateContent',
    defaultMessage: '{numerator}/{denominator}',
  },
  unlockLevel: {
    id: 'course.learningMap.unlockLevel',
    defaultMessage: 'Level {unlockLevel}',
  },
  unlockRate: {
    id: 'course.learningMap.unlockRate',
    defaultMessage: '{unlockRate}%',
  },
  conditionDeletionConfirmation: {
    id: 'course.learningMap.conditionDeletionConfirmation',
    defaultMessage: 'Are you sure that you want to delete this condition?',
  },
  toggleSatisfiabilityType: {
    id: 'course.learningMap.toggleSatisfiabilityType',
    defaultMessage: 'Toggle satisfiability type to {satisfiabilityType}',
  },
  deleteCondition: {
    id: 'course.learningMap.deleteCondition',
    defaultMessage: 'Delete this condition',
  },
  defaultDashboardMessage: {
    id: 'course.learningMap.defaultDashboardMessage',
    defaultMessage: 'Learning Map',
  },
  selectedArrowDashboardMessage: {
    id: 'course.learningMap.selectedArrowDashboardMessage',
    defaultMessage: 'Selected condition: {fromNode} --> {toNode}',
  },
  selectedGateDashboardMessage: {
    id: 'course.learningMap.selectedGateDashboardMessage',
    defaultMessage: 'Selected gate for: {node}',
  },
  responseDashboardMessage: {
    id: 'course.learningMap.responseDashboardMessage',
    defaultMessage: '{responseMessage}',
  },
});

export default translations;
