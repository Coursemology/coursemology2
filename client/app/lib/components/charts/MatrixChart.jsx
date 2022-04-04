import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  TimeScale,
  Tooltip,
} from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-moment';

ChartJS.register(
  Tooltip,
  Legend,
  LinearScale,
  TimeScale,
  MatrixController,
  MatrixElement,
);

const MatrixChart = (props) => <Chart type="matrix" {...props} />;

MatrixChart.propTypes = Chart.propTypes;

export default MatrixChart;
