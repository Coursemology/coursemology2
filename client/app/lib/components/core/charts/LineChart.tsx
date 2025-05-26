import { Chart } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

interface LineChartProps {
  data: ChartData<'line'>;
  options: ChartOptions<'line'>;
}

const LineChart = ({ data, options }: LineChartProps): JSX.Element => (
  <Chart data={data} options={options} type="line" />
);

export default LineChart;
