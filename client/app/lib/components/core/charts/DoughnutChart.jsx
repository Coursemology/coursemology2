import { Chart, Doughnut } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';

import { INVISIBLE_CHART_COLOR } from '../../../../theme/colors';

ChartJS.register(ArcElement, Tooltip, Legend);

const plugin = {
  id: 'empty-doughnut',
  afterDraw(chart) {
    const { datasets, labels } = chart.data;
    let hasData = false;

    for (let i = 0; i < datasets.length; i += 1) {
      const dataset = datasets[i];
      hasData ||= dataset.data.length === labels.length;
    }

    if (!hasData) {
      const { ctx, width, height } = chart;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '12px "Helvetica Neue", Helvetica, Arial, sans-serif';
      // Aligns text 18 pixels from top, just like Chart.js
      ctx.fillText(chart.options?.title?.text ?? '', width / 2, 18);
      ctx.fillText('No data to display', width / 2, height / 2);
      ctx.restore();
    }
  },
};

// There is an unfortunate issue with react-chartjs-2 or chart.js, where a doughnut with
// all 0s for data will not render anything, even if you manually try to do so via callbacks
// and direct interactions with the chart object.
// As such, the solution is to render an invisible chart when all data === 0s.
// This chart will not have a corresponding label, i.e. len(data) === len(labels) + 1.
const processEmptyData = (props) => {
  const datasets = props.data?.datasets;
  if (!datasets) {
    return props;
  }
  const isEmpty = datasets.every((d) => d.data && d.data.every((x) => x === 0));
  if (!isEmpty) {
    return props;
  }
  return {
    ...props,
    data: {
      ...props.data,
      datasets: datasets.map((d) => ({
        ...d,
        backgroundColor: [...(d.backgroundColor ?? []), INVISIBLE_CHART_COLOR],
        borderColor: [...(d.borderColor ?? []), INVISIBLE_CHART_COLOR],
        data: [...(d.data ?? []), 1],
      })),
    },
  };
};

const DoughnutChart = (props) => {
  const processedProps = processEmptyData(props);
  return (
    <Doughnut
      {...processedProps}
      options={{
        ...processedProps.options,
        labels: {
          ...processedProps.labels,
          // We need to filter out the additional empty chart
          filter: (item) => item.text !== undefined,
        },
        plugins: {
          ...processedProps.plugins,
          tooltip: {
            ...(processedProps.plugins?.tooltip ?? []),
            // We need to filter out the additional empty chart
            filter: (item, _index, _array, data) =>
              data.labels[item.dataIndex] !== undefined,
          },
          emptyDoughnut: {},
        },
      }}
      plugins={[...(processedProps.plugins ?? []), plugin]}
    />
  );
};
DoughnutChart.propTypes = Chart.propTypes;

export default DoughnutChart;
