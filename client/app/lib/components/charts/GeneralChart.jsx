import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  TimeScale,
  Title,
  Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-moment';
import emptyChartPlugin from './emptyChartPlugin';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  TimeScale,
  Title,
  Filler,
  zoomPlugin,
);

const addZoomToProps = (props, limits) => ({
  ...props,
  options: {
    ...props.options,
    plugins: {
      ...props.options?.plugins,
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
        limits: {
          x: limits,
        },
      },
    },
  },
});

const GeneralChart = ({ withZoom = false, limits = {}, ...props }) => {
  let finalProps = props;
  if (withZoom) {
    finalProps = addZoomToProps(finalProps, limits);
  }
  return (
    <Chart
      {...finalProps}
      plugins={[...(finalProps.plugins ?? []), emptyChartPlugin]}
    />
  );
};

GeneralChart.propTypes = {
  withZoom: PropTypes.bool,
  limits: PropTypes.shape({
    min: PropTypes.object,
    max: PropTypes.object,
  }),
  ...Chart.propTypes,
};

export default GeneralChart;
