import * as colors from '@mui/material/colors';

import {
  dueInStates,
  workflowStates,
} from '../bundles/course/assessment/submission/constants';
import { groupRole } from '../bundles/course/group/constants';

import { black, white } from './colors';

const palette = {
  common: {
    white,
    black,
    neutral: '#E4E7EB',
  },
  primary: {
    contrastText: white,
    main: '#00BCD4',
    // light: '#4ebaaa',
    // dark: '#005b4f',
  },
  secondary: {
    contrastText: white,
    main: '#FF4081',
    // light: '#90badf',
    // dark: '#305d7e',
  },
  error: {
    contrastText: white,
    main: '#FF5263',
    light: '#ffedef',
    dark: '',
  },
  success: {
    contrastText: white,
    main: '#45B880',
    light: '#F1FAF5',
    dark: '#00783E',
  },
  info: {
    contrastText: white,
    main: '#1070CA',
    // light: '#F1FBFC',
    // dark: '#007489',
  },
  warning: {
    contrastText: white,
    main: '#E69F22',
    // light: '#FDF8F3',
    // dark: '#95591E',
  },
  danger: {
    contrastText: white,
    main: '#ED4740',
    // light: '#FEF6F6',
    // dark: '#BF0E08',
  },
  discarded: {
    contrastText: black,
    main: colors.red['200'],
    light: colors.red['100'],
    dark: colors.red['300'],
  },
  text: {
    primary: '#12161B',
    secondary: '#66788A',
    disabled: '#A6B1BB',
    white: '#FFFFFF',
  },
  background: {
    paper: white,
    default: colors.grey[100],
  },
  contrastThreshold: 3,
  tonalOffset: 0.1,

  // Add custom colors below
  submissionStatus: {
    [workflowStates.Unreleased]: colors.orange[100],
    [workflowStates.Unstarted]: colors.red[100],
    [workflowStates.Attempting]: colors.yellow[100],
    [workflowStates.Submitted]: colors.grey[100],
    [workflowStates.Graded]: colors.blue[100],
    [workflowStates.Published]: colors.green[100],
  },

  dueInStatus: {
    [dueInStates.NotDue]: colors.green[100],
    [dueInStates.AlmostDue]: colors.orange[100],
    [dueInStates.OverDue]: colors.red[100],
  },

  groupRole: {
    [groupRole.Normal]: colors.green[100],
    [groupRole.Manager]: colors.red[100],
  },

  submissionIcon: {
    person: colors.blue[500],
    history: {
      none: colors.red[600],
      default: colors.blue[600],
    },
    unsubmit: colors.pink[600],
    delete: colors.red[900],
  },
  invitationStatus: {
    pending: colors.grey[100],
    accepted: colors.green[100],
  },
  links: colors.blue[800],
};

export default palette;
