import { Chart, ChartProps } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { LimitOptions } from 'chartjs-plugin-zoom/types/options';

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

export type GeneralChartOptions = ChartOptions;

interface Props extends ChartProps {
  withZoom?: boolean;
  limits?: LimitOptions;
}

const addZoomToProps = (
  props: ChartProps,
  limits: LimitOptions,
): ChartProps => ({
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

const GeneralChart = ({
  withZoom = false,
  limits = {},
  ...props
}: Props): JSX.Element => {
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

export default GeneralChart;
