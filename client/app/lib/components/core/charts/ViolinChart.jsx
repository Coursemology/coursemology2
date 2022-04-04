import { Chart } from 'react-chartjs-2';
import { BoxPlotController } from '@sgratzl/chartjs-chart-boxplot';
import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

import emptyChartPlugin from './emptyChartPlugin';

ChartJS.register(
  BoxPlotController,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

// This helps to trigger the empty chart message when all datasets are empty
const processEmptyData = (props) => {
  const datasets = props.data?.datasets;
  if (!datasets) {
    return props;
  }
  const isEmpty = datasets.every(
    (d) => d.data && d.data.every((x) => x.length === 0),
  );
  if (!isEmpty) {
    return props;
  }
  return {
    ...props,
    data: {
      ...props.data,
      datasets: datasets.map((d) => ({
        ...d,
        data: [],
      })),
    },
  };
};

const ViolinChart = (props) => {
  const processedProps = processEmptyData(props);
  return (
    <Chart
      type="violin"
      {...processedProps}
      plugins={[...(processedProps.plugins ?? []), emptyChartPlugin]}
    />
  );
};

ViolinChart.propTypes = Chart.propTypes;

export default ViolinChart;
