import { useMemo } from 'react';
import { color } from 'chart.js/helpers';
import PropTypes from 'prop-types';

import MatrixChart from 'lib/components/charts/MatrixChart';
import { processLearningRateRecordsIntoChartData } from './utils';
import { learningRateRecordShape } from './propTypes';

const LearningRateMatrixChart = ({ learningRateRecords }) => {
  if (learningRateRecords.length === 0) {
    return 'No Data';
  }
  const [chartData, numX, numY] = useMemo(
    () => processLearningRateRecordsIntoChartData(learningRateRecords),
    [learningRateRecords],
  );

  const data = {
    datasets: [
      {
        label: 'Learning Rates',
        data: chartData,
        backgroundColor(c) {
          const value = c.dataset.data[c.dataIndex].v;
          const alpha = (10 + value) / 60;
          return color('green').alpha(alpha).rgbString();
        },
        borderColor(c) {
          const value = c.dataset.data[c.dataIndex].v;
          const alpha = (10 + value) / 60;
          return color('green').alpha(alpha).darken(0.3).rgbString();
        },
        borderWidth: 1,
        hoverBackgroundColor: 'yellow',
        hoverBorderColor: 'yellowgreen',
        width(c) {
          const a = c.chart.chartArea || {};
          return (a.right - a.left) / numX - 1;
        },
        height(c) {
          const a = c.chart.chartArea || {};
          return (a.bottom - a.top) / numY - 1;
        },
      },
    ],
  };

  const scales = {
    y: {
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        padding: 1,
        font: {
          size: 9,
        },
      },
      grid: {
        display: false,
        drawBorder: false,
        tickLength: 0,
      },
    },
    x: {
      type: 'time',
      position: 'bottom',
      offset: true,
      time: {
        unit: 'day',
        round: 'day',
        isoWeekday: 1,
        displayFormats: {
          week: 'MMM dd',
        },
        tooltipFormat: 'YYYY-MM-DD',
      },
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        font: {
          size: 9,
        },
      },
      grid: {
        display: false,
        drawBorder: false,
        tickLength: 0,
      },
    },
  };

  const options = {
    aspectRatio: 5,
    plugins: {
      legend: false,
      tooltip: {
        displayColors: false,
        callbacks: {
          title(contexts) {
            return `${contexts[0].label}`;
          },
          label(context) {
            const v = context.dataset.data[context.dataIndex];
            return [
              `Learning Rate Range: ${v.y}% - ${v.y + 10}%`,
              `Number of Students: ${v.v} `,
            ];
          },
        },
      },
    },
    scales,
    layout: {
      padding: {
        top: 10,
      },
    },
  };
  return <MatrixChart data={data} options={options} />;
};

LearningRateMatrixChart.propTypes = {
  learningRateRecords: PropTypes.arrayOf(learningRateRecordShape),
};

export default LearningRateMatrixChart;
