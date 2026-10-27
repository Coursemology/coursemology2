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
  Plugin,
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
  /** Inline plugins for this chart only. Keep the array stable (e.g. useMemo) across renders. */
  plugins?: Plugin<'line'>[];
}

const LineChart = ({ data, options, plugins }: LineChartProps): JSX.Element => (
  <Chart data={data} options={options} plugins={plugins} type="line" />
);

export default LineChart;
