import * as colors from '@mui/material/colors';
import { blue, green, grey, yellow, red } from '@mui/material/colors';
import { workflowStates } from '../bundles/course/assessment/submission/constants';
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
    light: '#F1FBFC',
    dark: '#007489',
  },
  warning: {
    contrastText: white,
    main: '#E69F22',
    light: '#FDF8F3',
    dark: '#95591E',
  },
  status: {
    [workflowStates.Unstarted]: red[100],
    [workflowStates.Attempting]: yellow[100],
    [workflowStates.Submitted]: grey[100],
    [workflowStates.Graded]: blue[100],
    [workflowStates.Published]: green[100],
  },
  danger: {
    contrastText: white,
    main: '#ED4740',
    light: '#FEF6F6',
    dark: '#BF0E08',
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
  },
  background: {
    paper: white,
    default: '#f8fafc',
  },
  contrastThreshold: 3,
  tonalOffset: 0.1,
};

export default palette;
